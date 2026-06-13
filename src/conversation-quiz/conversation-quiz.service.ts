import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversationQuizQueryDto } from './conversation-quiz.dto';
import {
  ConversationQuizCategory,
  ConversationQuizDialogueLine,
  ConversationQuizQuestion,
} from './conversation-quiz.entity';

export interface ConversationQuizCategoryResponse {
  key: string;
  name: string;
  emoji: string | null;
  totalQuestions: number;
}

export interface ConversationQuizQuestionResponse {
  id: number;
  categoryKey: string;
  categoryName: string;
  categoryEmoji: string | null;
  speaker: string;
  prompt: string;
  choices: string[];
  correctAnswer: string;
  naturalAnswer: string;
  dialogueLines: ConversationQuizDialogueLine[];
  orderIndex: number;
}

@Injectable()
export class ConversationQuizService {
  constructor(
    @InjectRepository(ConversationQuizCategory)
    private readonly categoryRepo: Repository<ConversationQuizCategory>,
    @InjectRepository(ConversationQuizQuestion)
    private readonly questionRepo: Repository<ConversationQuizQuestion>,
  ) {}

  async getCategories(): Promise<ConversationQuizCategoryResponse[]> {
    const categories = await this.categoryRepo.find({
      order: { displayOrder: 'ASC', id: 'ASC' },
      relations: { questions: true },
    });

    return categories.map((c) => ({
      key: c.key,
      name: c.name,
      emoji: c.emoji,
      totalQuestions: c.questions?.length ?? 0,
    }));
  }

  async getQuestions(
    query: ConversationQuizQueryDto,
  ): Promise<ConversationQuizQuestionResponse[]> {
    const limit = query.limit;
    const category = await this.resolveCategory(query.categoryKey);
    if (!category) return [];

    const questions = await this.questionRepo.find({
      where: { category: { id: category.id } },
      order: { orderIndex: 'ASC', id: 'ASC' },
      relations: { category: true },
      ...(typeof limit === 'number' ? { take: limit } : {}),
    });

    return questions.map((q) => ({
      id: q.id,
      categoryKey: q.category.key,
      categoryName: q.category.name,
      categoryEmoji: q.category.emoji,
      speaker: q.speaker,
      prompt: q.prompt,
      choices: q.choices,
      correctAnswer: q.correctAnswer,
      naturalAnswer: q.naturalAnswer,
      dialogueLines: this.resolveDialogueLines(q),
      orderIndex: q.orderIndex,
    }));
  }

  private resolveDialogueLines(
    question: ConversationQuizQuestion,
  ): ConversationQuizDialogueLine[] {
    if (question.dialogueLines?.length) {
      return question.dialogueLines;
    }

    return [
      { speaker: question.speaker, text: 'Hi, I have a quick question.' },
      { speaker: question.speaker, text: question.prompt },
      { speaker: 'You', text: question.naturalAnswer },
      { speaker: question.speaker, text: 'Great, thanks for letting me know.' },
    ];
  }

  private async resolveCategory(
    categoryKey?: string,
  ): Promise<ConversationQuizCategory | null> {
    if (categoryKey) {
      const selected = await this.categoryRepo.findOne({
        where: { key: categoryKey },
      });
      if (selected) return selected;
    }

    const list = await this.categoryRepo.find({
      order: { displayOrder: 'ASC', id: 'ASC' },
      take: 1,
    });
    return list[0] ?? null;
  }
}
