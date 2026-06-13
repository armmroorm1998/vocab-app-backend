import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import {
  ConversationQuizCategory,
  ConversationQuizDialogueLine,
  ConversationQuizQuestion,
} from './conversation-quiz.entity';

dotenv.config();

const SHOULD_SYNCHRONIZE = false;

type SeedCategory = {
  key: string;
  name: string;
  emoji: string;
  displayOrder: number;
};

type SeedQuestion = {
  categoryKey: string;
  orderIndex: number;
  speaker: string;
  prompt: string;
  choices: string[];
  correctAnswer: string;
  naturalAnswer: string;
  dialogueLines?: ConversationQuizDialogueLine[];
};

function buildDialogueLines(
  question: Pick<SeedQuestion, 'speaker' | 'prompt' | 'naturalAnswer'>,
): ConversationQuizDialogueLine[] {
  return [
    { speaker: question.speaker, text: 'Hi, I want to ask you something.' },
    { speaker: question.speaker, text: question.prompt },
    { speaker: 'You', text: question.naturalAnswer },
    { speaker: question.speaker, text: 'Perfect, that answers my question.' },
  ];
}

const CATEGORIES: SeedCategory[] = [
  { key: 'job-interview', name: 'Job Interview', emoji: '💼', displayOrder: 1 },
  { key: 'travel', name: 'Travel', emoji: '✈️', displayOrder: 2 },
  { key: 'hotel', name: 'Hotel', emoji: '🏨', displayOrder: 3 },
  { key: 'restaurant', name: 'Restaurant', emoji: '🍔', displayOrder: 4 },
  { key: 'coffee-shop', name: 'Coffee Shop', emoji: '☕', displayOrder: 5 },
  { key: 'hospital', name: 'Hospital', emoji: '🏥', displayOrder: 6 },
  { key: 'shopping', name: 'Shopping', emoji: '🛒', displayOrder: 7 },
  { key: 'taxi', name: 'Taxi', emoji: '🚕', displayOrder: 8 },
  { key: 'greeting', name: 'Greeting', emoji: '👋', displayOrder: 9 },
  {
    key: 'introducing-yourself',
    name: 'Introducing Yourself',
    emoji: '🙋',
    displayOrder: 10,
  },
  { key: 'dating', name: 'Dating', emoji: '❤️', displayOrder: 11 },
  { key: 'office', name: 'Office', emoji: '🏢', displayOrder: 12 },
  { key: 'phone-call', name: 'Phone Call', emoji: '📞', displayOrder: 13 },
  { key: 'gaming', name: 'Gaming', emoji: '🎮', displayOrder: 14 },
  { key: 'it', name: 'IT', emoji: '💻', displayOrder: 15 },
  { key: 'school', name: 'School', emoji: '🎓', displayOrder: 16 },
  { key: 'bank', name: 'Bank', emoji: '🏦', displayOrder: 17 },
  { key: 'immigration', name: 'Immigration', emoji: '🛂', displayOrder: 18 },
  { key: 'delivery', name: 'Delivery', emoji: '📦', displayOrder: 19 },
  { key: 'supermarket', name: 'Supermarket', emoji: '🛒', displayOrder: 20 },
];

