import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import {
  ListeningLesson,
  ListeningLine,
  ListeningUnit,
} from './listening.entity';

dotenv.config();

const SHOULD_SYNCHRONIZE = false;

// Lesson 2 — "Easy English for Beginners — English Conversation 2"
// https://www.youtube.com/watch?v=mx8yjkqScY4 (Units 1-22)

const LESSON_KEY = 'lesson-2';
const LESSON_TITLE = 'Lesson 2: English Conversation 2';
const LESSON_EMOJI = '🎬';

const VIDEO_ID = 'mx8yjkqScY4';

// Start second of each Unit, read directly from the YouTube transcript's own
// timestamps at (or immediately after) the point where the "Unit N" marker is
// spoken — same method used for Lesson 1.
const UNIT_START_SECONDS = [
  1, 89, 181, 240, 356, 474, 587, 706, 772, 870, 994, 1057, 1181, 1260, 1394,
  1506, 1628, 1784, 1875, 1968, 2093, 2239,
];
// End of the last unit is where the closing "change / changes" grammar note begins.
const VIDEO_END_SECONDS = 2336;

type SeedLine = [speaker: string, en: string, th: string];

type SeedUnit = {
  key: string;
  title: string;
  emoji: string;
  lines: SeedLine[];
};

const UNITS: SeedUnit[] = [
  {
    key: 'lst2-phone-call',
    title: 'Making a Phone Call',
    emoji: '📞',
    lines: [
      ['Al', 'Hello. Good morning.', 'ฮัลโหล อรุณสวัสดิ์ครับ'],
      ['Bob', 'Is Albert there?', 'อัลเบิร์ตอยู่ไหมครับ'],
      ['Al', 'This is Al.', 'พูดอยู่ครับ นี่อัลเอง'],
      ['Bob', 'Al, this is Bob.', 'อัล นี่บ็อบนะ'],
      ['Al', 'What are you doing, Bob?', 'บ็อบทำอะไรอยู่เหรอ'],
      ['Bob', "I'm sleeping. What time is it?", 'นอนอยู่ กี่โมงแล้วเนี่ย'],
      [
        'Al',
        "It's 8:00 a.m. Time to rise and shine.",
        '8 โมงเช้าแล้ว ตื่นได้แล้ว',
      ],
      [
        'Bob',
        "8:00 a.m.? Huh? Oh no, I'll be late for work!",
        '8 โมงเช้าเหรอ อ้าว จะไปทำงานสายแล้ว!',
      ],
      [
        'Al',
        "No, no, no, no, no. Today's Saturday. You do not have to work today.",
        'ไม่ๆๆๆ วันนี้วันเสาร์นะ ไม่ต้องทำงานหรอก',
      ],
      ['Bob', 'Saturday?', 'วันเสาร์เหรอ'],
      ['Al', "That's right. No work today.", 'ใช่แล้ว วันนี้ไม่ต้องทำงาน'],
      [
        'Bob',
        "Oh, that's good. Hey, are you free today?",
        'โอ้ ดีจัง เฮ้ วันนี้ว่างไหม',
      ],
      [
        'Al',
        "Well, today is Saturday. Yeah, I'm free.",
        'ก็วันนี้วันเสาร์นี่ ว่างสิ',
      ],
      [
        'Bob',
        'Would you like to do something together today?',
        'อยากทำอะไรด้วยกันวันนี้ไหม',
      ],
      [
        'Al',
        'That sounds good. Uh, what do you want to do?',
        'ฟังดูดีนะ อยากทำอะไรล่ะ',
      ],
      [
        'Bob',
        "I don't know. What do you want to do?",
        'ไม่รู้สิ แล้วนายอยากทำอะไรล่ะ',
      ],
      [
        'Al',
        "I don't know either. Why don't you come to my house and we'll think of something?",
        'ฉันก็ไม่รู้เหมือนกัน มาที่บ้านฉันแล้วค่อยคิดกันดีกว่า',
      ],
      [
        'Bob',
        "Okay. I'll be there in about an hour.",
        'โอเค อีกประมาณชั่วโมงนึงจะไปถึงนะ',
      ],
      ['Al', 'Okay. See you later.', 'โอเค แล้วเจอกัน'],
      ['Bob', 'See you, Al.', 'แล้วเจอกันนะ อัล'],
    ],
  },
  {
    key: 'lst2-visit-friend',
    title: 'Visiting a Friend',
    emoji: '🚪',
    lines: [
      ['Al', 'Hello? Who is it?', 'ฮัลโหล ใครน่ะ'],
      ['Bob', "It's me, Bob.", 'ฉันเอง บ็อบไง'],
      [
        'Al',
        "Hey, Bob. Come on in. I've been waiting for you. Hi, how are you?",
        'เฮ้ บ็อบ เข้ามาสิ รอนายอยู่เลย เป็นไงบ้าง',
      ],
      [
        'Bob',
        "I'm okay. I'm still a little bit sleepy. I haven't had my coffee yet.",
        'ก็โอเคนะ แค่ยังง่วงๆ อยู่ ยังไม่ได้กินกาแฟเลย',
      ],
      [
        'Al',
        'I understand. Do you want something to drink?',
        'เข้าใจ อยากดื่มอะไรไหม',
      ],
      [
        'Bob',
        'Do you have any fresh-squeezed orange juice?',
        'มีน้ำส้มคั้นสดไหม',
      ],
      ['Al', "No, I'm out of orange juice.", 'ไม่มี น้ำส้มหมดแล้ว'],
      ['Al', 'Would you like some grape juice?', 'เอาน้ำองุ่นแทนไหม'],
      ['Bob', 'Grape juice? Hm, that would be great.', 'น้ำองุ่นเหรอ ก็ดีนะ'],
      [
        'Al',
        'Oh, sorry. Out of grape juice, too.',
        'อ้าว ขอโทษที น้ำองุ่นก็หมดเหมือนกัน',
      ],
      [
        'Bob',
        "That's too bad. Have you had breakfast yet?",
        'แย่จัง แล้วกินข้าวเช้าหรือยัง',
      ],
      ['Al', 'No. Have you?', 'ยัง แล้วนายล่ะ'],
      ['Bob', "No, I haven't. Are you hungry?", 'ยังเหมือนกัน หิวไหม'],
      [
        'Al',
        'Yes, I am. Let’s go out and get something to eat.',
        'หิวสิ ออกไปหาอะไรกินกันเถอะ',
      ],
      [
        'Bob',
        'Okay, that sounds good. Um, my aunt has a breakfast shop near here.',
        'โอเค ฟังดูดี ป้าฉันมีร้านอาหารเช้าอยู่แถวนี้นะ',
      ],
      ['Al', "Great. Let's go there.", 'เยี่ยม ไปที่นั่นกันเถอะ'],
      ['Bob', "Okay, let's go.", 'โอเค ไปกันเลย'],
    ],
  },
  {
    key: 'lst2-greetings',
    title: 'Greetings and Introduction',
    emoji: '👋',
    lines: [
      ['Wanita', 'Hi, Al. How are you?', 'หวัดดีค่ะ อัล เป็นไงบ้าง'],
      ['Al', "I'm fine, thank you. And you?", 'สบายดี ขอบคุณ แล้วเธอล่ะ'],
      [
        'Wanita',
        "I'm doing good. Who's your friend?",
        'สบายดีค่ะ นี่เพื่อนใครเหรอ',
      ],
      [
        'Al',
        'Oh, this is Bob. We went to school together. Bob, this is Wanita.',
        'อ๋อ นี่บ็อบ เราเรียนด้วยกันมา บ็อบ นี่วานีต้านะ',
      ],
      [
        'Bob',
        'Hi. Nice to meet you, Wanita.',
        'สวัสดีครับ ยินดีที่ได้รู้จักนะ วานีต้า',
      ],
      [
        'Wanita',
        'Hi. Nice to meet you, too.',
        'สวัสดีค่ะ ยินดีที่ได้รู้จักเหมือนกัน',
      ],
      ['Bob', 'You have a beautiful smile.', 'ยิ้มสวยจังเลยครับ'],
      [
        'Wanita',
        "Thank you. You're not that handsome, but you look okay.",
        'ขอบคุณค่ะ คุณก็ไม่ได้หล่อมากหรอกนะ แต่ก็ดูโอเค',
      ],
      ['Bob', 'Wow. Thanks.', 'ว้าว ขอบคุณครับ'],
      ['Al', 'Wanita, is my aunt here?', 'วานีต้า ป้าฉันอยู่ไหม'],
      [
        'Wanita',
        "No, she isn't. She should be in around 10:00. Here's some menus.",
        'ไม่อยู่ค่ะ น่าจะมาประมาณ 10 โมง นี่เมนูค่ะ',
      ],
      ['Al', 'Thank you.', 'ขอบคุณนะ'],
      ['Wanita', 'Can I get you anything to drink?', 'รับเครื่องดื่มอะไรไหมคะ'],
      ['Al', "Um, I'll have coffee, please.", 'เอากาแฟแล้วกัน'],
      ['Wanita', 'Okay.', 'ได้ค่ะ'],
      ['Wanita', 'Would you like sugar and milk?', 'รับน้ำตาลกับนมไหมคะ'],
      ['Al', 'I like my coffee black.', 'ฉันชอบกาแฟดำ'],
      ['Wanita', 'Okay. One black coffee.', 'ได้ค่ะ กาแฟดำหนึ่งแก้ว'],
      [
        'Bob',
        "I'll have fresh-squeezed orange juice, please.",
        'ผมขอน้ำส้มคั้นสดครับ',
      ],
      [
        'Wanita',
        "We don't have any orange juice. I'll be right back.",
        'เราไม่มีน้ำส้มค่ะ เดี๋ยวมานะคะ',
      ],
    ],
  },
  {
    key: 'lst2-breakfast-rec',
    title: 'Breakfast Recommendation',
    emoji: '🥞',
    lines: [
      [
        'Al',
        'What do you like to eat for breakfast? I like a large breakfast.',
        'ชอบกินอะไรเป็นอาหารเช้าล่ะ ฉันชอบกินอาหารเช้ามื้อใหญ่',
      ],
      ['Bob', 'I like a large lunch.', 'ฉันชอบกินมื้อเที่ยงมื้อใหญ่มากกว่า'],
      [
        'Al',
        'A large lunch makes me sleepy.',
        'กินมื้อเที่ยงเยอะแล้วมันจะง่วงนะ',
      ],
      [
        'Bob',
        'Anyway, what do you recommend for breakfast?',
        'เอาเถอะ แนะนำอาหารเช้าให้หน่อยสิ',
      ],
      ['Wanita', 'The pancakes are good.', 'แพนเค้กอร่อยนะ'],
      ['Bob', 'Pancakes, delicious. What else?', 'แพนเค้ก อร่อยดี มีอะไรอีก'],
      ['Wanita', 'Um, do you like eggs?', 'ชอบกินไข่ไหม'],
      ['Bob', 'Yes, I like eggs.', 'ชอบสิ'],
      [
        'Wanita',
        'Well, you could have some scrambled eggs with toast.',
        'งั้นลองไข่คนกับขนมปังปิ้งดูสิ',
      ],
      ['Bob', 'Ooh.', 'โอ้'],
      ['Wanita', 'Or sunny side up eggs.', 'หรือจะไข่ดาวก็ได้'],
      [
        'Bob',
        'Yummy. Or sunny side up, right? Or an omelette?',
        'อร่อยแน่เลย ไข่ดาวเหรอ หรือไข่เจียวดี',
      ],
      [
        'Wanita',
        'Omelets — I love omelettes! Cheese omelets, ham omelets, vegetable omelettes.',
        'ไข่เจียวเหรอ ฉันชอบไข่เจียวมากเลย จะเป็นไข่เจียวชีส แฮม หรือผักก็ได้',
      ],
      ['Bob', 'Mixed fruit?', 'ผลไม้รวมล่ะ'],
      [
        'Wanita',
        'Mixed fruit with yogurt makes a good breakfast.',
        'ผลไม้รวมกับโยเกิร์ตก็เป็นอาหารเช้าที่ดีนะ',
      ],
      [
        'Bob',
        "That's right. And fruit has many vitamins, too. What else?",
        'ใช่เลย แล้วผลไม้ก็มีวิตามินเยอะด้วย มีอะไรอีก',
      ],
      [
        'Wanita',
        'What else? Um, you could have a cup of coffee and a blueberry muffin.',
        'อะไรอีกเหรอ ก็มีกาแฟกับมัฟฟินบลูเบอร์รี่นะ',
      ],
      [
        'Bob',
        'Muffin and a cup of coffee. Sounds good.',
        'มัฟฟินกับกาแฟ ฟังดูดีเลย',
      ],
      [
        'Wanita',
        'So, do you know what you want to get?',
        'งั้นตัดสินใจได้หรือยังว่าจะสั่งอะไร',
      ],
      ['Bob', 'Yes, I do.', 'ได้แล้วครับ'],
      ['Bob', 'And thank you for your recommendations.', 'ขอบคุณที่แนะนำนะ'],
      [
        'Wanita',
        'Oh, you’re welcome. So, what will you get?',
        'ยินดีค่ะ แล้วจะสั่งอะไรล่ะ',
      ],
      ['Bob', 'A hamburger.', 'แฮมเบอร์เกอร์'],
      ['Wanita', 'A hamburger?', 'แฮมเบอร์เกอร์เหรอ'],
      ['Bob', 'Yes. And ice cream.', 'ใช่ แล้วก็ไอศกรีมด้วย'],
    ],
  },
  {
    key: 'lst2-order-food',
    title: 'Ordering Food',
    emoji: '🍳',
    lines: [
      ['Wanita', 'Here is your coffee, Al.', 'นี่กาแฟของคุณค่ะ อัล'],
      ['Al', 'Thank you.', 'ขอบคุณ'],
      ['Wanita', "And here's your water.", 'แล้วนี่น้ำเปล่าค่ะ'],
      ['Al', 'Thank you.', 'ขอบคุณ'],
      [
        'Wanita',
        'You guys ready to order? What do you like to have for breakfast?',
        'พร้อมสั่งหรือยังคะ อยากกินอะไรเป็นอาหารเช้า',
      ],
      [
        'Al',
        'Um, I usually like to have an omelette.',
        'ปกติฉันชอบกินไข่เจียวนะ',
      ],
      ['Wanita', 'That sounds good.', 'ฟังดูดีค่ะ'],
      ['Al', "I'll have a cheese omelette.", 'ขอไข่เจียวชีสแล้วกัน'],
      ['Wanita', 'Okay, one omelette.', 'ได้ค่ะ ไข่เจียวหนึ่งจาน'],
      ['Al', 'Do you have pancakes?', 'มีแพนเค้กไหม'],
      ['Wanita', 'Yes. How many would you like?', 'มีค่ะ รับกี่แผ่นดีคะ'],
      ['Al', 'Three, please. And bacon.', 'เอาสามแผ่นแล้วกัน แล้วก็เบคอนด้วย'],
      [
        'Wanita',
        'Three pancakes and bacon. Would you like toast?',
        'แพนเค้กสามแผ่นกับเบคอน รับขนมปังปิ้งด้วยไหมคะ',
      ],
      [
        'Al',
        'Toast? Toast sounds good. Yes, three pieces of toast.',
        'ขนมปังปิ้งเหรอ ฟังดูดีนะ เอาสามแผ่นแล้วกัน',
      ],
      ['Wanita', 'Would you like anything else?', 'รับอะไรเพิ่มอีกไหมคะ'],
      ['Al', 'Do you have any fresh fruit?', 'มีผลไม้สดไหม'],
      ['Wanita', 'Yes. Today we have fruit salad.', 'มีค่ะ วันนี้มีสลัดผลไม้'],
      [
        'Al',
        "Okay. Fruit salad. And that's all.",
        'โอเค เอาสลัดผลไม้ด้วย แค่นี้แหละ',
      ],
      [
        'Wanita',
        'Fruit salad. How about you, Bob? What would you like to eat?',
        'สลัดผลไม้นะคะ แล้วบ็อบล่ะคะ จะรับอะไร',
      ],
      [
        'Bob',
        'I would like hamburger and ice cream.',
        'ผมขอแฮมเบอร์เกอร์กับไอศกรีมครับ',
      ],
      ['Wanita', 'Excuse me?', 'ขอโทษนะคะ ว่าไงนะ'],
      [
        'Bob',
        'I would like hamburger and ice cream, please.',
        'ผมขอแฮมเบอร์เกอร์กับไอศกรีมครับ',
      ],
      [
        'Wanita',
        'A hamburger and ice cream for breakfast?',
        'แฮมเบอร์เกอร์กับไอศกรีมเป็นอาหารเช้าเหรอคะ',
      ],
      ['Al', 'Are you crazy?', 'นายบ้าไปแล้วเหรอ'],
      ['Bob', "No, I'm just hungry.", 'เปล่า แค่หิวน่ะ'],
      ['Wanita', 'Okay, one hamburger.', 'ได้ค่ะ แฮมเบอร์เกอร์หนึ่งชิ้น'],
      ['Wanita', 'What kind of ice cream do you want?', 'รับไอศกรีมรสอะไรดีคะ'],
      ['Bob', 'What kind of ice cream do you have?', 'มีรสอะไรบ้างครับ'],
      [
        'Wanita',
        "Let's see. We have chocolate, vanilla, and strawberry.",
        'ดูซิคะ มีช็อกโกแลต วานิลลา กับสตรอว์เบอร์รี่',
      ],
      ['Bob', 'Vanilla, please.', 'เอาวานิลลาแล้วกันครับ'],
      ['Wanita', 'Vanilla. Okay.', 'วานิลลานะคะ ได้ค่ะ'],
    ],
  },
  {
    key: 'lst2-check-please',
    title: 'Check, Please',
    emoji: '💵',
    lines: [
      ['Al', 'That was a good breakfast.', 'อาหารเช้ามื้อนี้อร่อยจัง'],
      ['Bob', 'Yes, it was.', 'ใช่เลย'],
      ['Al', 'Are you full?', 'อิ่มไหม'],
      ['Bob', "I'm very full.", 'อิ่มมากเลย'],
      ['Al', 'You ate a lot.', 'นายกินเยอะมากเลยนะ'],
      ['Bob', 'I was so hungry.', 'ก็หิวมากนี่'],
      ['Bob', 'I could have eaten a horse.', 'หิวจนกินม้าได้เลยมั้ง'],
      [
        'Al',
        "Good thing we didn't go to the racetrack. Ha! Ah, that reminds me — what are we doing today?",
        'โชคดีที่เราไม่ได้ไปสนามแข่งม้านะ ฮ่าๆ อ้อ นึกขึ้นได้ วันนี้เราจะทำอะไรกันดี',
      ],
      ['Bob', "Let's go see a movie.", 'ไปดูหนังกันเถอะ'],
      [
        'Al',
        "Let's pay the bill first, then we'll go see a movie.",
        'จ่ายบิลก่อนแล้วค่อยไปดูหนังกัน',
      ],
      ['Bob', "Okay, we'll see a movie.", 'โอเค ไปดูหนังกัน'],
      ['Al', 'Wanita, check, please.', 'วานีต้า เก็บเงินด้วยนะ'],
      [
        'Wanita',
        'Okay, just a moment. Would you guys like to pay together or separate?',
        'ได้ค่ะ รอสักครู่นะคะ จะจ่ายรวมกันหรือแยกกันคะ',
      ],
      ['Bob', 'Uh, oh my god, I forgot my money.', 'เอ๊ะ ตายแล้ว ลืมเอาเงินมา'],
      [
        'Al',
        "Oh, that's okay. I have enough. Together, please.",
        'ไม่เป็นไร ฉันมีพอ จ่ายรวมกันนะ',
      ],
      [
        'Wanita',
        'Okay. The total for your breakfast is $10.30.',
        'ได้ค่ะ ยอดรวมอาหารเช้าทั้งหมด 10.30 ดอลลาร์ค่ะ',
      ],
      [
        'Al',
        'My aunt usually gives me a 50% discount.',
        'ปกติป้าจะลดให้ฉัน 50% นะ',
      ],
      [
        'Wanita',
        "Oh, I'm sorry, I forgot. That'll be $5.15.",
        'อ๋อ ขอโทษค่ะ ลืมไปเลย งั้นเป็น 5.15 ดอลลาร์ค่ะ',
      ],
      [
        'Al',
        "Here's $7. You can keep the change.",
        'นี่ 7 ดอลลาร์ เก็บเงินทอนไว้เลย',
      ],
      [
        'Wanita',
        'Really? Keep the change?',
        'จริงเหรอคะ เก็บเงินทอนไว้เลยเหรอ',
      ],
      ['Al', "Yes, it's a tip for you.", 'ใช่ เป็นทิปให้เธอ'],
      ['Wanita', 'Thank you, Al.', 'ขอบคุณค่ะ อัล'],
      ['Bob', 'Yeah, thanks, Al.', 'ใช่ ขอบใจนะ อัล'],
      [
        'Bob',
        "I'll pay you back when we get to an ATM.",
        'เดี๋ยวไปตู้เอทีเอ็มแล้วจะคืนเงินให้นะ',
      ],
      [
        'Al',
        "Don't worry, it's just breakfast.",
        'ไม่ต้องห่วงหรอก แค่มื้อเช้าเอง',
      ],
      ['Bob', "I'll get lunch.", 'เดี๋ยวมื้อเที่ยงฉันเลี้ยงเอง'],
      ['Al', 'Are you sure? I eat a lot.', 'แน่ใจนะ ฉันกินเยอะนะ'],
      ['Bob', 'Ooh, I forgot about that.', 'โอ้ ลืมเรื่องนั้นไปเลย'],
    ],
  },
  {
    key: 'lst2-meet-friend',
    title: 'Meeting a Friend',
    emoji: '🤗',
    lines: [
      ['Al', "Bob, isn't that Michelle?", 'บ็อบ นั่นมิเชลใช่ไหม'],
      ['Bob', 'Michelle who?', 'มิเชลไหนเหรอ'],
      [
        'Al',
        'Michelle Levette. We all went to school together. Oh, here she comes.',
        'มิเชล เลอเวตต์ไง เราเรียนด้วยกันมาทั้งหมดเลย โอ้ เธอเดินมาแล้ว',
      ],
      ['Michelle', 'Hi.', 'สวัสดีค่ะ'],
      ['Al', 'Hey, Michelle.', 'เฮ้ มิเชล'],
      ['Bob', 'Hi.', 'สวัสดีครับ'],
      [
        'Michelle',
        'Hi. Um, how can I help you?',
        'สวัสดีค่ะ มีอะไรให้ช่วยไหมคะ',
      ],
      [
        'Al',
        "It's me, Al. We went to school together.",
        'นี่ฉันเอง อัลไง เราเรียนด้วยกันมา',
      ],
      ['Michelle', 'Right, Al?', 'อัลใช่ไหม'],
      ['Al', 'Right. And—', 'ใช่แล้ว แล้วก็...'],
      [
        'Michelle',
        'Oh my god, Bob Weeden! Bob, I haven’t seen you in years. How are you?',
        'โอ้พระเจ้า บ็อบ วีดเดน ไม่เจอกันตั้งหลายปีเลย เป็นไงบ้าง',
      ],
      ['Bob', 'I’m fine. And you?', 'สบายดี แล้วเธอล่ะ'],
      ['Michelle', "Oh, I've missed you so much!", 'โอ้ คิดถึงมากเลย'],
      ['Bob', 'Wow. Thank you.', 'ว้าว ขอบคุณนะ'],
      [
        'Michelle',
        "I thought I'd never see you again.",
        'นึกว่าจะไม่ได้เจอกันอีกแล้ว',
      ],
      ['Bob', "It's some surprise.", 'น่าประหลาดใจจริงๆ'],
      ['Michelle', 'Oh, you bet.', 'นั่นสิ'],
      [
        'Michelle',
        "How's life? Are you married?",
        'ชีวิตเป็นไงบ้าง แต่งงานหรือยัง',
      ],
      ['Bob', "No, I'm not married yet.", 'ยังไม่แต่งเลย'],
      ['Michelle', "So, you're single, then?", 'งั้นก็ยังโสดสินะ'],
      [
        'Bob',
        'Free and single. How about you? Are you working?',
        'โสดและอิสระ แล้วเธอล่ะ ทำงานอยู่ไหม',
      ],
      [
        'Michelle',
        'Uh, yeah. I have a shop at the mall.',
        'ทำงานอยู่ ฉันมีร้านอยู่ในห้างค่ะ',
      ],
      ['Bob', 'Really? What do you sell?', 'จริงเหรอ ขายอะไร'],
      [
        'Michelle',
        'Well, it’s a mobile phone shop. So I sell mobile phones and accessories at the mall.',
        'เป็นร้านมือถือค่ะ ขายมือถือกับอุปกรณ์เสริมในห้าง',
      ],
      [
        'Al',
        'Hey, Bob and I are going to go see a movie at the mall today.',
        'เฮ้ วันนี้ฉันกับบ็อบจะไปดูหนังที่ห้างเหมือนกันนะ',
      ],
      ['Michelle', 'Interesting.', 'น่าสนใจจัง'],
      [
        'Al',
        'Anyways, Bob is going to buy a phone today.',
        'ยังไงก็ตาม วันนี้บ็อบจะไปซื้อมือถือด้วย',
      ],
      [
        'Michelle',
        'Really? Well then, you can come to my shop.',
        'จริงเหรอ งั้นมาที่ร้านฉันสิ',
      ],
      ['Bob', "What's your shop called?", 'ร้านชื่ออะไรเหรอ'],
      ['Michelle', "It's called Ring Me.", 'ชื่อ "ริงมี" ค่ะ'],
      [
        'Al',
        'I know that shop. Where is it?',
        'ฉันรู้จักร้านนั้นนะ อยู่ตรงไหน',
      ],
      [
        'Michelle',
        "It's on the third floor at the mall.",
        'อยู่ชั้นสามของห้างค่ะ',
      ],
      ['Al', 'Okay.', 'โอเค'],
      [
        'Michelle',
        "Yeah. Well, I'm sorry, but I have to go now. I hope to see you later, Bobby.",
        'ค่ะ เอาล่ะ ขอโทษด้วยนะ ฉันต้องไปแล้ว หวังว่าจะได้เจอกันอีกนะ บ็อบบี้',
      ],
      ['Bob', 'Bye.', 'บาย'],
      ['Michelle', 'See you, too. Bye.', 'แล้วเจอกันนะ บาย'],
      ['Al', 'Bye.', 'บาย'],
    ],
  },
  {
    key: 'lst2-car',
    title: 'How Is Your Car?',
    emoji: '🚗',
    lines: [
      ['Bob', "Hey, Al, where's your car?", 'เฮ้ อัล รถนายอยู่ไหนล่ะ'],
      ['Al', 'Oh, I took it to the repair shop.', 'อ๋อ เอาไปเข้าอู่ซ่อมน่ะ'],
      ['Bob', 'Oh, did you have an accident?', 'โอ้ รถชนมาเหรอ'],
      [
        'Al',
        'No, I left it with the mechanic for a tune-up.',
        'เปล่า แค่เอาไปให้ช่างเช็คระยะน่ะ',
      ],
      ['Bob', 'When will it be ready?', 'จะเสร็จเมื่อไหร่'],
      [
        'Al',
        'The mechanic said it will be ready on Monday.',
        'ช่างบอกว่าจะเสร็จวันจันทร์',
      ],
      ['Bob', "That's such a long time.", 'นานเลยนะ'],
      ['Al', 'Yeah, it is a long time.', 'ใช่ นานอยู่เหมือนกัน'],
      [
        'Bob',
        'Are you planning on going on a trip?',
        'วางแผนจะไปเที่ยวไหนเหรอ',
      ],
      [
        'Al',
        'No, I just take it to the mechanic every 3,000 km or so.',
        'เปล่า แค่เอารถไปเข้าอู่ทุกๆ 3,000 กิโลเมตรน่ะ',
      ],
      ['Bob', 'Why do you do that?', 'ทำไมถึงต้องทำแบบนั้นล่ะ'],
      [
        'Al',
        "It's very old. It needs a lot of care.",
        'รถมันเก่ามากแล้ว ต้องดูแลเยอะหน่อย',
      ],
      ['Bob', 'How old is your car?', 'รถอายุเท่าไหร่แล้ว'],
      ['Al', "It's a 1975 model.", 'รุ่นปี 1975 ครับ'],
      [
        'Bob',
        'That’s not so old. My grandmother was born in 1912.',
        'ไม่เก่าขนาดนั้นหรอก คุณย่าฉันเกิดปี 1912 นะ',
      ],
      [
        'Al',
        "Well, I guess compared to your grandmother, my car isn't that old.",
        'งั้นเทียบกับคุณย่านายแล้ว รถฉันก็ยังไม่เก่าเท่าไหร่สินะ',
      ],
      [
        'Bob',
        'Hey, wait a minute. How are we going to get to the movie?',
        'เดี๋ยวก่อน แล้วเราจะไปดูหนังยังไงล่ะ',
      ],
      [
        'Al',
        'Well, we can walk or go by train. Up to you.',
        'ก็เดินไป หรือนั่งรถไฟก็ได้ แล้วแต่นายเลย',
      ],
      [
        'Bob',
        'Are you crazy? Walk? The shopping mall is much too far.',
        'บ้าไปแล้วเหรอ เดินเหรอ ห้างมันไกลมากเลยนะ',
      ],
      [
        'Al',
        "Well, in that case, we'll go by train.",
        'งั้นก็นั่งรถไฟไปกันเถอะ',
      ],
    ],
  },
  {
    key: 'lst2-train',
    title: 'About the Train',
    emoji: '🚆',
    lines: [
      [
        'Al',
        'So, Bob, do you take the train often?',
        'บ็อบ นายนั่งรถไฟบ่อยไหม',
      ],
      ['Bob', 'Yes, Al, almost every day.', 'บ่อยสิ อัล เกือบทุกวันเลย'],
      ['Al', 'Almost every day? That’s a lot.', 'เกือบทุกวันเลยเหรอ เยอะจังนะ'],
      [
        'Bob',
        "Well, I enjoy the train. It's very convenient.",
        'ฉันชอบนั่งรถไฟนะ สะดวกดี',
      ],
      [
        'Al',
        "I see. And it's the fastest way to travel across town.",
        'เข้าใจแล้ว แล้วก็เป็นวิธีเดินทางข้ามเมืองที่เร็วที่สุดด้วย',
      ],
      [
        'Al',
        'Are there many people on the train during rush hour?',
        'ช่วงเวลาเร่งด่วนคนเยอะไหม',
      ],
      [
        'Bob',
        'Well, there are many people in the morning before work and many people in the evening after work.',
        'คนเยอะช่วงเช้าก่อนเข้างานกับช่วงเย็นหลังเลิกงานนะ',
      ],
      ['Al', 'What about other times?', 'แล้วช่วงเวลาอื่นล่ะ'],
      [
        'Bob',
        'At other times, no, not so many people.',
        'ช่วงอื่นก็ไม่ค่อยเยอะหรอก',
      ],
      [
        'Al',
        "And there's never a traffic jam on the train?",
        'แล้วรถไฟไม่มีรถติดเลยเหรอ',
      ],
      ['Bob', "There's never any traffic jam.", 'ไม่มีรถติดเลย'],
      [
        'Al',
        "Oh, that's good. It's the fastest way to travel.",
        'โอ้ ดีจังเลย เป็นวิธีเดินทางที่เร็วที่สุด',
      ],
      [
        'Bob',
        'Yeah, you know, I think it’s faster than driving a car.',
        'ใช่ ฉันว่ามันเร็วกว่าขับรถอีกนะ',
      ],
      ['Al', 'And the train is not very expensive.', 'แล้วค่ารถไฟก็ไม่แพงด้วย'],
      [
        'Al',
        'Hey, Bob, look at that sign — "The University." Uh-oh, we’re waiting for the wrong train.',
        'เฮ้ บ็อบ ดูป้ายนั่นสิ "มหาวิทยาลัย" อุ๊ย เรารอรถไฟผิดขบวนแล้ว',
      ],
      [
        'Bob',
        "We're on the wrong platform...",
        'เราอยู่ผิดชานชาลาแล้วเหรอเนี่ย',
      ],
      [
        'Al',
        "Yes, we're on the wrong platform. So now what do we do?",
        'ใช่ เราอยู่ผิดชานชาลา ทีนี้จะทำยังไงดี',
      ],
      [
        'Bob',
        'Well, we can take a taxi. Taxis are good.',
        'ก็นั่งแท็กซี่ไปเลยสิ แท็กซี่ก็ดีนะ',
      ],
      [
        'Al',
        "Yes, taxis are good. Let's take a taxi. And we won't waste our time waiting for the wrong train.",
        'ใช่ แท็กซี่ดี ไปนั่งแท็กซี่กันเถอะ จะได้ไม่เสียเวลารอรถไฟผิดขบวนอีก',
      ],
    ],
  },
  {
    key: 'lst2-shoes',
    title: 'A Pair of Shoes',
    emoji: '👞',
    lines: [
      [
        'Al',
        'Oh, those shoes are lovely. Can I see them?',
        'โอ้ รองเท้าคู่นั้นสวยจัง ขอดูหน่อยได้ไหม',
      ],
      ['Shopkeeper', 'Which ones do you like?', 'ชอบคู่ไหนคะ'],
      ['Al', 'That black pair looks really cool.', 'คู่สีดำนั่นดูเท่ดี'],
      ['Shopkeeper', 'Um, the black ones here?', 'คู่สีดำนี้ใช่ไหมคะ'],
      ['Al', 'The black ones.', 'ใช่ สีดำ'],
      [
        'Shopkeeper',
        'They’re quite lovely. Imported from Italy.',
        'สวยมากเลยค่ะ นำเข้าจากอิตาลีด้วยนะ',
      ],
      [
        'Al',
        "I've been to Italy. How much are they?",
        'ฉันเคยไปอิตาลีมาแล้ว ราคาเท่าไหร่',
      ],
      ['Shopkeeper', 'These shoes are $80.', 'คู่นี้ 80 ดอลลาร์ค่ะ'],
      ['Al', "$80? That's so expensive.", '80 ดอลลาร์เหรอ แพงมากเลย'],
      [
        'Shopkeeper',
        'Not so expensive — only $40 for one shoe!',
        'ไม่แพงหรอกค่ะ ข้างละแค่ 40 ดอลลาร์เอง',
      ],
      [
        'Al',
        'Do you have another pair of black shoes?',
        'มีรองเท้าสีดำคู่อื่นอีกไหม',
      ],
      ['Shopkeeper', 'This pair, only $20.', 'คู่นี้แค่ 20 ดอลลาร์ค่ะ'],
      [
        'Al',
        'Why are these shoes so much cheaper?',
        'ทำไมคู่นี้ถูกกว่ากันเยอะเลยล่ะ',
      ],
      ['Shopkeeper', "Because they're made here.", 'เพราะผลิตในประเทศเองค่ะ'],
      [
        'Al',
        'Made here? What about the quality?',
        'ผลิตในประเทศเหรอ แล้วคุณภาพล่ะ',
      ],
      [
        'Shopkeeper',
        'The quality is very good. These shoes will last a long time.',
        'คุณภาพดีมากค่ะ ใส่ทนอยู่ได้นานเลย',
      ],
      ['Al', 'How about $15 for the pair?', 'ลด 15 ดอลลาร์ต่อคู่ได้ไหม'],
      [
        'Shopkeeper',
        "Oh, I'm sorry. Not enough — $18.",
        'ขอโทษค่ะ ไม่พอ เอา 18 ดอลลาร์แล้วกัน',
      ],
      ['Al', "I'll give you $16.", 'เอา 16 ดอลลาร์แล้วกันนะ'],
      [
        'Shopkeeper',
        'Okay, for you, special price, $16. Would you like a bag?',
        'ได้ค่ะ ราคาพิเศษให้ 16 ดอลลาร์ รับถุงด้วยไหมคะ',
      ],
      ['Al', "No, that's okay.", 'ไม่เป็นไร'],
      ['Al', "Thanks anyway. I'll wear them.", 'ขอบคุณนะ ใส่เลยแล้วกัน'],
    ],
  },
  {
    key: 'lst2-buy-phone',
    title: 'Buying a Phone',
    emoji: '📱',
    lines: [
      ['Al', 'Hey, Michelle.', 'เฮ้ มิเชล'],
      ['Michelle', 'Hi, Al. Hi, Bob.', 'สวัสดีค่ะ อัล บ็อบ'],
      ['Bob', 'Hi. Nice to see you again.', 'สวัสดีครับ ดีใจที่ได้เจออีกนะ'],
      ['Michelle', 'Nice to see you, too.', 'ดีใจที่ได้เจอเหมือนกันค่ะ'],
      [
        'Michelle',
        'Hey, Al, are those new shoes?',
        'เฮ้ อัล นั่นรองเท้าคู่ใหม่เหรอ',
      ],
      [
        'Al',
        'Why, yes, they are. Thank you for noticing.',
        'ใช่แล้ว ขอบคุณที่สังเกตเห็นนะ',
      ],
      [
        'Bob',
        "Al got a new pair of shoes, and I'm going to get a new mobile phone today.",
        'อัลเพิ่งได้รองเท้าใหม่ ส่วนผมวันนี้จะไปซื้อมือถือใหม่ครับ',
      ],
      [
        'Michelle',
        "Ah, well, you've come to the right place.",
        'อ๋อ งั้นมาถูกที่แล้วล่ะ',
      ],
      [
        'Michelle',
        'Have you ever had a mobile phone before?',
        'เคยมีมือถือมาก่อนไหม',
      ],
      [
        'Bob',
        'No, this will be my first phone.',
        'ไม่เคยเลย นี่จะเป็นเครื่องแรกของผม',
      ],
      [
        'Michelle',
        "Don't worry, it's easy. May I ask why do you want a phone?",
        'ไม่ต้องกังวลหรอก ใช้ง่ายมาก ขอถามหน่อยได้ไหมว่าทำไมถึงอยากได้มือถือ',
      ],
      [
        'Bob',
        "Oh, because Al won't let me borrow his anymore.",
        'อ๋อ เพราะอัลไม่ยอมให้ยืมเครื่องเขาแล้วน่ะ',
      ],
      [
        'Michelle',
        "That's a good reason. Why else?",
        'เหตุผลดีนะ มีอย่างอื่นอีกไหม',
      ],
      [
        'Bob',
        'Well, everybody else seems to have a mobile phone. Maybe I should have one, too.',
        'ก็คนอื่นเขามีมือถือกันหมดแล้ว ผมก็น่าจะมีบ้าง',
      ],
      ['Michelle', "That's another good reason.", 'เหตุผลดีอีกข้อนึงเลย'],
      [
        'Michelle',
        'So, what features would you like?',
        'อยากได้ฟีเจอร์แบบไหนคะ',
      ],
      ['Bob', 'A loud ringtone!', 'เสียงเรียกเข้าดังๆ!'],
      ['Al', 'Take it easy!', 'ใจเย็นๆ น่า'],
      [
        'Bob',
        'All right, all right. Uh, and it should vibrate.',
        'โอเค โอเค แล้วก็ต้องสั่นได้ด้วย',
      ],
      ['Michelle', 'I recommend this one.', 'ฉันแนะนำเครื่องนี้นะ'],
      ['Bob', 'This one?', 'เครื่องนี้เหรอ'],
      ['Michelle', 'Mhm.', 'ใช่'],
      [
        'Bob',
        "Great, thanks. I'll take it.",
        'เยี่ยม ขอบคุณ เอาเครื่องนี้แล้วกัน',
      ],
      ['Michelle', 'Great.', 'เยี่ยมเลย'],
      [
        'Bob',
        'Hey, Al, do you like my new phone?',
        'เฮ้ อัล ชอบมือถือเครื่องใหม่ของฉันไหม',
      ],
    ],
  },
  {
    key: 'lst2-toilet-directions',
    title: 'Directions to the Toilet',
    emoji: '🚻',
    lines: [
      ['Michelle', 'Al, is something wrong?', 'อัล มีอะไรผิดปกติหรือเปล่า'],
      ['Al', "Uh, no. I'm okay.", 'เอ่อ เปล่า ฉันไม่เป็นไร'],
      ['Al', 'Do you have a toilet here?', 'ที่นี่มีห้องน้ำไหม'],
      [
        'Michelle',
        'Oh, no. I’m so sorry. There is no toilet in this shop.',
        'โอ้ ไม่มีค่ะ ขอโทษด้วยนะ ร้านนี้ไม่มีห้องน้ำ',
      ],
      ['Al', 'Okay. Uh, where is a toilet?', 'โอเค แล้วห้องน้ำอยู่ไหน'],
      [
        'Michelle',
        'Well, there is a public toilet close to here.',
        'มีห้องน้ำสาธารณะอยู่ใกล้ๆ นี่ค่ะ',
      ],
      ['Al', 'Yeah. Where is it?', 'ใช่ อยู่ตรงไหนล่ะ'],
      [
        'Michelle',
        "Oh, it's really hard to find if you don't know where it is.",
        'โอ้ มันหายากมากถ้าไม่รู้ตำแหน่งน่ะค่ะ',
      ],
      ['Al', 'Hurry, please!', 'เร็วเข้าเถอะ!'],
      ['Michelle', 'Okay.', 'โอเคค่ะ'],
      [
        'Michelle',
        'Okay. Go out the door and take a left.',
        'โอเค ออกประตูไปแล้วเลี้ยวซ้ายนะคะ',
      ],
      [
        'Al',
        'Okay, okay. Out the door, left, and then?',
        'โอเค โอเค ออกประตู เลี้ยวซ้าย แล้วไงต่อ',
      ],
      [
        'Michelle',
        'And then walk 15 meters until you see a pet fish shop.',
        'แล้วก็เดินไปประมาณ 15 เมตร จนเจอร้านขายปลาสวยงาม',
      ],
      [
        'Al',
        'Okay, okay. Pet shop, and then?',
        'โอเค โอเค ร้านขายปลา แล้วไงต่อ',
      ],
      [
        'Michelle',
        'And then you’ll see a staircase there. Go down the stairs.',
        'แล้วจะเห็นบันได ให้เดินลงบันไดไปค่ะ',
      ],
      [
        'Al',
        'Okay, okay. Up the stairs, and then?',
        'โอเค โอเค ขึ้นบันได แล้วไงต่อ',
      ],
      [
        'Michelle',
        'No, no, no. Not up the stairs — down the stairs.',
        'ไม่ๆๆ ไม่ใช่ขึ้นนะ ลงบันได',
      ],
      ['Al', 'OKAY. DOWN THE STAIRS, AND THEN?', 'โอเค ลงบันได แล้วไงต่อ'],
      [
        'Michelle',
        'And then you’ll see a waterfall, and then—',
        'แล้วจะเห็นน้ำตก แล้วก็...',
      ],
      ['Al', 'And then?', 'แล้วไงต่อ'],
      ['Michelle', 'And then take a right.', 'แล้วก็เลี้ยวขวา'],
      [
        'Al',
        'Okay, okay. Right at the waterfall, and then?',
        'โอเค โอเค เลี้ยวขวาตรงน้ำตก แล้วไงต่อ',
      ],
      ['Michelle', 'And the toilet is there.', 'แล้วห้องน้ำก็อยู่ตรงนั้นแหละ'],
      [
        'Al',
        'Thank you, thank you. Um, so — out the door, is it right or left?',
        'ขอบคุณ ขอบคุณ เอ่อ...ทีนี้ ออกประตูไปเลี้ยวขวาหรือซ้ายนะ',
      ],
      [
        'Michelle',
        'Maybe I should draw you a map.',
        'เดี๋ยววาดแผนที่ให้ดีกว่า',
      ],
      [
        'Al',
        'NEVER MIND. I’ll find the toilet myself.',
        'ไม่เป็นไร ฉันหาห้องน้ำเองได้',
      ],
      [
        'Bob',
        'Hey, good luck. Call me if you get lost.',
        'เฮ้ โชคดีนะ หลงทางแล้วโทรหาฉันล่ะ',
      ],
    ],
  },
  {
    key: 'lst2-appointment',
    title: 'Make an Appointment for Later',
    emoji: '📅',
    lines: [
      [
        'Al',
        'That was not easy. But I finally found the toilet. Are you ready to go, Bob?',
        'ไม่ง่ายเลย แต่ในที่สุดก็เจอห้องน้ำจนได้ บ็อบ พร้อมไปหรือยัง',
      ],
      ['Bob', 'Yes, Al. I am ready.', 'พร้อมแล้ว อัล'],
      ['Al', 'Do you want to invite Michelle?', 'อยากชวนมิเชลไปด้วยไหม'],
      [
        'Bob',
        'Yeah. Hey, Michelle, would you like to go see a movie with us?',
        'เอาสิ เฮ้ มิเชล อยากไปดูหนังกับเราไหม',
      ],
      [
        'Michelle',
        'Wow, that sounds like fun. When will you go?',
        'โอ้ ฟังดูสนุกดีนะ จะไปตอนไหน',
      ],
      [
        'Bob',
        "Well, we'll be going in about another 10 minutes.",
        'ก็อีกประมาณ 10 นาทีข้างหน้า',
      ],
      [
        'Michelle',
        '10 minutes? Oh, that is too soon. I have to wait for the staff to arrive.',
        '10 นาทีเหรอ เร็วเกินไปหน่อยนะ ฉันต้องรอพนักงานมาเปลี่ยนกะก่อน',
      ],
      ['Bob', 'When will your staff arrive?', 'พนักงานจะมากี่โมงเหรอ'],
      [
        'Michelle',
        'In about an hour. Please go on without me.',
        'อีกประมาณชั่วโมงนึงค่ะ ไปกันก่อนเลย ไม่ต้องรอฉัน',
      ],
      ['Al', 'Oh, no, no, no, no, no. We can wait.', 'โอ้ ไม่ๆๆๆ เรารอได้นะ'],
      ['Michelle', 'No, go on without me.', 'ไม่ต้องหรอก ไปกันก่อนเถอะ'],
      [
        'Al',
        'What about after the movie? Will you be free then, Michelle?',
        'แล้วหลังดูหนังเสร็จล่ะ มิเชลจะว่างไหม',
      ],
      [
        'Michelle',
        "Well, I'm supposed to meet a friend in about 2 hours and then I'm just going to go home.",
        'ก็ฉันต้องไปเจอเพื่อนอีกประมาณ 2 ชั่วโมง แล้วก็จะกลับบ้านเลยค่ะ',
      ],
      [
        'Al',
        "Oh, so you're busy then? Well, why don't you stop here after the movie and tell me how it was?",
        'อ๋อ งั้นก็ยุ่งอยู่สินะ งั้นดูหนังเสร็จแล้วแวะมาเล่าให้ฟังหน่อยว่าเป็นยังไงบ้างดีไหม',
      ],
      ['Michelle', 'Yeah, that would be great.', 'ได้สิคะ ดีเลย'],
      [
        'Al',
        "Okay. Uh, we'll see you here after the movie in about 2 hours.",
        'โอเค งั้นเจอกันที่นี่หลังดูหนังเสร็จ อีกประมาณ 2 ชั่วโมง',
      ],
      ['Michelle', 'Okay, sounds great.', 'โอเค ฟังดูดีเลยค่ะ'],
      ['Al', 'Great. Okay, bye.', 'เยี่ยม โอเค บาย'],
      ['Bob', 'Bye.', 'บาย'],
      ['Michelle', 'Bye, Bob.', 'บาย บ็อบ'],
    ],
  },
  {
    key: 'lst2-choose-movie',
    title: 'Choosing a Movie',
    emoji: '🎬',
    lines: [
      ['Al', 'Wow, this sure is a big theater.', 'ว้าว โรงหนังใหญ่จังเลยนะ'],
      ['Bob', 'Yeah, they have 10 movie screens.', 'ใช่ มีถึง 10 โรงเลย'],
      ['Al', 'Do you want to see every movie?', 'อยากดูทุกเรื่องเลยไหม'],
      [
        'Bob',
        'I don’t think so. I think one movie is enough.',
        'ไม่หรอก คิดว่าดูเรื่องเดียวก็พอ',
      ],
      [
        'Al',
        "What's this about — Iron Ladies 2?",
        'เรื่องนี้เกี่ยวกับอะไรเหรอ "สตรีเหล็ก 2"',
      ],
      [
        'Bob',
        "Oh, that's a foreign film. It's about a transsexual volleyball team. I've seen it.",
        'อ๋อ หนังเรื่องนั้นเกี่ยวกับทีมวอลเลย์บอลข้ามเพศ ฉันดูแล้ว',
      ],
      [
        'Al',
        'Well, how about The Trek? Have you seen The Trek?',
        'แล้ว "เดอะเทร็ค" ล่ะ เคยดูหรือยัง',
      ],
      ['Bob', 'Not yet.', 'ยังเลย'],
      ['Al', "It's an action movie.", 'เป็นหนังแอ็กชันนะ'],
      [
        'Bob',
        'Yeah, I want to see that, too.',
        'เออ อยากดูเรื่องนั้นเหมือนกัน',
      ],
      ['Al', "Oh, but it's not out yet.", 'อ้อ แต่ยังไม่เข้าฉายนะ'],
      ['Bob', 'Oh yeah, coming soon.', 'อ๋อ ใช่ เร็วๆ นี้สินะ'],
      ['Al', 'Have you seen Our Two Hearts?', 'เคยดู "หัวใจเราสองดวง" หรือยัง'],
      ['Bob', "Uh, what's that about?", 'เอ่อ เกี่ยวกับอะไรเหรอ'],
      [
        'Al',
        "Oh, it's a love story about this man and this woman and they're walking—",
        'อ๋อ เป็นหนังรักเกี่ยวกับผู้ชายกับผู้หญิงคู่นึง แล้วพวกเขาก็เดิน...',
      ],
      [
        'Bob',
        "Enough, enough! If it's a love story, I don't want to watch it.",
        'พอเถอะๆ ถ้าเป็นหนังรักฉันไม่ดูหรอก',
      ],
      [
        'Al',
        "Why not? They're so sad and romantic.",
        'ทำไมล่ะ มันเศร้าและโรแมนติกมากเลยนะ',
      ],
      ['Bob', "That's right.", 'ใช่เลย'],
      [
        'Bob',
        'And the last time we watched a love story, you cried.',
        'แล้วครั้งที่แล้วที่เราดูหนังรักด้วยกัน นายร้องไห้เลยนะ',
      ],
      [
        'Al',
        'I remember that. That was such a good story.',
        'จำได้เลย เรื่องนั้นดีมากจริงๆ',
      ],
      ['Bob', "Let's watch a comedy.", 'ไปดูหนังตลกกันดีกว่า'],
      [
        'Al',
        'Okay, I like to laugh. How about Fool School?',
        'โอเค ฉันชอบหัวเราะอยู่แล้ว แล้ว "ฟูลสคูล" ล่ะ',
      ],
      [
        'Bob',
        'I read about that in the newspaper.',
        'ฉันอ่านเจอในหนังสือพิมพ์',
      ],
      ['Al', "It's supposed to be very funny.", 'ว่ากันว่าตลกมากเลยนะ'],
      [
        'Bob',
        "Okay, let's watch Fool School. But we better hurry — it starts in 10 minutes.",
        'โอเค ดู "ฟูลสคูล" กันเถอะ แต่ต้องรีบแล้วนะ อีก 10 นาทีจะฉายแล้ว',
      ],
      ['Al', 'Perfect.', 'เยี่ยมเลย'],
      [
        'Bob',
        'Just enough time to get tickets and to go to the snack bar.',
        'พอดีเวลาซื้อตั๋วกับแวะซื้อขนมเลยพอดี',
      ],
    ],
  },
  {
    key: 'lst2-coincidence',
    title: 'What a Coincidence',
    emoji: '😲',
    lines: [
      ['Al', "Hey, Michelle. We're back.", 'เฮ้ มิเชล เรากลับมาแล้ว'],
      ['Michelle', 'Hey there.', 'ไงจ๊ะ'],
      [
        'Bob',
        'Hi, Michelle. I forgot my phone.',
        'หวัดดี มิเชล ผมลืมมือถือไว้',
      ],
      ['Michelle', 'I know. I kept it for you.', 'รู้แล้วค่ะ เก็บไว้ให้แล้ว'],
      ['Michelle', 'Did you like the movie?', 'ชอบหนังไหมคะ'],
      [
        'Al',
        'Oh, yeah. It was really funny. I laughed a lot.',
        'ชอบสิ ตลกมากเลย หัวเราะแทบตาย',
      ],
      ['Michelle', 'What movie was it?', 'ดูเรื่องอะไรเหรอ'],
      ['Al', 'It was called Fool School.', 'เรื่อง "ฟูลสคูล"'],
      [
        'Michelle',
        'Oh, that’s a very nice theater upstairs.',
        'อ๋อ โรงหนังชั้นบนสวยมากเลยนะ',
      ],
      ['Al', "Yeah, and it's really comfortable.", 'ใช่ แล้วก็นั่งสบายมากด้วย'],
      ['Bob', 'And Al ate a lot.', 'แล้วอัลก็กินเยอะมากด้วย'],
      ['Al', 'The food there is really good.', 'อาหารที่นั่นอร่อยมากจริงๆ'],
      [
        'Michelle',
        'Oh, excuse me. Hello. Okay, sure. See you soon. Bye-bye. That was my friend. She’s coming soon.',
        'อ้อ ขอตัวสักครู่นะคะ ฮัลโหล โอเคค่ะ แล้วเจอกันนะ บาย นั่นเพื่อนฉันเอง เดี๋ยวเธอจะมาแล้ว',
      ],
      ['Bob', 'Where is she now?', 'ตอนนี้เธออยู่ไหนเหรอ'],
      ['Michelle', 'Upstairs.', 'ชั้นบนค่ะ'],
      [
        'Bob',
        'Upstairs? We were just upstairs. The theater is upstairs.',
        'ชั้นบนเหรอ เราเพิ่งอยู่ชั้นบนมาเอง โรงหนังก็อยู่ชั้นบนนี่นา',
      ],
      [
        'Al',
        'You know, I can’t wait to go back and visit that snack bar there.',
        'รู้ไหม ฉันอยากกลับไปที่ร้านขนมชั้นบนอีกจังเลย',
      ],
      [
        'Michelle',
        "She's my friend, Wanita.",
        'อ๋อ นี่เพื่อนฉันเอง วานีต้าค่ะ',
      ],
      ['Wanita', 'Hello, Al. Hey, Bob.', 'สวัสดีค่ะ อัล เฮ้ บ็อบ'],
      ['Al', 'You know each other?', 'พวกคุณรู้จักกันเหรอ'],
      [
        'Al',
        "I've known Wanita for a long time.",
        'ฉันรู้จักวานีต้ามานานแล้วนะ',
      ],
      ['Bob', 'And I met Wanita just today.', 'ส่วนผมเพิ่งเจอวานีต้าวันนี้เอง'],
      [
        'Michelle',
        "You're kidding! Wanita is my roommate.",
        'ล้อเล่นน่า วานีต้าเป็นรูมเมทฉันเองนะ',
      ],
      ['Wanita', 'Yeah, roommates.', 'ใช่ค่ะ รูมเมทกัน'],
      ['Al', 'What a coincidence.', 'บังเอิญจังเลย'],
      ['Bob', "Yeah, that's quite a coincidence.", 'ใช่ บังเอิญมากเลย'],
      [
        'Al',
        'Hey, we should all go out sometime. It could be fun.',
        'เฮ้ พวกเราน่าจะไปเที่ยวด้วยกันสักครั้งนะ น่าจะสนุกดี',
      ],
      ['Michelle', 'That sounds like a great idea.', 'ไอเดียเยี่ยมเลยค่ะ'],
      [
        'Bob',
        "Why don't we have dinner or something?",
        'ไปกินมื้อเย็นด้วยกันไหม',
      ],
      ['Michelle', 'Sounds great.', 'ฟังดูดีเลยค่ะ'],
      [
        'Wanita',
        'Okay. Uh, sorry, not tonight. I am too tired.',
        'โอเคค่ะ แต่ขอโทษนะ คืนนี้ไม่ไหว เหนื่อยมากเลย',
      ],
      [
        'Al',
        'Well, how about later in the week?',
        'งั้นวันหลังในสัปดาห์นี้ล่ะ',
      ],
      ['Wanita', 'Perfect.', 'เยี่ยมเลยค่ะ'],
    ],
  },
  {
    key: 'lst2-making-date',
    title: 'Making a Date',
    emoji: '💐',
    lines: [
      ['Michelle', 'Hello.', 'ฮัลโหล'],
      ['Al', 'Hi, Michelle. This is Al.', 'สวัสดี มิเชล นี่อัลเอง'],
      ['Michelle', 'Hi, Al. How are you?', 'สวัสดีค่ะ อัล เป็นไงบ้าง'],
      ['Al', 'Fine, thank you.', 'สบายดี ขอบคุณ'],
      [
        'Al',
        "I'm calling to see if you and Wanita are free this Thursday.",
        'โทรมาถามว่าเธอกับวานีต้าว่างวันพฤหัสนี้ไหม',
      ],
      [
        'Michelle',
        "Why? What's happening this Thursday?",
        'ทำไมเหรอ วันพฤหัสมีอะไร',
      ],
      [
        'Al',
        'Well, if you and Wanita are free, I would like to invite you to dinner.',
        'ก็ถ้าว่างน่ะ อยากชวนไปทานมื้อเย็นด้วยกัน',
      ],
      [
        'Michelle',
        "Oh, dinner this Thursday? Um, well, I'm not free, but Wanita is.",
        'อ๋อ มื้อเย็นวันพฤหัสเหรอ เอ่อ...ฉันไม่ว่างนะ แต่วานีต้าว่าง',
      ],
      [
        'Al',
        "Aw, that's too bad. I'm sure Bob will be sorry to hear that.",
        'โอ้ แย่จังเลย บ็อบต้องเสียใจแน่ๆ ถ้ารู้',
      ],
      ['Michelle', 'Oh, Bob will be there, too?', 'อ๋อ บ็อบจะไปด้วยเหรอ'],
      ['Al', 'Yes, of course.', 'ใช่สิ แน่นอน'],
      [
        'Michelle',
        'Okay, let me check my schedule one more time.',
        'โอเค ขอเช็คตารางอีกทีนะคะ',
      ],
      ['Al', 'Okay.', 'โอเค'],
      [
        'Michelle',
        'Hey, guess what? I am free that evening.',
        'เฮ้ รู้อะไรไหม ฉันว่างเย็นนั้นแหละ',
      ],
      ['Al', 'Super! And how about Wanita?', 'เยี่ยมเลย! แล้ววานีต้าล่ะ'],
      [
        'Michelle',
        'Let me ask her... Yes, um, yes, she seems to be free, too.',
        'เดี๋ยวถามให้นะ...ได้ค่ะ เธอว่างเหมือนกัน',
      ],
      [
        'Al',
        'Great. Can we meet at 7:00 p.m.?',
        'เยี่ยมเลย นัดเจอกัน 1 ทุ่มได้ไหม',
      ],
      ['Michelle', 'Yes. Where shall we meet?', 'ได้ค่ะ แล้วจะเจอกันที่ไหนดี'],
      ['Al', 'How about KFC?', 'ร้านเคเอฟซีดีไหม'],
      ['Michelle', 'KFC?', 'เคเอฟซีเหรอ'],
      ['Al', "I'm just joking.", 'ล้อเล่นน่ะ'],
      [
        'Al',
        "Actually, I'm making reservations at the Chateau D'Eau.",
        'จริงๆ แล้วฉันจองโต๊ะไว้ที่ร้านชาโต เดอ นะ',
      ],
      [
        'Michelle',
        "Isn't that an expensive French restaurant?",
        'นั่นไม่ใช่ร้านอาหารฝรั่งเศสหรูราคาแพงเหรอ',
      ],
      [
        'Al',
        'Yes, but I have a coupon — buy one, get one.',
        'ใช่ แต่ฉันมีคูปองส่วนลดอยู่นะ ซื้อหนึ่งแถมหนึ่ง',
      ],
      ['Michelle', "Oh, that's great.", 'โอ้ ดีจังเลย'],
      [
        'Al',
        'So, can we meet there at 7:00 p.m.?',
        'งั้นเจอกันที่นั่น 1 ทุ่มนะ',
      ],
      [
        'Michelle',
        '7:00 p.m. This Thursday, we will be there. Okay, bye-bye.',
        '1 ทุ่มวันพฤหัสนี้ เราจะไปแน่นอนค่ะ โอเค บาย',
      ],
    ],
  },
  {
    key: 'lst2-go-to-shop',
    title: 'Going to the Shop',
    emoji: '🏪',
    lines: [
      ['Al', 'Michelle?', 'มิเชล'],
      ['Michelle', 'Hm?', 'อืม'],
      [
        'Al',
        "I'm going to the corner store. Do you want anything?",
        'ฉันจะไปร้านสะดวกซื้อแถวนี้ อยากได้อะไรไหม',
      ],
      ['Michelle', 'Wait, where are you going?', 'เดี๋ยวนะ จะไปไหนนะ'],
      [
        'Al',
        'The corner store, you know, 7-Eleven. Do you want anything?',
        'ร้านสะดวกซื้อไง เซเว่นอีเลฟเว่นน่ะ อยากได้อะไรไหม',
      ],
      [
        'Michelle',
        "Yeah. Um, I'd like a loaf of bread.",
        'เอาสิ เอ่อ...ขอขนมปังแท่งนึงนะ',
      ],
      [
        'Al',
        "A loaf of bread. Okay. I'll be right back.",
        'ขนมปังแท่งนึง โอเค เดี๋ยวมานะ',
      ],
      [
        'Michelle',
        'Wait, wait. Um... yeah, there was something else.',
        'เดี๋ยวๆ เอ่อ...ใช่ มีอย่างอื่นอีกด้วย',
      ],
      [
        'Al',
        'A loaf of bread and something else?',
        'ขนมปังแท่งนึงกับอย่างอื่นอีกเหรอ',
      ],
      ['Michelle', "I'm thinking...", 'คิดอยู่นะ...'],
      ['Al', 'I know — a roll of tissue, right?', 'รู้แล้ว กระดาษทิชชู่ใช่ไหม'],
      [
        'Michelle',
        "I'm so glad you said that! We're out of tissue.",
        'ดีใจจังที่พูดขึ้นมา ทิชชู่หมดพอดีเลย',
      ],
      ['Al', "Okay, I'll be right back.", 'โอเค เดี๋ยวมานะ'],
      ['Michelle', 'Wait, wait, wait.', 'เดี๋ยวๆๆ'],
      ['Al', 'Yeah?', 'ว่าไง'],
      [
        'Michelle',
        "Can you check whether they have today's newspaper?",
        'ช่วยดูให้หน่อยว่ามีหนังสือพิมพ์วันนี้ไหม',
      ],
      [
        'Al',
        "Um, I think by now they're probably out of today's paper.",
        'เอ่อ ป่านนี้หนังสือพิมพ์วันนี้คงหมดแล้วนะ',
      ],
      [
        'Michelle',
        "Well, if they have it, great. If they don't, forget about it.",
        'ถ้ามีก็ดี ถ้าไม่มีก็ไม่เป็นไร ไม่ต้องซื้อ',
      ],
      ['Al', "Okay, I'll be back.", 'โอเค เดี๋ยวมา'],
      [
        'Michelle',
        'Wait, I just remembered something. Can you get me some toothpaste?',
        'เดี๋ยวก่อน นึกออกอีกอย่าง ช่วยซื้อยาสีฟันให้หน่อยได้ไหม',
      ],
      ['Al', 'Some toothpaste?', 'ยาสีฟันเหรอ'],
      ['Michelle', 'Yes. Mint flavor.', 'ใช่ รสมินต์นะ'],
      ['Al', "Okay, I'll be back.", 'โอเค เดี๋ยวมา'],
      [
        'Michelle',
        'And a large box of laundry soap. Uh — do you have a pen?',
        'แล้วก็ผงซักฟอกกล่องใหญ่ด้วย เอ่อ...มีปากกาไหม',
      ],
      [
        'Al',
        'Here you go. I better write this down. Okay. Well, bread, right?',
        'นี่ไง ฉันว่าจดไว้ดีกว่า เอาล่ะ ขนมปังใช่ไหม',
      ],
      ['Michelle', 'Bread and tissue.', 'ขนมปังกับทิชชู่'],
      [
        'Al',
        'Mhm. And newspaper, if they have it.',
        'อือ แล้วก็หนังสือพิมพ์ ถ้ามี',
      ],
      ['Michelle', 'Mhm. Um, soap, right?', 'อือ แล้วก็ผงซักฟอกด้วยใช่ไหม'],
      ['Al', 'Mhm.', 'อือ'],
      [
        'Michelle',
        'Oh, I know — a light bulb for my closet.',
        'อ้อ นึกออกแล้ว หลอดไฟสำหรับตู้เสื้อผ้าฉันด้วย',
      ],
      [
        'Al',
        'A light bulb for your closet? Wait, I changed my mind.',
        'หลอดไฟสำหรับตู้เสื้อผ้าเหรอ เดี๋ยวนะ ฉันเปลี่ยนใจแล้ว',
      ],
      ['Michelle', 'Changed your mind?', 'เปลี่ยนใจเหรอ'],
      ['Al', "Yeah, I'll go by myself tomorrow.", 'ใช่ พรุ่งนี้เธอไปเองเถอะ'],
    ],
  },
  {
    key: 'lst2-postponing',
    title: 'Postponing',
    emoji: '⏰',
    lines: [
      ['Michelle', 'Wanita?', 'วานีต้า'],
      ['Wanita', 'Yes?', 'คะ'],
      ['Michelle', 'I have bad news.', 'ฉันมีข่าวร้ายมาบอก'],
      ['Wanita', 'Bad news? What is it?', 'ข่าวร้ายเหรอ อะไรเหรอ'],
      [
        'Michelle',
        'I cannot go to the dinner tomorrow.',
        'พรุ่งนี้ฉันไปทานมื้อเย็นไม่ได้แล้ว',
      ],
      ['Wanita', "You can't go to dinner? Why not?", 'ไปไม่ได้เหรอ ทำไมล่ะ'],
      [
        'Michelle',
        'I forgot — I have a dentist appointment.',
        'ลืมไปเลยว่ามีนัดหมอฟัน',
      ],
      [
        'Wanita',
        "Oh, that's no problem. Just cancel it.",
        'อ๋อ ไม่มีปัญหาหรอก ยกเลิกนัดซะสิ',
      ],
      ['Michelle', "I can't.", 'ยกเลิกไม่ได้หรอก'],
      [
        'Wanita',
        "Sure you can. It's easy. Just call the dentist's office and cancel it.",
        'ยกเลิกได้สิ ง่ายจะตาย แค่โทรไปคลินิกแล้วบอกยกเลิกก็พอ',
      ],
      [
        'Michelle',
        "No, you don't understand. He's a popular dentist. It will take me another month just to make another appointment.",
        'ไม่ใช่แบบนั้น เธอไม่เข้าใจ หมอคนนี้คิวแน่นมาก ถ้ายกเลิกต้องรออีกเป็นเดือนกว่าจะได้นัดใหม่',
      ],
      [
        'Wanita',
        'Well, why are you going to the dentist? Are you in pain?',
        'แล้วทำไมถึงต้องไปหาหมอฟันล่ะ ปวดฟันเหรอ',
      ],
      [
        'Michelle',
        'No, I have to have a cavity filled.',
        'เปล่า แค่ต้องไปอุดฟันน่ะ',
      ],
      [
        'Wanita',
        'That’s no problem. I can fill it for you right here.',
        'ไม่มีปัญหาเลย ฉันอุดให้ที่นี่ก็ได้',
      ],
      ['Michelle', 'What?!', 'อะไรนะ!'],
      [
        'Michelle',
        'Oh, that’s all right. I was just really excited about going to dinner with Al.',
        'ไม่เป็นไรหรอก แค่ฉันตื่นเต้นมากที่จะได้ไปทานมื้อเย็นกับอัล',
      ],
      ['Wanita', 'I know. I feel terrible.', 'รู้แล้ว ฉันก็รู้สึกแย่เหมือนกัน'],
      [
        'Michelle',
        'That’s okay. Um, are you free on Friday?',
        'ไม่เป็นไรหรอก เอ่อ...วันศุกร์เธอว่างไหม',
      ],
      ['Wanita', 'Yeah, in the evening.', 'ว่างสิ ตอนเย็น'],
      ['Michelle', 'Me, too.', 'ฉันก็ว่างเหมือนกัน'],
      [
        'Wanita',
        'Hey, maybe we can move the date to Friday.',
        'เฮ้ งั้นเลื่อนนัดไปวันศุกร์แทนดีไหม',
      ],
      [
        'Michelle',
        "Good idea. I'll call Al and see if we can postpone until Friday.",
        'ไอเดียดี เดี๋ยวโทรหาอัลดูว่าเลื่อนเป็นวันศุกร์ได้ไหม',
      ],
      ['Wanita', 'That sounds perfect.', 'ฟังดูดีเลย'],
    ],
  },
  {
    key: 'lst2-pass-message',
    title: 'Passing a Message',
    emoji: '☎️',
    lines: [
      ['Al', 'Hello.', 'ฮัลโหล'],
      ['Wanita', "Hi, Al. It's Wanita.", 'สวัสดีค่ะ อัล นี่วานีต้าเอง'],
      [
        'Al',
        'Oh, hey Wanita. How are you this evening?',
        'อ๋อ เฮ้ วานีต้า เย็นนี้เป็นไงบ้าง',
      ],
      ['Wanita', 'Not so good, sorry to say.', 'ไม่ค่อยดีเท่าไหร่เลยค่ะ'],
      [
        'Al',
        "Oh, really? What's wrong? Are you okay?",
        'จริงเหรอ มีอะไรเหรอ ไม่เป็นไรใช่ไหม',
      ],
      [
        'Wanita',
        "Well, I'm fine, but I was calling to see if we can postpone our date.",
        'ฉันไม่เป็นไรค่ะ แต่โทรมาถามว่าเลื่อนนัดของเราได้ไหม',
      ],
      ['Al', 'You want to postpone our date?', 'อยากเลื่อนนัดเหรอ'],
      ['Wanita', 'Yeah.', 'ค่ะ'],
      [
        'Wanita',
        "See, Michelle has a dental appointment and she can't cancel it.",
        'คือมิเชลมีนัดหมอฟัน แล้วยกเลิกไม่ได้ค่ะ',
      ],
      [
        'Al',
        'Oh, I see. Well, that does sound important.',
        'อ๋อ เข้าใจแล้ว ก็ฟังดูสำคัญนะ',
      ],
      ['Wanita', "It's rather important.", 'ค่อนข้างสำคัญเลยค่ะ'],
      [
        'Al',
        'So, when do you want to postpone our date to?',
        'แล้วอยากเลื่อนไปเป็นวันไหนล่ะ',
      ],
      ['Wanita', 'Um, is Friday okay?', 'เอ่อ...วันศุกร์ได้ไหมคะ'],
      [
        'Al',
        'Friday? This Friday, like the day after tomorrow?',
        'วันศุกร์เหรอ วันศุกร์นี้ มะรืนนี้เลยเหรอ',
      ],
      ['Wanita', 'Yeah. Is that okay?', 'ค่ะ ได้ไหมคะ'],
      ['Al', "Yeah, that's great. I'm so happy.", 'ได้สิ เยี่ยมเลย ดีใจมากเลย'],
      [
        'Al',
        'I thought you were going to postpone it longer.',
        'นึกว่าจะเลื่อนไปนานกว่านี้ซะอีก',
      ],
      [
        'Wanita',
        "No way. I've really been looking forward to going out to dinner with you and Bob and Michelle.",
        'ไม่หรอกค่ะ ฉันตั้งตารอที่จะได้ไปทานมื้อเย็นกับคุณ บ็อบ และมิเชลมากเลย',
      ],
      [
        'Al',
        "I know she's been looking forward to it, too. That's great.",
        'รู้แล้วว่าเธอก็ตั้งตารอเหมือนกัน เยี่ยมเลย',
      ],
      [
        'Wanita',
        'Can you please tell Bob if you see him?',
        'ช่วยบอกบ็อบให้ทีถ้าเจอเขานะคะ',
      ],
      [
        'Al',
        "Yeah, sure. I'll tell Bob that we've postponed dinner until Friday.",
        'ได้สิ เดี๋ยวจะบอกบ็อบว่าเราเลื่อนมื้อเย็นไปเป็นวันศุกร์',
      ],
      ['Wanita', "Okay. That's all. Thanks.", 'โอเคค่ะ แค่นี้แหละ ขอบคุณนะคะ'],
      ['Al', 'Oh, thank you, too. Bye.', 'ขอบคุณเหมือนกัน บาย'],
      ['Wanita', 'Bye.', 'บายค่ะ'],
      [
        'Al',
        "Bob, we've postponed dinner until Friday.",
        'บ็อบ เราเลื่อนมื้อเย็นไปเป็นวันศุกร์แล้วนะ',
      ],
      ['Bob', 'Friday? Okay, no problem.', 'วันศุกร์เหรอ โอเค ไม่มีปัญหา'],
    ],
  },
  {
    key: 'lst2-reservation',
    title: 'Making a Reservation',
    emoji: '🍽️',
    lines: [
      [
        'Bob',
        "I'm glad they called, because you like Michelle.",
        'ดีใจจังที่พวกเขาโทรมา เพราะนายชอบมิเชลนี่นา',
      ],
      [
        'Al',
        'Well, yes, but I forgot to make a reservation.',
        'ก็ใช่ แต่ฉันลืมจองโต๊ะไปเลย',
      ],
      ['Bob', 'Whoops.', 'โอ๊ะ'],
      [
        'Al',
        "Yeah, I'll call and make a reservation now.",
        'ใช่ เดี๋ยวโทรไปจองตอนนี้เลย',
      ],
      [
        'Staff',
        'Good evening, Chateau D’Eau.',
        'สวัสดีตอนเย็นค่ะ ร้านชาโต เดอ',
      ],
      [
        'Al',
        "Hello, I'd like to make a reservation, please.",
        'สวัสดีครับ ผมอยากจองโต๊ะครับ',
      ],
      ['Staff', 'Yes, sir. For what day?', 'ได้ค่ะ วันไหนดีคะ'],
      ['Al', 'Friday.', 'วันศุกร์ครับ'],
      [
        'Staff',
        'Friday, yes sir. How many people in your party?',
        'วันศุกร์นะคะ กี่ท่านคะ',
      ],
      [
        'Al',
        'Uh, four people. Two men and two women.',
        'เอ่อ สี่คนครับ ผู้ชายสองคน ผู้หญิงสองคน',
      ],
      [
        'Staff',
        'Very good, sir. What time would you like the reservation for?',
        'ได้ค่ะ อยากจองเวลาไหนคะ',
      ],
      ['Al', 'We will arrive at 7:00 p.m.', 'เราจะไปถึงตอน 1 ทุ่มครับ'],
      [
        'Staff',
        'I’m afraid I do not have anything available for 7:00 p.m., sir.',
        'เกรงว่าช่วง 1 ทุ่มเต็มแล้วค่ะ',
      ],
      ['Al', 'Oh, no.', 'โอ้ ไม่นะ'],
      [
        'Staff',
        'I do have a table available for 7:30 p.m.',
        'แต่มีโต๊ะว่างตอน 1 ทุ่มครึ่งค่ะ',
      ],
      ['Al', '7:30 — that would be great.', '1 ทุ่มครึ่งก็ดีเลยครับ'],
      [
        'Staff',
        'Would you prefer smoking or non-smoking?',
        'รับโซนสูบบุหรี่หรือปลอดบุหรี่ดีคะ',
      ],
      ['Al', 'Non-smoking, thank you.', 'ปลอดบุหรี่ครับ ขอบคุณ'],
      ['Staff', 'Your name, please, sir?', 'ขอชื่อด้วยค่ะ'],
      ['Al', 'Fala. Albert Fala.', 'ฟาลา อัลเบิร์ต ฟาลาครับ'],
      [
        'Staff',
        'Very good, Mr. Fala. You have a reservation for 4 at 7:30 p.m. this Friday, non-smoking.',
        'ได้ค่ะ คุณฟาลา คุณจองโต๊ะสำหรับ 4 ท่าน เวลา 1 ทุ่มครึ่งวันศุกร์นี้ โซนปลอดบุหรี่นะคะ',
      ],
      ['Al', 'Great. Thank you so much.', 'เยี่ยมเลยครับ ขอบคุณมากครับ'],
      ['Staff', 'My pleasure, sir.', 'ยินดีค่ะ'],
    ],
  },
  {
    key: 'lst2-restaurant',
    title: 'At the Restaurant',
    emoji: '🍷',
    lines: [
      ['Michelle', 'This is a nice restaurant.', 'ร้านนี้สวยดีจังเลย'],
      [
        'Wanita',
        'Yes. Thank you for inviting us. I hear the food is delicious.',
        'ใช่ค่ะ ขอบคุณที่ชวนมานะ ได้ยินมาว่าอาหารอร่อยมาก',
      ],
      [
        'Bob',
        'This is the nicest restaurant I have ever been to in my life.',
        'นี่เป็นร้านอาหารที่ดีที่สุดที่ผมเคยไปมาในชีวิตเลย',
      ],
      [
        'Al',
        'Bob, do you have your gift ready?',
        'บ็อบ เตรียมของขวัญพร้อมหรือยัง',
      ],
      ['Bob', 'Yes, Al, I do.', 'พร้อมแล้ว อัล'],
      [
        'Al',
        'Michelle, Wanita — Bob and I have gifts for you.',
        'มิเชล วานีต้า ผมกับบ็อบมีของขวัญให้พวกคุณด้วยนะ',
      ],
      ['Michelle', 'Oh, you shouldn’t have.', 'โอ้ ไม่ต้องหรอกค่ะ'],
      [
        'Al',
        'Well, we decided flowers are too boring and chocolate will make you fat. So we put our heads together to come up with some really exciting gifts.',
        'ก็เราคิดว่าดอกไม้มันน่าเบื่อไป ส่วนช็อกโกแลตก็ทำให้อ้วน เลยช่วยกันคิดหาของขวัญที่น่าตื่นเต้นกว่านั้น',
      ],
      ['Michelle', 'You guys are so kind.', 'พวกคุณใจดีจังเลย'],
      [
        'Wanita',
        'Yes, you two are so very thoughtful.',
        'ใช่ค่ะ คุณสองคนช่างใส่ใจมากเลย',
      ],
      ['Al', 'Bob, would you like to go first?', 'บ็อบ อยากให้ก่อนไหม'],
      [
        'Bob',
        "Yes, Al. Don't mind if I do. Wanita, this is for you.",
        'ครับ อัล ไม่ว่ากันนะ วานีต้า นี่สำหรับคุณ',
      ],
      ['Wanita', 'A goldfish?', 'ปลาทองเหรอ'],
      [
        'Bob',
        "No, not a goldfish. It's an Oscar fish.",
        'ไม่ใช่ปลาทองหรอก เป็นปลาออสการ์ต่างหาก',
      ],
      ['Wanita', 'Well, thank you, I think.', 'เอ่อ...ขอบคุณนะ (มั้ง)'],
      [
        'Bob',
        'And when it gets bigger, it eats the goldfish.',
        'แล้วพอมันโตขึ้น มันจะกินปลาทองด้วยนะ',
      ],
      ['Michelle', "That's disgusting.", 'น่าขยะแขยงจัง'],
      ['Wanita', "Wow, that's cool.", 'ว้าว เจ๋งไปเลย'],
      ['Al', 'Now for you, Michelle. Voilà!', 'ทีนี้ของมิเชล วัวลา!'],
      [
        'Michelle',
        'What is this? Some sort of dart board? Oh, Al, you’re so handsome in your picture!',
        'นี่อะไรเหรอ ปาเป้าเหรอ โอ้ อัล คุณหล่อมากเลยในรูปนี้',
      ],
      [
        'Al',
        'So, what do you think? Do you like your gifts?',
        'แล้วเป็นไงบ้าง ชอบของขวัญไหม',
      ],
      ['Wanita', 'Well, I really like the fish.', 'ฉันชอบปลามากเลยค่ะ'],
      ['Michelle', 'I really like your picture, Al.', 'ฉันชอบรูปนี้มากเลย อัล'],
    ],
  },
  {
    key: 'lst2-toast',
    title: 'Making a Toast',
    emoji: '🥂',
    lines: [
      ['Michelle', 'The dinner was delicious.', 'มื้อเย็นนี้อร่อยมากเลย'],
      [
        'Wanita',
        'And the company was excellent.',
        'แล้วก็ได้อยู่กับเพื่อนดีๆ ด้วย',
      ],
      [
        'Al',
        "Well, I'm glad you like your gift, Wanita.",
        'ดีใจที่ชอบของขวัญนะ วานีต้า',
      ],
      [
        'Wanita',
        'Yes, Al. I really do. Thank you. I like my fish. I can’t wait to feed it.',
        'ใช่ค่ะ อัล ชอบมากจริงๆ ขอบคุณนะ ชอบปลาตัวนี้มากเลย รอให้อาหารมันไม่ไหวแล้ว',
      ],
      ['Al', 'So, do you have a name for it yet?', 'แล้วตั้งชื่อให้มันหรือยัง'],
      [
        'Wanita',
        'No, not yet. But I’ll think of one soon.',
        'ยังเลยค่ะ แต่เดี๋ยวจะคิดชื่อให้เร็วๆ นี้',
      ],
      ['Bob', "Isn't life funny?", 'ชีวิตมันตลกดีเนอะ'],
      [
        'Al',
        'Yes. Especially the way you like Michelle, but I like you, Wanita.',
        'ใช่ โดยเฉพาะที่นายชอบมิเชล แต่ฉันกลับชอบเธอ วานีต้า',
      ],
      [
        'Wanita',
        'And Michelle likes me, but I like you, Bob.',
        'แล้วมิเชลก็ชอบฉัน แต่ฉันกลับชอบคุณ บ็อบ',
      ],
      ['Al', 'It makes me dizzy just thinking about it.', 'แค่คิดก็มึนหัวแล้ว'],
      [
        'Michelle',
        "Wait, I'm confused. I don't know whether I like Al or Bob.",
        'เดี๋ยวนะ ฉันงงไปหมดแล้ว ไม่รู้เหมือนกันว่าชอบอัลหรือบ็อบกันแน่',
      ],
      ['Wanita', 'I think I like Al.', 'ฉันว่าฉันชอบอัลนะ'],
      [
        'Bob',
        'This was such a nice dinner. We’ll have to do it again. Next time, Michelle and I will get gifts for you.',
        'มื้อเย็นนี้ดีมากเลย เราต้องทำแบบนี้อีกนะ ครั้งหน้ามิเชลกับผมจะเตรียมของขวัญให้พวกคุณบ้าง',
      ],
      [
        'Wanita',
        "And don't forget that it's okay to trade with each other.",
        'แล้วก็อย่าลืมนะว่าแลกกันได้เสมอ',
      ],
      [
        'Michelle',
        "I've had such a nice time this evening.",
        'เย็นนี้มีความสุขมากเลยค่ะ',
      ],
      [
        'Al',
        "I have to thank you all for a wonderful time. Let's make a toast — to everybody liking everybody else, and to beautiful friendship.",
        'ขอบคุณทุกคนสำหรับค่ำคืนที่ดีนะ มาชนแก้วกัน...แด่การที่ทุกคนชอบกันและกัน และแด่มิตรภาพอันงดงาม',
      ],
      ['Bob', 'May it last forever.', 'ขอให้ยืนยาวตลอดไป'],
      ['Wanita', 'Forever and a day.', 'ตลอดไปและตลอดกาล'],
      ['All', 'Cheers!', 'ชนแก้ว!'],
    ],
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
    entities: [ListeningLesson, ListeningUnit, ListeningLine],
    synchronize: SHOULD_SYNCHRONIZE,
  });

  await dataSource.initialize();
  const lessonRepo = dataSource.getRepository(ListeningLesson);
  const unitRepo = dataSource.getRepository(ListeningUnit);
  const lineRepo = dataSource.getRepository(ListeningLine);

  let lesson = await lessonRepo.findOne({ where: { key: LESSON_KEY } });
  if (!lesson) {
    lesson = lessonRepo.create({
      key: LESSON_KEY,
      title: LESSON_TITLE,
      emoji: LESSON_EMOJI,
      displayOrder: 2,
    });
  } else {
    lesson.title = LESSON_TITLE;
    lesson.emoji = LESSON_EMOJI;
  }
  lesson = await lessonRepo.save(lesson);

  let unitsUpserted = 0;
  let linesInserted = 0;

  for (let i = 0; i < UNITS.length; i++) {
    const u = UNITS[i];
    const startSeconds = UNIT_START_SECONDS[i];
    const endSeconds = UNIT_START_SECONDS[i + 1] ?? VIDEO_END_SECONDS;

    let unit = await unitRepo.findOne({ where: { key: u.key } });
    if (!unit) {
      unit = unitRepo.create({
        lesson,
        key: u.key,
        title: u.title,
        emoji: u.emoji,
        displayOrder: i + 1,
        videoId: VIDEO_ID,
        startSeconds,
        endSeconds,
      });
    } else {
      unit.lesson = lesson;
      unit.title = u.title;
      unit.emoji = u.emoji;
      unit.displayOrder = i + 1;
      unit.videoId = VIDEO_ID;
      unit.startSeconds = startSeconds;
      unit.endSeconds = endSeconds;
    }
    unit = await unitRepo.save(unit);
    unitsUpserted++;

    await lineRepo.delete({ unit: { id: unit.id } });
    const lines = u.lines.map(([speaker, en, th], idx) =>
      lineRepo.create({
        unit,
        orderIndex: idx + 1,
        speaker,
        textEn: en,
        textTh: th,
      }),
    );
    await lineRepo.save(lines);
    linesInserted += lines.length;
  }

  console.log(
    `Listening seed (Lesson 2) done: units=${unitsUpserted}, lines=${linesInserted}`,
  );
  await dataSource.destroy();
}

main().catch((err) => {
  console.error('Listening seed (Lesson 2) failed:', err);
  process.exit(1);
});
