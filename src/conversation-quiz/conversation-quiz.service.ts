import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ConversationQuizQueryDto,
  CreateConversationCategoryDto,
  CreateConversationQuestionDto,
  UpdateConversationCategoryDto,
  UpdateConversationQuestionDto,
} from './conversation-quiz.dto';
import {
  ConversationQuizCategory,
  ConversationQuizDialogueLine,
  ConversationQuizQuestion,
} from './conversation-quiz.entity';

export interface ConversationQuizCategoryResponse {
  id: number;
  key: string;
  name: string;
  emoji: string | null;
  displayOrder: number;
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
  choiceScores: Record<string, number> | null;
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
      id: c.id,
      key: c.key,
      name: c.name,
      emoji: c.emoji,
      displayOrder: c.displayOrder,
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
      choiceScores: q.choiceScores ?? null,
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

  async createCategory(
    dto: CreateConversationCategoryDto,
  ): Promise<ConversationQuizCategory> {
    const category = this.categoryRepo.create({
      key: dto.key,
      name: dto.name,
      emoji: dto.emoji ?? null,
      displayOrder: dto.displayOrder ?? 0,
    });
    return this.categoryRepo.save(category);
  }

  async updateCategory(
    id: number,
    dto: UpdateConversationCategoryDto,
  ): Promise<ConversationQuizCategory> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Conversation category #${id} not found`);
    }
    Object.assign(category, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.emoji !== undefined && { emoji: dto.emoji }),
      ...(dto.displayOrder !== undefined && { displayOrder: dto.displayOrder }),
    });
    return this.categoryRepo.save(category);
  }

  async deleteCategory(id: number): Promise<void> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Conversation category #${id} not found`);
    }
    await this.categoryRepo.remove(category);
  }

  async createQuestion(
    dto: CreateConversationQuestionDto,
  ): Promise<ConversationQuizQuestion> {
    const category = await this.categoryRepo.findOne({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new NotFoundException(
        `Conversation category #${dto.categoryId} not found`,
      );
    }
    const question = this.questionRepo.create({
      category,
      speaker: dto.speaker ?? 'Interviewer',
      prompt: dto.prompt,
      choices: dto.choices,
      correctAnswer: dto.correctAnswer,
      naturalAnswer: dto.naturalAnswer,
      choiceScores: dto.choiceScores ?? null,
      dialogueLines: dto.dialogueLines ?? null,
      orderIndex: dto.orderIndex ?? 0,
    });
    return this.questionRepo.save(question);
  }

  async updateQuestion(
    id: number,
    dto: UpdateConversationQuestionDto,
  ): Promise<ConversationQuizQuestion> {
    const question = await this.questionRepo.findOne({
      where: { id },
      relations: { category: true },
    });
    if (!question) {
      throw new NotFoundException(`Conversation question #${id} not found`);
    }

    if (dto.categoryId !== undefined) {
      const category = await this.categoryRepo.findOne({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new NotFoundException(
          `Conversation category #${dto.categoryId} not found`,
        );
      }
      question.category = category;
    }

    Object.assign(question, {
      ...(dto.speaker !== undefined && { speaker: dto.speaker }),
      ...(dto.prompt !== undefined && { prompt: dto.prompt }),
      ...(dto.choices !== undefined && { choices: dto.choices }),
      ...(dto.correctAnswer !== undefined && {
        correctAnswer: dto.correctAnswer,
      }),
      ...(dto.naturalAnswer !== undefined && {
        naturalAnswer: dto.naturalAnswer,
      }),
      ...(dto.choiceScores !== undefined && { choiceScores: dto.choiceScores }),
      ...(dto.dialogueLines !== undefined && {
        dialogueLines: dto.dialogueLines,
      }),
      ...(dto.orderIndex !== undefined && { orderIndex: dto.orderIndex }),
    });
    return this.questionRepo.save(question);
  }

  async deleteQuestion(id: number): Promise<void> {
    const question = await this.questionRepo.findOne({ where: { id } });
    if (!question) {
      throw new NotFoundException(`Conversation question #${id} not found`);
    }
    await this.questionRepo.remove(question);
  }
}