const QUESTIONS: SeedQuestion[] = [
  {
    categoryKey: 'job-interview',
    orderIndex: 1,
    speaker: 'Interviewer',
    prompt: 'Tell me about yourself.',
    choices: [
      'I like pizza.',
      'My name is Arm. I have three years of experience as a Backend Developer.',
      'Goodbye.',
      'Thank you.',
    ],
    correctAnswer:
      'My name is Arm. I have three years of experience as a Backend Developer.',
    naturalAnswer:
      'My name is Arm. I have three years of experience as a Backend Developer.',
  },
  {
    categoryKey: 'job-interview',
    orderIndex: 2,
    speaker: 'Interviewer',
    prompt: 'Why do you want to work here?',
    choices: [
      'Because I need money.',
      'Because your company has a great reputation and I want to grow my skills.',
      'I do not know.',
      'Maybe.',
    ],
    correctAnswer:
      'Because your company has a great reputation and I want to grow my skills.',
    naturalAnswer:
      'Because your company has a great reputation and I want to grow my skills.',
  },
  {
    categoryKey: 'travel',
    orderIndex: 1,
    speaker: 'Friend',
    prompt: 'How long are you staying in Bangkok?',
    choices: [
      'I am from Thailand.',
      'I am staying for five days.',
      'Nice to meet you.',
      'I like this bag.',
    ],
    correctAnswer: 'I am staying for five days.',
    naturalAnswer: 'I am staying for five days.',
  },
  {
    categoryKey: 'hotel',
    orderIndex: 1,
    speaker: 'Receptionist',
    prompt: 'May I have your passport, please?',
    choices: [
      'Here it is.',
      'I want chicken rice.',
      'I am a doctor.',
      'Turn left at the corner.',
    ],
    correctAnswer: 'Here it is.',
    naturalAnswer: 'Here it is.',
  },
  {
    categoryKey: 'restaurant',
    orderIndex: 1,
    speaker: 'Waiter',
    prompt: 'Are you ready to order?',
    choices: [
      'I am very busy.',
      'Yes, I would like grilled salmon.',
      'Not today.',
      'I forgot my key.',
    ],
    correctAnswer: 'Yes, I would like grilled salmon.',
    naturalAnswer: 'Yes, I would like grilled salmon.',
  },
  {
    categoryKey: 'coffee-shop',
    orderIndex: 1,
    speaker: 'Barista',
    prompt: 'What can I get for you?',
    choices: [
      'A medium latte, please.',
      'I am learning English.',
      'See you tomorrow.',
      'I lost my wallet.',
    ],
    correctAnswer: 'A medium latte, please.',
    naturalAnswer: 'A medium latte, please.',
  },
  {
    categoryKey: 'hospital',
    orderIndex: 1,
    speaker: 'Doctor',
    prompt: 'Where does it hurt?',
    choices: [
      'My head hurts a lot.',
      'I live nearby.',
      'I need a ticket.',
      'That is expensive.',
    ],
    correctAnswer: 'My head hurts a lot.',
    naturalAnswer: 'My head hurts a lot.',
  },
  {
    categoryKey: 'shopping',
    orderIndex: 1,
    speaker: 'Shop Assistant',
    prompt: 'Can I help you find something?',
    choices: [
      'Yes, I am looking for running shoes.',
      'I am full.',
      'I need a doctor.',
      'The weather is nice.',
    ],
    correctAnswer: 'Yes, I am looking for running shoes.',
    naturalAnswer: 'Yes, I am looking for running shoes.',
  },
  {
    categoryKey: 'taxi',
    orderIndex: 1,
    speaker: 'Driver',
    prompt: 'Where would you like to go?',
    choices: [
      'To Suvarnabhumi Airport, please.',
      'I work in finance.',
      'No problem at all.',
      'It is raining.',
    ],
    correctAnswer: 'To Suvarnabhumi Airport, please.',
    naturalAnswer: 'To Suvarnabhumi Airport, please.',
  },
  {
    categoryKey: 'greeting',
    orderIndex: 1,
    speaker: 'Colleague',
    prompt: 'Good morning. How are you today?',
    choices: [
      'I am doing well, thanks. How about you?',
      'My room is 302.',
      'I need two tickets.',
      'Please call me later.',
    ],
    correctAnswer: 'I am doing well, thanks. How about you?',
    naturalAnswer: 'I am doing well, thanks. How about you?',
  },
  {
    categoryKey: 'introducing-yourself',
    orderIndex: 1,
    speaker: 'Host',
    prompt: 'Could you introduce yourself to the team?',
    choices: [
      'Sure. I am Arm from the backend team.',
      'The bus is late.',
      'I forgot to eat.',
      'This is too spicy.',
    ],
    correctAnswer: 'Sure. I am Arm from the backend team.',
    naturalAnswer: 'Sure. I am Arm from the backend team.',
  },
  {
    categoryKey: 'dating',
    orderIndex: 1,
    speaker: 'Date',
    prompt: 'What do you like to do in your free time?',
    choices: [
      'I enjoy hiking and trying new cafes.',
      'I have a fever.',
      'I lost my passport.',
      'My boss is calling.',
    ],
    correctAnswer: 'I enjoy hiking and trying new cafes.',
    naturalAnswer: 'I enjoy hiking and trying new cafes.',
  },
  {
    categoryKey: 'office',
    orderIndex: 1,
    speaker: 'Manager',
    prompt: 'Can you send me the report by 3 PM?',
    choices: [
      'Sure, I will send it before 3 PM.',
      'I do not drink coffee.',
      'I need a taxi.',
      'The food is great.',
    ],
    correctAnswer: 'Sure, I will send it before 3 PM.',
    naturalAnswer: 'Sure, I will send it before 3 PM.',
  },
  {
    categoryKey: 'phone-call',
    orderIndex: 1,
    speaker: 'Caller',
    prompt: 'May I speak to Mr. John, please?',
    choices: [
      'Sure, please hold for a moment.',
      'I am at the station.',
      'Nice shoes.',
      'I will cook dinner.',
    ],
    correctAnswer: 'Sure, please hold for a moment.',
    naturalAnswer: 'Sure, please hold for a moment.',
  },
  {
    categoryKey: 'gaming',
    orderIndex: 1,
    speaker: 'Teammate',
    prompt: 'Can you cover me while I heal?',
    choices: [
      'Got it, I will cover you now.',
      'I need to buy milk.',
      'My train is here.',
      'I feel sleepy at work.',
    ],
    correctAnswer: 'Got it, I will cover you now.',
    naturalAnswer: 'Got it, I will cover you now.',
  },
  {
    categoryKey: 'it',
    orderIndex: 1,
    speaker: 'User',
    prompt: 'My laptop keeps restarting. Can you help?',
    choices: [
      'Sure, let me check the system logs first.',
      'Try this sandwich.',
      'I booked a hotel.',
      'We should go shopping.',
    ],
    correctAnswer: 'Sure, let me check the system logs first.',
    naturalAnswer: 'Sure, let me check the system logs first.',
  },
  {
    categoryKey: 'school',
    orderIndex: 1,
    speaker: 'Teacher',
    prompt: 'Did everyone finish the homework?',
    choices: [
      'Yes, I finished it last night.',
      'I need a passport.',
      'The movie was funny.',
      'Please open the door.',
    ],
    correctAnswer: 'Yes, I finished it last night.',
    naturalAnswer: 'Yes, I finished it last night.',
  },
  {
    categoryKey: 'bank',
    orderIndex: 1,
    speaker: 'Bank Staff',
    prompt: 'How can I help you today?',
    choices: [
      'I would like to open a savings account.',
      'I want a cheeseburger.',
      'I forgot my umbrella.',
      'My class starts now.',
    ],
    correctAnswer: 'I would like to open a savings account.',
    naturalAnswer: 'I would like to open a savings account.',
  },
  {
    categoryKey: 'immigration',
    orderIndex: 1,
    speaker: 'Officer',
    prompt: 'What is the purpose of your visit?',
    choices: [
      'I am here for tourism for one week.',
      'I need to buy shoes.',
      'I am waiting for a taxi driver.',
      'I work in a hospital.',
    ],
    correctAnswer: 'I am here for tourism for one week.',
    naturalAnswer: 'I am here for tourism for one week.',
  },
  {
    categoryKey: 'delivery',
    orderIndex: 1,
    speaker: 'Courier',
    prompt: 'Can you confirm your address?',
    choices: [
      'Yes, it is 25 Rama 9 Road.',
      'I am a teacher.',
      'I feel better now.',
      'I will call my manager.',
    ],
    correctAnswer: 'Yes, it is 25 Rama 9 Road.',
    naturalAnswer: 'Yes, it is 25 Rama 9 Road.',
  },
  {
    categoryKey: 'supermarket',
    orderIndex: 1,
    speaker: 'Cashier',
    prompt: 'Do you need a bag?',
    choices: [
      'Yes, please. Just one bag.',
      'I am from Bangkok.',
      'See you at 8 PM.',
      'My phone is broken.',
    ],
    correctAnswer: 'Yes, please. Just one bag.',
    naturalAnswer: 'Yes, please. Just one bag.',
  },
];

