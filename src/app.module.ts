import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { VocabularyModule } from './vocabulary/vocabulary.module';
import { VerbFormModule } from './verb-form/verb-form.module';
import { CategoryModule } from './category/category.module';
import { ConversationQuizModule } from './conversation-quiz/conversation-quiz.module';
import { ScriptRunnerModule } from './script-runner/script-runner.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
    }),
    UserModule,
    VocabularyModule,
    VerbFormModule,
    CategoryModule,
    ConversationQuizModule,
    ScriptRunnerModule,
    AdminModule,
  ],
})
export class AppModule {}
