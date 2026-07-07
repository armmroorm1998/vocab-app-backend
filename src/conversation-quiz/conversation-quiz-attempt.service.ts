import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversationQuizAttempt } from './conversation-quiz-attempt.entity';
import { ConversationQuizQuestion } from './conversation-quiz.entity';
import { UserActivityService } from '../user/user-activity.service';

export interface SubmitAnswerResult {
  isCorrect: boolean;
  score: number;
  correctAnswer: string;
  naturalAnswer: string;
}

export interface QuizHistoryItem {
  id: number;
  questionId: number;
  categoryKey: string;
  categoryName: string;
  prompt: string;
  selectedChoice: string;
  correctAnswer: string;
  score: number;
  isCorrect: boolean;
  createdDate: Date;
}

export interface QuizCategoryStats {
  categoryKey: string;
  categoryName: string;
  attempts: number;
  correct: number;
  accuracy: number;
}

export interface QuizStats {
  totalAttempts: number;
  correctCount: number;
  accuracy: number;
  byCategory: QuizCategoryStats[];
}

@Injectable()
export class ConversationQuizAttemptService {
  constructor(
    @InjectRepository(ConversationQuizAttempt)
    private readonly attemptRepo: Repository<ConversationQuizAttempt>,
    @InjectRepository(ConversationQuizQuestion)
    private readonly questionRepo: Repository<ConversationQuizQuestion>,
    private readonly userActivityService: UserActivityService,
  ) {}

  async submitAnswer(
    userId: string,
    questionId: number,
    selectedChoice: string,
  ): Promise<SubmitAnswerResult> {
    const question = await this.questionRepo.findOne({
      where: { id: questionId },
    });
    if (!question) {
      throw new NotFoundException(`Question #${questionId} not found`);
    }

    const score = question.choiceScores?.[selectedChoice] ?? 0;
    const isCorrect = selectedChoice === question.correctAnswer;

    const attempt = this.attemptRepo.create({
      user: { id: userId } as ConversationQuizAttempt['user'],
      question,
      selectedChoice,
      score,
      isCorrect,
    });
    await this.attemptRepo.save(attempt);
    await this.userActivityService.recordActivity(userId);

    return {
      isCorrect,
      score,
      correctAnswer: question.correctAnswer,
      naturalAnswer: question.naturalAnswer,
    };
  }

  async getHistory(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ data: QuizHistoryItem[]; total: number }> {
    const skip = (page - 1) * limit;
    const [rows, total] = await this.attemptRepo.findAndCount({
      where: { user: { id: userId } },
      relations: { question: { category: true } },
      order: { createdDate: 'DESC' },
      skip,
      take: limit,
    });

    const data = rows.map((a) => ({
      id: a.id,
      questionId: a.question.id,
      categoryKey: a.question.category.key,
      categoryName: a.question.category.name,
      prompt: a.question.prompt,
      selectedChoice: a.selectedChoice,
      correctAnswer: a.question.correctAnswer,
      score: a.score,
      isCorrect: a.isCorrect,
      createdDate: a.createdDate,
    }));

    return { data, total };
  }

  async getStats(userId: string): Promise<QuizStats> {
    const attempts = await this.attemptRepo.find({
      where: { user: { id: userId } },
      relations: { question: { category: true } },
    });

    const totalAttempts = attempts.length;
    const correctCount = attempts.filter((a) => a.isCorrect).length;
    const accuracy = totalAttempts > 0 ? correctCount / totalAttempts : 0;

    const byCategoryMap = new Map<string, QuizCategoryStats>();
    for (const a of attempts) {
      const key = a.question.category.key;
      const entry = byCategoryMap.get(key) ?? {
        categoryKey: key,
        categoryName: a.question.category.name,
        attempts: 0,
        correct: 0,
        accuracy: 0,
      };
      entry.attempts += 1;
      if (a.isCorrect) entry.correct += 1;
      byCategoryMap.set(key, entry);
    }

    const byCategory = [...byCategoryMap.values()].map((c) => ({
      ...c,
      accuracy: c.attempts > 0 ? c.correct / c.attempts : 0,
    }));

    return { totalAttempts, correctCount, accuracy, byCategory };
  }
}