async function main() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'vocab_app_db',
    entities: [ConversationQuizCategory, ConversationQuizQuestion],
    // Keep false by default to avoid pg client.query deprecation warning in TypeORM sync flow.
    synchronize: SHOULD_SYNCHRONIZE,
  });

  await dataSource.initialize();
  const categoryRepo = dataSource.getRepository(ConversationQuizCategory);
  const questionRepo = dataSource.getRepository(ConversationQuizQuestion);

  const categoryMap = new Map<string, ConversationQuizCategory>();

  for (const c of CATEGORIES) {
    let category = await categoryRepo.findOne({ where: { key: c.key } });
    if (!category) {
      category = categoryRepo.create(c);
    } else {
      category.name = c.name;
      category.emoji = c.emoji;
      category.displayOrder = c.displayOrder;
    }

    const saved = await categoryRepo.save(category);
    categoryMap.set(saved.key, saved);
  }

  let inserted = 0;
  let updated = 0;

  for (const q of QUESTIONS) {
    const category = categoryMap.get(q.categoryKey);
    if (!category) continue;

    const existing = await questionRepo.findOne({
      where: {
        category: { id: category.id },
        prompt: q.prompt,
      },
      relations: { category: true },
    });

    if (!existing) {
      await questionRepo.save(
        questionRepo.create({
          category,
          orderIndex: q.orderIndex,
          speaker: q.speaker,
          prompt: q.prompt,
          choices: q.choices,
          correctAnswer: q.correctAnswer,
          naturalAnswer: q.naturalAnswer,
          dialogueLines: q.dialogueLines ?? buildDialogueLines(q),
        }),
      );
      inserted++;
      continue;
    }

    existing.orderIndex = q.orderIndex;
    existing.speaker = q.speaker;
    existing.choices = q.choices;
    existing.correctAnswer = q.correctAnswer;
    existing.naturalAnswer = q.naturalAnswer;
    existing.dialogueLines = q.dialogueLines ?? buildDialogueLines(q);
    await questionRepo.save(existing);
    updated++;
  }

  console.log(
    `Conversation seed done: inserted=${inserted}, updated=${updated}`,
  );
  await dataSource.destroy();
}

main().catch((err) => {
  console.error('Conversation seed failed:', err);
  process.exit(1);
});
