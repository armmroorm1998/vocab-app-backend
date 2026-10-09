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

// Lesson 3 — "Easy English for Beginners — English Conversation 3"
// https://www.youtube.com/watch?v=9lkZiy_lWHA
// Unlike Lessons 1-2, this video is one continuous story with no spoken
// "Unit N" markers, so scenes are split by narrative section instead, with
// start seconds read from the auto-caption transcript's own timestamps at
// (or immediately after) the point where each scene begins.

const LESSON_KEY = 'lesson-3';
const LESSON_TITLE = 'Lesson 3: English Conversation 3';
const LESSON_EMOJI = '🏠';

const VIDEO_ID = '9lkZiy_lWHA';

const UNIT_START_SECONDS = [
  7, 80, 125, 185, 270, 405, 505, 615, 753, 905, 1150, 1390, 1550, 1634, 1680,
  1850, 1954, 2010, 2145, 2290,
];
// Approximate end of the video, after the closing vocabulary Q&A.
const VIDEO_END_SECONDS = 2520;

type SeedLine = [speaker: string, en: string, th: string];

type SeedUnit = {
  key: string;
  title: string;
  emoji: string;
  lines: SeedLine[];
};

const UNITS: SeedUnit[] = [
  {
    key: 'lst3-moving-day',
    title: 'Moving Day — Meeting the Williams',
    emoji: '📦',
    lines: [
      [
        'Mary',
        'Oh, David, help me! This box is too heavy.',
        'โอ๊ย เดวิด ช่วยหน่อยสิ กล่องนี้หนักมากเลย',
      ],
      ['David', 'Just a moment, Mary.', 'รอเดี๋ยวนะ แมรี่'],
      [
        'Tina',
        "That's okay, Dad. I can help, Mom.",
        'ไม่เป็นไรค่ะพ่อ หนูช่วยแม่เองได้',
      ],
      [
        'Mary',
        'Thanks, Tina. Phew, I am so tired.',
        'ขอบใจนะทีน่า โอ๊ย เหนื่อยจังเลย',
      ],
      [
        'David',
        'I am too, Mary. But there are a lot more boxes out there to be moved.',
        'ฉันก็เหนื่อยเหมือนกัน แมรี่ แต่ยังมีกล่องอีกเยอะเลยที่ต้องขน',
      ],
      [
        'Joe',
        'Hi, my name is Joe Williams, and this is my wife, Sue. We live in the next apartment.',
        'สวัสดีครับ ผมชื่อโจ วิลเลียมส์ นี่ภรรยาผม ซู เราอยู่ห้องข้างๆ นี่เองครับ',
      ],
      ['Mary', 'Hello, Joe. Hello, Sue.', 'สวัสดีค่ะ โจ สวัสดีค่ะ ซู'],
      [
        'Mary',
        'Hi, my name is Mary White. Nice to meet you.',
        'สวัสดีค่ะ ฉันชื่อแมรี่ ไวท์ ยินดีที่ได้รู้จักนะคะ',
      ],
      [
        'Sue',
        'You must be the new family living in this apartment.',
        'คุณคงเป็นครอบครัวใหม่ที่ย้ายมาอยู่ห้องนี้สินะคะ',
      ],
      [
        'Mary',
        'Yes, we are. Would you like to come in?',
        'ใช่ค่ะ เชิญเข้ามาข้างในไหมคะ',
      ],
      [
        'Mary',
        'This is Joe and Sue Williams. This is my husband, David, and our daughter, Tina.',
        'นี่โจกับซู วิลเลียมส์นะคะ แล้วนี่สามีฉัน เดวิด กับลูกสาว ทีน่า',
      ],
      [
        'David',
        'Hi, Joe. Nice to meet you.',
        'สวัสดีครับ โจ ยินดีที่ได้รู้จัก',
      ],
      [
        'David',
        'Hi, Sue. Nice to meet you.',
        'สวัสดีครับ ซู ยินดีที่ได้รู้จัก',
      ],
      [
        'Tina',
        "Hello, Mr. and Mrs. Williams. It's very nice to meet you.",
        'สวัสดีค่ะ คุณโจ คุณซู ยินดีที่ได้รู้จักมากเลยค่ะ',
      ],
      ['Joe', 'Nice to meet you, too.', 'ยินดีที่ได้รู้จักเหมือนกันครับ'],
      ['Sue', 'Nice to meet you.', 'ยินดีที่ได้รู้จักค่ะ'],
      [
        'Joe',
        'So, can we help you? You have so many boxes.',
        'เอาล่ะ ให้เราช่วยไหมครับ กล่องเยอะขนาดนี้',
      ],
      ['Mary', "You don't mind?", 'ไม่รบกวนใช่ไหมคะ'],
      [
        'Sue',
        "We don't mind at all. We're happy to help our new neighbors.",
        'ไม่รบกวนเลยค่ะ เรายินดีช่วยเพื่อนบ้านใหม่อยู่แล้ว',
      ],
      ['Mary', 'Oh, thanks. Great.', 'โอ้ ขอบคุณมากค่ะ เยี่ยมเลย'],
    ],
  },
  {
    key: 'lst3-next-morning',
    title: 'The Next Morning',
    emoji: '🌅',
    lines: [
      ['Joe', 'Hi.', 'หวัดดีครับ'],
      ['David', 'Good morning.', 'อรุณสวัสดิ์ครับ'],
      ['Sue', 'Yeah, good morning.', 'ค่ะ อรุณสวัสดิ์'],
      [
        'Mary',
        "How are you this morning? How's it going?",
        'เช้านี้เป็นไงบ้างคะ เป็นยังไงบ้าง',
      ],
      ['Joe', 'Good morning.', 'อรุณสวัสดิ์ครับ'],
      ['Sue', 'Wow, this looks really nice.', 'ว้าว ดูดีมากเลยนะ'],
      ['Sue', 'Good morning, David.', 'อรุณสวัสดิ์ค่ะ เดวิด'],
      ['David', 'Good morning, Joe.', 'อรุณสวัสดิ์ครับ โจ'],
      ['Joe', 'How are you this morning?', 'เช้านี้เป็นไงบ้างครับ'],
      ['David', "I'm fine, thanks. And you?", 'สบายดีครับ ขอบคุณ แล้วคุณล่ะ'],
      ['Joe', 'Oh, I am a little bit tired.', 'อ๋อ ผมเหนื่อยนิดหน่อยครับ'],
      [
        'David',
        'Well, me too. We worked very hard last night.',
        'ผมก็เหมือนกัน เมื่อคืนเราทำงานหนักมากเลย',
      ],
      [
        'Joe',
        'Yes, we did. Thanks for your help.',
        'ใช่เลยครับ ขอบคุณที่ช่วยนะ',
      ],
      ['David', "You're welcome, Joe.", 'ไม่เป็นไรเลยครับ โจ'],
      [
        'Sue',
        'David and Mary, I would like you to meet the Smith family.',
        'เดวิด แมรี่ ให้ฉันแนะนำครอบครัวสมิธให้รู้จักนะคะ',
      ],
    ],
  },
  {
    key: 'lst3-meet-smiths',
    title: 'Meeting the Smith Family',
    emoji: '👋',
    lines: [
      [
        'Sue',
        'This is Bill Smith, his wife Kathy, and their son, Jack.',
        'นี่บิล สมิธ ภรรยาเขาแคที่ และลูกชายเขา แจ็คค่ะ',
      ],
      [
        'David',
        "I'm David White. Nice to meet you.",
        'ผมเดวิด ไวท์ ยินดีที่ได้รู้จักครับ',
      ],
      [
        'Bill',
        'Nice to meet you, too, David.',
        'ยินดีที่ได้รู้จักเหมือนกันครับ เดวิด',
      ],
      [
        'Kathy',
        "Good morning, Mary. I'm Kathy.",
        'อรุณสวัสดิ์ค่ะ แมรี่ ฉันแคที่ค่ะ',
      ],
      [
        'Mary',
        'Good morning. Nice to meet you.',
        'อรุณสวัสดิ์ค่ะ ยินดีที่ได้รู้จักนะคะ',
      ],
      ['Kathy', 'This is lovely furniture.', 'เฟอร์นิเจอร์สวยจังเลยค่ะ'],
      [
        'Mary',
        "Oh, thank you. It was my mother's.",
        'โอ้ ขอบคุณค่ะ เป็นของคุณแม่ฉันน่ะ',
      ],
      ['Kathy', 'Yes.', 'ค่ะ'],
      ['Mary', 'Would you like to sit down?', 'นั่งก่อนไหมคะ'],
      ['Kathy', 'Sure.', 'ได้ค่ะ'],
      [
        'Tina',
        "Mom, what should I do with this box? Oh, hi — I'm Tina.",
        'แม่คะ กล่องนี้จะให้หนูทำยังไงดี อ้อ หวัดดีค่ะ หนูชื่อทีน่า',
      ],
      [
        'Jack',
        "Hi. Uh, my name's Jack. Do you guys live here, too?",
        'หวัดดีครับ เอ่อ ผมชื่อแจ็ค พวกคุณย้ายมาอยู่ที่นี่เหมือนกันเหรอ',
      ],
      [
        'Tina',
        'Yeah. Um, I moved in yesterday.',
        'ใช่ค่ะ ฉันเพิ่งย้ายมาเมื่อวานนี้เอง',
      ],
      [
        'Jack',
        'Great. Uh, great. Uh, I live right next door.',
        'เยี่ยมเลย เอ่อ เยี่ยมเลย ผมอยู่ห้องข้างๆ นี่เองครับ',
      ],
      [
        'Tina',
        "Good, because I don't know anybody else here.",
        'ดีจังเลย เพราะฉันไม่รู้จักใครที่นี่เลย',
      ],
      [
        'Mary',
        'Tina, come here. I would like you to meet Bill and Kathy Smith.',
        'ทีน่า มานี่หน่อยลูก มาทำความรู้จักกับบิลกับแคที่ สมิธสิ',
      ],
      [
        'Tina',
        "Hello, Mr. and Mrs. Smith. It's nice to meet you.",
        'สวัสดีค่ะ คุณบิล คุณแคที่ ยินดีที่ได้รู้จักค่ะ',
      ],
      [
        'Kathy',
        'Mary, you have a lovely daughter.',
        'แมรี่ ลูกสาวคุณน่ารักมากเลยนะคะ',
      ],
      [
        'Mary',
        "Thank you. She's not only lovely, she's shy also.",
        'ขอบคุณค่ะ เธอไม่ใช่แค่น่ารักอย่างเดียว แต่ยังขี้อายด้วยนะ',
      ],
    ],
  },
  {
    key: 'lst3-supermarket-call',
    title: 'A Phone Call — Going to the Supermarket',
    emoji: '📞',
    lines: [
      [
        'Mary',
        'Hello, this is the White residence.',
        'ฮัลโหล บ้านครอบครัวไวท์ค่ะ',
      ],
      [
        'Sue',
        'Hello, may I please speak with Mary?',
        'สวัสดีค่ะ ขอสายแมรี่หน่อยได้ไหมคะ',
      ],
      ['Mary', 'This is Mary speaking.', 'แมรี่พูดค่ะ'],
      [
        'Sue',
        'Hi Mary, this is Sue. How are you today?',
        'หวัดดีแมรี่ นี่ซูนะ วันนี้เป็นไงบ้าง',
      ],
      ['Mary', "Oh, I'm fine, Sue. How are you?", 'สบายดีค่ะ ซู แล้วเธอล่ะ'],
      [
        'Sue',
        "I'm fine. I'm sorry to bother you. Are you busy?",
        'สบายดีค่ะ ขอโทษที่รบกวนนะ กำลังยุ่งอยู่หรือเปล่า',
      ],
      [
        'Mary',
        "Not too busy. I'm cleaning the apartment right now.",
        'ไม่ค่อยยุ่งเท่าไหร่ค่ะ กำลังทำความสะอาดห้องอยู่พอดี',
      ],
      [
        'Sue',
        'Ah, listen, Mary. I was wondering, do you want to join Kathy and me today?',
        'อ้อ ฟังนะแมรี่ ฉันสงสัยว่าวันนี้อยากไปกับฉันกับแคที่ไหม',
      ],
      ['Mary', 'Where are you going?', 'จะไปไหนเหรอ'],
      [
        'Sue',
        'We both need to buy some food at the supermarket.',
        'เราสองคนต้องไปซื้อของที่ซูเปอร์มาร์เก็ตน่ะ',
      ],
      [
        'Mary',
        'Oh, great! I am so happy you invited me to join you.',
        'โอ้ เยี่ยมเลย ดีใจมากที่ชวนฉันไปด้วย',
      ],
      ['Sue', 'Why is that, Mary?', 'ทำไมล่ะแมรี่'],
      [
        'Mary',
        'Because I do not have any food in the apartment.',
        'เพราะในห้องฉันไม่มีอาหารเลยสักนิด',
      ],
      [
        'Sue',
        'Oh, I think you really need to go then.',
        'อ๋อ งั้นเธอต้องไปจริงๆ แล้วล่ะ',
      ],
      [
        'Mary',
        "Yes, I agree with you. I know tonight David and Tina will be very hungry if I don't have any food from the supermarket.",
        'ใช่ค่ะ เห็นด้วยเลย รู้เลยว่าคืนนี้เดวิดกับทีน่าต้องหิวมากแน่ๆ ถ้าฉันไม่มีอาหารจากซูเปอร์มาร์เก็ต',
      ],
      [
        'Sue',
        'Good. So, um, Kathy and I will go at 12:00. Is that a good time for you?',
        'ดีค่ะ งั้นฉันกับแคที่จะไปตอนเที่ยง สะดวกไหม',
      ],
      [
        'Mary',
        "Oh, I'm sorry. Um, I have a hair appointment at 12:00. How about I meet you at the supermarket at 1:00?",
        'โอ้ ขอโทษด้วยนะ ฉันมีนัดทำผมตอนเที่ยง เจอกันที่ซูเปอร์มาร์เก็ตตอนบ่ายโมงได้ไหม',
      ],
      ['Sue', 'Sure.', 'ได้ค่ะ'],
      [
        'Sue',
        'So, Kathy and I will see you at the supermarket at 1:00.',
        'งั้นฉันกับแคที่จะเจอเธอที่ซูเปอร์มาร์เก็ตตอนบ่ายโมงนะ',
      ],
      [
        'Mary',
        "Okay, that sounds good, Sue. I'll see you then. Goodbye.",
        'โอเคค่ะ ซู แล้วเจอกันนะ บาย',
      ],
      ['Sue', 'Goodbye.', 'บายค่ะ'],
    ],
  },
  {
    key: 'lst3-directions',
    title: 'Kathy and Mary — Getting Directions',
    emoji: '🗺️',
    lines: [
      ['Kathy', 'Oh, hi Mary.', 'โอ้ หวัดดีค่ะ แมรี่'],
      ['Mary', 'Hi.', 'หวัดดีค่ะ'],
      [
        'Kathy',
        'Have you finished moving everything into your apartment?',
        'ขนของเข้าห้องเสร็จหมดแล้วเหรอคะ',
      ],
      [
        'Mary',
        "Yes, I've been busy cleaning all day trying to get all of my housework finished.",
        'ค่ะ ทำความสะอาดยุ่งทั้งวันเลย พยายามจะให้งานบ้านเสร็จให้หมด',
      ],
      [
        'Kathy',
        "I'm so glad to have a new neighbor who's so friendly.",
        'ดีใจจังที่ได้เพื่อนบ้านใหม่ที่เป็นมิตรแบบนี้',
      ],
      [
        'Mary',
        'Yes, I am so happy we moved here. I am so glad to have many friendly neighbors. I talked to Sue today on the telephone and she asked me to join you and go to the market together.',
        'ค่ะ ดีใจมากเลยที่ย้ายมาอยู่ที่นี่ ดีใจที่มีเพื่อนบ้านใจดีหลายคน วันนี้ฉันคุยโทรศัพท์กับซู เธอชวนให้ไปตลาดด้วยกันกับพวกคุณ',
      ],
      [
        'Kathy',
        "Oh, that's great. I'm glad you'll be joining us.",
        'โอ้ เยี่ยมเลยค่ะ ดีใจที่จะได้ไปด้วยกัน',
      ],
      [
        'Mary',
        'Yes, me too. I have no food in the apartment.',
        'ค่ะ ฉันก็ดีใจเหมือนกัน ในห้องฉันไม่มีอาหารเลย',
      ],
      ['Kathy', "So, I'll see you at 12?", 'งั้นเจอกันเที่ยงนะคะ'],
      [
        'Mary',
        "No, actually, I'll meet you at 1:00 there.",
        'ไม่ค่ะ จริงๆ แล้วฉันจะไปเจอตอนบ่ายโมงที่นั่นเลย',
      ],
      [
        'Mary',
        'Although, I forgot to get directions from Sue.',
        'แต่ว่าฉันลืมขอเส้นทางจากซูไปเลย',
      ],
      [
        'Kathy',
        "Oh, okay. It's very easy to get to the supermarket. I can tell you.",
        'อ๋อ ไม่เป็นไรค่ะ ไปซูเปอร์มาร์เก็ตง่ายมาก เดี๋ยวบอกทางให้เอง',
      ],
      ['Mary', 'Okay, just a moment.', 'ได้ค่ะ รอเดี๋ยวนะ'],
      [
        'Kathy',
        'First, you go straight on Main Street for about one mile.',
        'ก่อนอื่นตรงไปตามถนนเมนสตรีทประมาณหนึ่งไมล์ค่ะ',
      ],
      ['Mary', 'Uh-huh.', 'อือฮึ'],
      [
        'Kathy',
        'At the second traffic light, turn left onto Grayson Avenue. After you turn left, go straight about four blocks.',
        'ที่ไฟแดงที่สอง เลี้ยวซ้ายเข้าถนนเกรย์สันอเวนิว แล้วตรงไปอีกประมาณสี่ช่วงตึก',
      ],
      ['Mary', 'Four blocks.', 'สี่ช่วงตึกนะคะ'],
      [
        'Kathy',
        "The supermarket will be on your right-hand side. It's very large, so you'll see it easily.",
        'ซูเปอร์มาร์เก็ตจะอยู่ทางขวามือค่ะ ตัวร้านใหญ่มาก มองเห็นง่ายเลย',
      ],
      [
        'Mary',
        'Okay, let me repeat this to make sure I have the directions correctly.',
        'โอเค ขอทวนอีกทีนะคะ เผื่อจำผิด',
      ],
      ['Kathy', 'All right.', 'ได้ค่ะ'],
      [
        'Mary',
        'Go straight on Main Street for one mile. Turn left onto Grayson Avenue after the second traffic light. Go four blocks and the supermarket is on the right-hand side.',
        'ตรงไปตามถนนเมนสตรีทหนึ่งไมล์ เลี้ยวซ้ายเข้าเกรย์สันอเวนิวหลังไฟแดงที่สอง ตรงไปสี่ช่วงตึก แล้วซูเปอร์มาร์เก็ตจะอยู่ทางขวามือ',
      ],
      ['Kathy', "That's exactly right.", 'ถูกต้องเป๊ะเลยค่ะ'],
      ['Kathy', "So, I'll see you there.", 'งั้นเจอกันที่นั่นนะคะ'],
      [
        'Mary',
        "Okay. I'll see you there, Kathy.",
        'โอเคค่ะ แล้วเจอกันนะ แคที่',
      ],
      ['Kathy', 'Bye-bye, Mary.', 'บายค่ะ แมรี่'],
      ['Mary', 'Bye-bye.', 'บายค่ะ'],
      ['Kathy', 'That was a funny story, Mary.', 'เรื่องนั้นตลกดีนะ แมรี่'],
      ['Mary', 'Yeah, it sure was.', 'ใช่เลย ตลกจริงๆ'],
    ],
  },
  {
    key: 'lst3-groceries',
    title: 'Putting Away the Groceries',
    emoji: '🛒',
    lines: [
      [
        'Kathy',
        'Just put those over there, beside the sink.',
        'วางไว้ตรงนั้นเลยค่ะ ข้างอ่างล้างจาน',
      ],
      ['Mary', 'By the sink?', 'ข้างอ่างล้างจานเหรอ'],
      ['Kathy', 'Yes, over there.', 'ใช่ค่ะ ตรงนั้นแหละ'],
      [
        'Sue',
        'Mary, what should I do with the salt and pepper?',
        'แมรี่ เกลือกับพริกไทยนี่จะให้ทำยังไงดี',
      ],
      [
        'Mary',
        'You can put that beside the stove.',
        'วางไว้ข้างเตาแก๊สได้เลยค่ะ',
      ],
      ['Sue', 'And how about these vegetables?', 'แล้วผักพวกนี้ล่ะ'],
      [
        'Mary',
        'Those can go in the refrigerator.',
        'อันนั้นเก็บในตู้เย็นได้เลย',
      ],
      [
        'Kathy',
        'Do you want this fruit in the refrigerator also?',
        'ผลไม้พวกนี้จะเก็บในตู้เย็นด้วยไหมคะ',
      ],
      [
        'Mary',
        'No, that can go above the microwave.',
        'ไม่ค่ะ วางไว้บนไมโครเวฟได้เลย',
      ],
      ['Sue', 'And how about these cans of food?', 'แล้วอาหารกระป๋องพวกนี้ล่ะ'],
      [
        'Mary',
        'These can go above the sink.',
        'อันนี้วางไว้เหนืออ่างล้างจานได้เลย',
      ],
      [
        'Kathy',
        'Mary, what about this bottle of soap?',
        'แมรี่ ขวดน้ำยาล้างจานนี่ล่ะคะ',
      ],
      ['Mary', 'That can go under the sink.', 'วางไว้ใต้อ่างล้างจานได้เลยค่ะ'],
      [
        'Sue',
        "Wow, Mary, I think you've got enough stuff here for a whole month.",
        'ว้าว แมรี่ ฉันว่าของพวกนี้พอกินได้ทั้งเดือนเลยนะ',
      ],
      [
        'Mary',
        "Yes, I think so. I don't want to have to go to the supermarket again for a long time.",
        'ใช่ค่ะ ฉันก็คิดงั้น ไม่อยากไปซูเปอร์มาร์เก็ตอีกไปอีกนานเลย',
      ],
      [
        'Kathy',
        'Mary, how about the bread? Where should I put the bread?',
        'แมรี่ แล้วขนมปังล่ะ จะให้วางไว้ตรงไหน',
      ],
      [
        'Mary',
        'Uh, that can go above the microwave, behind the fruit.',
        'เอ่อ วางไว้บนไมโครเวฟข้างหลังผลไม้ได้เลยค่ะ',
      ],
      [
        'Kathy',
        "Okay, I think that's about everything.",
        'โอเค คิดว่าครบหมดแล้วนะคะ',
      ],
      [
        'Sue',
        'Good. You can throw the bags in the trash can.',
        'ดีค่ะ เอาถุงไปทิ้งถังขยะได้เลย',
      ],
      [
        'Mary',
        'Okay. Oh, thank you so much for asking me to join you to go to the supermarket today.',
        'โอเคค่ะ โอ้ ขอบคุณมากๆ เลยที่ชวนฉันไปซูเปอร์มาร์เก็ตด้วยกันวันนี้',
      ],
      [
        'Sue',
        "You're welcome. And I'm sure David and Tina will be very happy, too.",
        'ไม่เป็นไรเลยค่ะ แล้วฉันก็มั่นใจว่าเดวิดกับทีน่าต้องดีใจมากด้วยแน่ๆ',
      ],
    ],
  },
  {
    key: 'lst3-florida-invite',
    title: 'A Phone Call — Inviting Sue to Florida',
    emoji: '🏖️',
    lines: [
      [
        'Receptionist',
        'Hello, Jones Accounting Firm. How may I help you?',
        'สวัสดีค่ะ บริษัทบัญชีโจนส์ มีอะไรให้ช่วยไหมคะ',
      ],
      [
        'Kathy',
        'May I speak with Sue Williams, please?',
        'ขอสายคุณซู วิลเลียมส์หน่อยได้ไหมคะ',
      ],
      [
        'Sue',
        'This is Sue speaking. May I help you?',
        'ซูพูดค่ะ มีอะไรให้ช่วยไหมคะ',
      ],
      ['Kathy', 'Sue, this is Kathy.', 'ซู นี่แคที่นะ'],
      ['Sue', "Oh, Kathy. Hi. What's up?", 'โอ้ แคที่ หวัดดี มีอะไรเหรอ'],
      [
        'Kathy',
        'Well, I was wondering if you and your family would like to go on vacation with us.',
        'ก็อยากถามว่าครอบครัวเธออยากไปเที่ยวพักร้อนกับเราไหม',
      ],
      ['Sue', 'Oh, we would love to go!', 'โอ้ อยากไปมากเลย!'],
      [
        'Kathy',
        'And the White family is going, too.',
        'แล้วครอบครัวไวท์ก็จะไปด้วยนะ',
      ],
      ['Sue', 'Great! Where are you going?', 'เยี่ยมเลย จะไปไหนกันเหรอ'],
      ['Kathy', "We're going to Florida.", 'จะไปฟลอริดาค่ะ'],
      [
        'Sue',
        "Oh, that's very far away. Will you fly on a plane?",
        'โอ้ ไกลมากเลยนะ จะนั่งเครื่องบินไปเหรอ',
      ],
      ['Kathy', 'Yes.', 'ใช่ค่ะ'],
      [
        'Sue',
        "Oh, I'm sorry. I'm afraid we cannot go. It would be too expensive for us.",
        'โอ้ ขอโทษนะ เกรงว่าเราคงไปไม่ได้ ค่าใช้จ่ายคงแพงเกินไปสำหรับเรา',
      ],
      [
        'Kathy',
        "But we have a very special price for the plane tickets. It's really not very expensive.",
        'แต่เรามีราคาพิเศษสำหรับตั๋วเครื่องบินนะ ไม่แพงเลยจริงๆ',
      ],
      ['Sue', 'Well, when are you going?', 'แล้วจะไปตอนไหนล่ะ'],
      ['Kathy', 'The last week of June.', 'สัปดาห์สุดท้ายของเดือนมิถุนายนค่ะ'],
      [
        'Sue',
        "Oh, Kathy, I'm sorry. We're not free the last week of June.",
        'โอ้ แคที่ ขอโทษนะ สัปดาห์สุดท้ายของมิถุนายนเราไม่ว่างเลย',
      ],
      ['Kathy', 'Oh, why?', 'ทำไมล่ะ'],
      [
        'Sue',
        "Uh, Joe and I both have to work. We don't have enough vacation time.",
        'เอ่อ ฉันกับโจต้องทำงานทั้งคู่ วันลาไม่พอ',
      ],
      [
        'Kathy',
        'Can you ask your boss for more vacation time?',
        'ขอวันลาเพิ่มจากเจ้านายไม่ได้เหรอ',
      ],
      [
        'Sue',
        'No. It is very difficult for us to ask for vacation time.',
        'ไม่ได้หรอก การขอวันลาเพิ่มมันยากมากสำหรับเรา',
      ],
      [
        'Sue',
        "Um, I'm sorry, but we really cannot go.",
        'เอ่อ ขอโทษนะ แต่เราไปไม่ได้จริงๆ',
      ],
      ['Kathy', 'Are you sure you cannot go?', 'แน่ใจเหรอว่าไปไม่ได้'],
      [
        'Sue',
        "I'm sure it would be impossible for us to go.",
        'แน่ใจค่ะ มันเป็นไปไม่ได้เลยที่เราจะไป',
      ],
      [
        'Kathy',
        'I really wish you could go, Sue.',
        'อยากให้เธอไปด้วยจริงๆ นะ ซู',
      ],
      [
        'Sue',
        "Yes, so do I, but it's really not convenient for us to go. I'm sorry.",
        'ใช่ ฉันก็อยากไปเหมือนกัน แต่มันไม่สะดวกสำหรับเราจริงๆ ขอโทษนะ',
      ],
      [
        'Kathy',
        "Never mind, Sue. That's okay.",
        'ไม่เป็นไรหรอกซู ไม่ต้องคิดมาก',
      ],
      [
        'Sue',
        'But I hope you all have a good time in Florida.',
        'แต่หวังว่าทุกคนจะสนุกที่ฟลอริดานะ',
      ],
      ['Kathy', "Thanks. I'm sure we will.", 'ขอบคุณนะ เราคงสนุกแน่นอน'],
      ['Sue', 'Oh, and Kathy—', 'อ้อ แล้วก็ แคที่...'],
      ['Kathy', 'Yes, Sue?', 'ว่าไงซู'],
      [
        'Sue',
        "Thank you for inviting us to go along. I'm really sorry we can't go.",
        'ขอบคุณที่ชวนไปด้วยกันนะ เสียใจจริงๆ ที่ไปไม่ได้',
      ],
      [
        'Kathy',
        'No problem. Maybe next year you can go with us.',
        'ไม่เป็นไรเลยค่ะ ปีหน้าอาจจะได้ไปด้วยกันก็ได้',
      ],
      ['Sue', 'Okay, sure. Goodbye.', 'โอเคค่ะ แล้วเจอกัน บาย'],
      ['Kathy', 'Bye-bye.', 'บายค่ะ'],
    ],
  },
  {
    key: 'lst3-planning-trip',
    title: 'Planning the Florida Trip',
    emoji: '🗓️',
    lines: [
      [
        'Bill',
        'Okay. Does everyone know what they want to do on our trip to Florida?',
        'โอเค ทุกคนรู้แล้วใช่ไหมว่าอยากทำอะไรบ้างตอนไปเที่ยวฟลอริดา',
      ],
      [
        'Mary',
        'Well, Kathy and I want to go shopping every day.',
        'ก็ฉันกับแคที่อยากไปช้อปปิ้งทุกวันเลย',
      ],
      [
        'Bill',
        'And David and I want to go boating and fishing every day.',
        'แล้วผมกับเดวิดอยากไปพายเรือกับตกปลาทุกวัน',
      ],
      [
        'Jack',
        'And Tina and I want to go to the beach every day.',
        'แล้วผมกับทีน่าอยากไปชายหาดทุกวัน',
      ],
      ['Tina', 'In the zoo!', 'แล้วก็สวนสัตว์ด้วย!'],
      ['Jack', 'In the museum!', 'พิพิธภัณฑ์ด้วย!'],
      ['Tina', 'In the mall!', 'ห้างด้วย!'],
      [
        'David',
        'Wait, wait. I think we have too much to do in one week.',
        'เดี๋ยวๆ ผมว่าเรามีอะไรจะทำเยอะเกินไปสำหรับสัปดาห์เดียวนะ',
      ],
      [
        'Mary',
        'David is right. We should make a schedule of everything that we would like to do each day.',
        'เดวิดพูดถูก เราน่าจะทำตารางว่าแต่ละวันอยากทำอะไรบ้าง',
      ],
      [
        'Kathy',
        "Okay. I have a pen and paper. I'll write down everything we plan to do.",
        'โอเค ฉันมีปากกากับกระดาษ เดี๋ยวจดทุกอย่างที่เราวางแผนไว้เลย',
      ],
      ['Bill', 'Okay.', 'โอเค'],
      [
        'David',
        "Okay. On Sunday, we'll go to the airport and fly to Florida. We'll arrive at the hotel in the evening.",
        'โอเค วันอาทิตย์เราจะไปสนามบินแล้วบินไปฟลอริดา จะถึงโรงแรมตอนเย็น',
      ],
      [
        'Kathy',
        'Okay, Sunday: airport, hotel.',
        'โอเค วันอาทิตย์ สนามบิน โรงแรม',
      ],
      [
        'Mary',
        'And on Monday, can we all go to the beach together?',
        'แล้ววันจันทร์ ไปชายหาดด้วยกันทั้งหมดได้ไหม',
      ],
      [
        'Bill',
        'Yes, sounds good. Monday: beach.',
        'ได้ ฟังดูดี วันจันทร์ ชายหาด',
      ],
      [
        'David',
        "Tuesday, everyone can go shopping together and we'll buy gifts and souvenirs.",
        'วันอังคาร ทุกคนไปช้อปปิ้งด้วยกัน แล้วซื้อของฝากกับของที่ระลึก',
      ],
      [
        'Bill',
        'On Wednesday, the men can go boating and fishing. The women can go shopping again and the kids can go to the beach again.',
        'วันพุธ ผู้ชายไปพายเรือกับตกปลา ผู้หญิงไปช้อปปิ้งอีกรอบ เด็กๆ ไปชายหาดอีกรอบ',
      ],
      [
        'Kathy',
        "Slow down, slow down! I can't write that fast.",
        'ช้าลงหน่อยสิ ช้าลงหน่อย จดไม่ทันแล้ว',
      ],
      [
        'David',
        'And Thursday, we can go to the zoo.',
        'แล้ววันพฤหัส ไปสวนสัตว์กัน',
      ],
      ['Bill', 'Yeah, good, good.', 'ใช่ ดี ดี'],
      ['Kathy', 'Thursday: zoo.', 'วันพฤหัส สวนสัตว์'],
      [
        'Mary',
        'Friday, the women and children could go to the amusement park, and the men could go boating and fishing again.',
        'วันศุกร์ ผู้หญิงกับเด็กๆ ไปสวนสนุก ผู้ชายไปพายเรือตกปลาอีกรอบ',
      ],
      [
        'David',
        'I think Saturday should be a day for everyone to do what they want to do. Just a free day.',
        'ผมว่าวันเสาร์น่าจะเป็นวันอิสระ ให้ทุกคนทำอะไรก็ได้ตามใจชอบ',
      ],
      [
        'Bill',
        'And of course, on Sunday, we go to the airport and we fly home.',
        'แล้วก็แน่นอน วันอาทิตย์ เราไปสนามบินแล้วบินกลับบ้าน',
      ],
      [
        'David',
        'Well, I think we have a good plan for our trip to Florida.',
        'เอาล่ะ ผมว่าเรามีแผนเที่ยวฟลอริดาที่ดีแล้วนะ',
      ],
      [
        'Kathy',
        "Yes, I've written down our plans for Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, and the last Sunday.",
        'ใช่ค่ะ ฉันจดแผนไว้หมดแล้ว วันอาทิตย์ จันทร์ อังคาร พุธ พฤหัส ศุกร์ เสาร์ แล้วก็วันอาทิตย์สุดท้าย',
      ],
      ['Tina', "I'm so excited!", 'ตื่นเต้นมากเลย!'],
    ],
  },
  {
    key: 'lst3-borrow-suitcase',
    title: 'Borrowing a Suitcase — and a Surprise',
    emoji: '🧳',
    lines: [
      [
        'Sue',
        'Oh, hi Mary and Kathy. Come on in.',
        'โอ้ หวัดดีค่ะ แมรี่ แคที่ เข้ามาสิ',
      ],
      [
        'Mary',
        "We're sorry to bother you, Sue. We were packing for our trip to Florida, and we were hoping that we could borrow some things from you.",
        'ขอโทษที่มารบกวนนะซู เรากำลังเก็บกระเป๋าเตรียมไปฟลอริดา แล้วก็หวังว่าจะขอยืมของบางอย่างจากเธอได้',
      ],
      [
        'Kathy',
        "Yes, I have so many things to pack that I don't have enough suitcases.",
        'ใช่ค่ะ ฉันมีของจะเก็บเยอะมากจนกระเป๋าเดินทางไม่พอ',
      ],
      [
        'Sue',
        "You don't? No problem. We have many extra suitcases. You can borrow one.",
        'ไม่พอเหรอ ไม่มีปัญหาเลย เรามีกระเป๋าเดินทางเหลือเยอะ ยืมไปได้เลย',
      ],
      [
        'Kathy',
        "I can? Oh, thanks, Sue. That's very nice of you.",
        'ยืมได้เหรอ โอ้ ขอบคุณนะซู ใจดีมากเลย',
      ],
      [
        'Mary',
        'Also, do you have an extra tennis racket? David and I were hoping to play some tennis while we are in Florida, but we only have one racket.',
        'แล้วมีไม้เทนนิสเหลือไหมคะ ฉันกับเดวิดอยากเล่นเทนนิสตอนอยู่ฟลอริดา แต่มีไม้อยู่แค่อันเดียว',
      ],
      [
        'Sue',
        "No problem. You can borrow Joe's racket.",
        'ไม่มีปัญหาค่ะ ยืมไม้ของโจไปได้เลย',
      ],
      ['Joe', 'She can?', 'ยืมได้เหรอ'],
      ['Sue', 'Yes, she can.', 'ได้สิ'],
      [
        'Joe',
        'Oh, yeah. Sure, sure. Yes, you can.',
        'อ๋อ ใช่ ได้ๆ ยืมได้เลยครับ',
      ],
      [
        'Mary',
        "Oh, Sue, I'm so disappointed that you're not going to join us in Florida. I hope you're not too bored being at home this week.",
        'โอ้ ซู ฉันเสียใจมากเลยที่เธอไม่ได้ไปฟลอริดาด้วยกัน หวังว่าอยู่บ้านสัปดาห์นี้จะไม่เบื่อเกินไปนะ',
      ],
      ['Sue', "Oh, we're not staying at home.", 'โอ้ เราไม่ได้อยู่บ้านหรอกนะ'],
      ['Kathy', "You're not?", 'ไม่อยู่บ้านเหรอ'],
      [
        'Sue',
        "No, we're not. I talked with my mother on the phone this morning.",
        'ไม่อยู่ค่ะ เมื่อเช้าฉันคุยโทรศัพท์กับแม่',
      ],
      ['Kathy', 'You did?', 'คุยเหรอ'],
      [
        'Sue',
        'Yes, I did. She wants us to come and visit her for a few days.',
        'ใช่ค่ะ แม่อยากให้เราไปเยี่ยมสักสองสามวัน',
      ],
      ['Mary', 'She does?', 'แม่อยากให้ไปเหรอ'],
      [
        'Sue',
        "Yes, she does. As a matter of fact, we're going tomorrow morning.",
        'ใช่ค่ะ อยากให้ไปจริงๆ ที่จริงเราจะไปพรุ่งนี้เช้าเลย',
      ],
      [
        'Sue',
        'So, you need to start packing your suitcase right now, dear.',
        'ที่รัก คุณต้องเริ่มเก็บกระเป๋าเดี๋ยวนี้เลยนะ',
      ],
      ['Joe', 'I should?', 'ต้องเก็บเลยเหรอ'],
      [
        'Sue',
        'Yes, you should. Do you have a problem with going to visit my mother?',
        'ใช่ ต้องเก็บเลย คุณมีปัญหาอะไรกับการไปเยี่ยมแม่ฉันเหรอ',
      ],
      [
        'Joe',
        'Oh, no, not at all. I would love to visit your mother.',
        'โอ้ เปล่าเลย ไม่มีปัญหาอะไรเลย ผมอยากไปเยี่ยมแม่คุณอยู่แล้ว',
      ],
      ['Sue', 'You would?', 'อยากไปจริงเหรอ'],
      ['Joe', 'Well, I guess it will be all right.', 'ก็...คงจะโอเคแหละ'],
      [
        'Mary',
        "Oh, Sue, I'm so happy that you don't have to stay home all week. Going to visit your mother is a wonderful idea.",
        'โอ้ ซู ดีใจจังที่เธอไม่ต้องอยู่บ้านทั้งสัปดาห์ ไปเยี่ยมแม่เป็นไอเดียที่ดีมากเลย',
      ],
      ['Sue', 'It is.', 'ใช่ค่ะ'],
    ],
  },
  {
    key: 'lst3-joe-upset',
    title: "Joe Is Upset — Packing for Mother's House",
    emoji: '😤',
    lines: [
      ['Sue', 'Joe, why do you look so upset?', 'โจ ทำไมดูหงุดหงิดจังเลย'],
      [
        'Joe',
        "I wanted to go to Florida with our friends. I'm frustrated.",
        'ผมอยากไปฟลอริดากับเพื่อนๆ นี่นา หงุดหงิดจริงๆ',
      ],
      [
        'Sue',
        "Don't be upset. We're going to visit my mother.",
        'ไม่ต้องหงุดหงิดหรอก เราจะไปเยี่ยมแม่ฉันนี่',
      ],
      [
        'Joe',
        "I know we're going to visit your mother. That's why I'm upset.",
        'ก็รู้ว่าจะไปเยี่ยมแม่คุณ นั่นแหละที่ทำให้หงุดหงิด',
      ],
      [
        'Sue',
        "And why don't you want to go visit my mother?",
        'แล้วทำไมไม่อยากไปเยี่ยมแม่ฉันล่ะ',
      ],
      ['Joe', 'Uh, uh, uh, b-b-because—', 'เอ่อ เอ่อ เพราะว่า...'],
      ['Sue', 'Yes?', 'ว่าไง'],
      ['Sue', 'Because why?', 'เพราะอะไรล่ะ'],
      [
        'Joe',
        "Because I don't know what to pack in my suitcase.",
        'เพราะผมไม่รู้จะเก็บอะไรลงกระเป๋าดี',
      ],
      [
        'Sue',
        'Joe, you have so many clothes, so many nice things.',
        'โจ คุณก็มีเสื้อผ้าตั้งเยอะ ของดีๆ ตั้งเยอะแยะ',
      ],
      [
        'Joe',
        "I know. That's the problem. I don't know what to take.",
        'รู้ครับ นั่นแหละปัญหา ไม่รู้จะเอาอะไรไปดี',
      ],
      [
        'Sue',
        "Oh, Joe, here — I'll help you decide what to take. How about these blue pants? You can take them when we go shopping with my mother.",
        'โอ้ โจ นี่ไง เดี๋ยวช่วยเลือกให้ กางเกงสีน้ำเงินตัวนี้เป็นไงบ้าง ใส่ตอนไปช้อปปิ้งกับแม่ฉันได้นะ',
      ],
      ['Joe', 'Okay.', 'โอเค'],
      [
        'Sue',
        'And, well, I guess this red shirt would look nice with the blue pants.',
        'แล้วก็...เสื้อเชิ้ตสีแดงตัวนี้น่าจะเข้ากับกางเกงสีน้ำเงินดีนะ',
      ],
      ['Joe', 'Yeah.', 'ครับ'],
      ['Sue', "Yeah, that's good.", 'ใช่ สวยดี'],
      [
        'Sue',
        'Okay. And I think you need to take a jacket or a sweater because the evenings will be cool.',
        'โอเค แล้วก็คิดว่าต้องเอาแจ็คเก็ตหรือเสื้อกันหนาวไปด้วยนะ เพราะตอนเย็นอากาศจะเย็น',
      ],
      [
        'Joe',
        'Well, should I take the large tan jacket, or should I take the small green sweater?',
        'เอ่อ ผมควรเอาแจ็คเก็ตสีน้ำตาลตัวใหญ่ หรือเสื้อกันหนาวสีเขียวตัวเล็กไปดีล่ะ',
      ],
      ['Sue', 'Um, I think this will be enough.', 'อืม ฉันว่าอันนี้พอแล้วนะ'],
      [
        'Joe',
        'You think so? Okay, the small green sweater.',
        'คิดงั้นเหรอ โอเค เอาเสื้อกันหนาวสีเขียวตัวเล็กแล้วกัน',
      ],
      [
        'Sue',
        'Okay. Oh, what about what about my swimming suit?',
        'โอเค แล้ว...ชุดว่ายน้ำของฉันล่ะ',
      ],
      [
        'Joe',
        "Let's see. Should you take the black bikini, or how about your yellow bathing suit?",
        'ดูซิ จะเอาบิกินี่สีดำ หรือชุดว่ายน้ำสีเหลืองไปดี',
      ],
      [
        'Joe',
        'I think the black bikini is better.',
        'ผมว่าบิกินี่สีดำดีกว่านะ',
      ],
      [
        'Sue',
        'Oh, I like the yellow bathing suit. I think you should take this one. I really do.',
        'โอ้ ฉันชอบชุดว่ายน้ำสีเหลืองมากกว่า คิดว่าควรเอาตัวนี้ไปจริงๆ นะ',
      ],
      ['Joe', 'All right, okay.', 'ก็ได้ โอเค'],
      [
        'Sue',
        'Well, what shoes are you going to take?',
        'แล้วรองเท้าจะเอาคู่ไหนไปล่ะ',
      ],
      [
        'Joe',
        "Shoes? I don't know. Um, should I take the brown shoes or the white shoes?",
        'รองเท้าเหรอ ไม่รู้สิ เอ่อ เอาคู่สีน้ำตาลหรือคู่สีขาวดี',
      ],
      [
        'Sue',
        'Um, I think the white ones are better.',
        'อืม ฉันว่าคู่สีขาวดีกว่านะ',
      ],
      [
        'Joe',
        'Okay. I think I can finish packing myself now. Thank you, Sue.',
        'โอเค ทีนี้ผมน่าจะเก็บกระเป๋าเองต่อได้แล้ว ขอบคุณนะซู',
      ],
      [
        'Sue',
        "Anytime. Especially when we're going to visit my mother. Oh yeah.",
        'ยินดีเสมอ โดยเฉพาะตอนจะไปเยี่ยมแม่ฉันด้วย โอ้ ใช่เลย',
      ],
    ],
  },
  {
    key: 'lst3-stomach-ache',
    title: "Joe's Stomach Ache",
    emoji: '🤒',
    lines: [
      ['Joe', 'Oh. Oh. Oh.', 'โอ๊ย โอ๊ย โอ๊ย'],
      ['Sue', "Oh, Joe? What's the matter?", 'โอ้ โจ เป็นอะไรไปเหรอ'],
      ['Joe', 'Oh...', 'โอ๊ย...'],
      [
        'Sue',
        "Are you all right? What's the matter?",
        'ไม่เป็นไรใช่ไหม เป็นอะไรไปเหรอ',
      ],
      ['Joe', 'Oh, I have a stomach ache.', 'โอ๊ย ผมปวดท้องมากเลย'],
      [
        'Sue',
        'Oh, well, why do you have a stomach ache?',
        'โอ้ ทำไมถึงปวดท้องล่ะ',
      ],
      [
        'Joe',
        "Uh, I don't know. I just know that my stomach hurts.",
        'เอ่อ ไม่รู้เหมือนกัน รู้แค่ว่าท้องมันเจ็บ',
      ],
      [
        'Sue',
        'I think I should take you to the doctor.',
        'ฉันว่าต้องพาไปหาหมอแล้วล่ะ',
      ],
      ['Joe', 'Oh...', 'โอ๊ย...'],
      ['Receptionist', 'Joe Williams?', 'คุณโจ วิลเลียมส์คะ'],
      ['Sue', "That's us.", 'เราค่ะ'],
      ['Doctor', 'Please sit down.', 'เชิญนั่งค่ะ'],
      ['Sue', 'Oh, thank you. Hold this.', 'โอ้ ขอบคุณค่ะ ถือนี่ไว้นะ'],
      [
        'Doctor',
        'How do you feel today, Joe?',
        'วันนี้รู้สึกยังไงบ้างคะ คุณโจ',
      ],
      [
        'Joe',
        'Oh, I have a very, very bad stomach ache.',
        'โอ๊ย ผมปวดท้องมากๆ เลยครับ',
      ],
      [
        'Doctor',
        'Okay. You have a stomach ache. Do you have a fever?',
        'เข้าใจแล้วค่ะ ปวดท้อง มีไข้ด้วยไหมคะ',
      ],
      [
        'Joe',
        "A fever? I... I don't know. Am I hot? Am I hot? Am I hot?",
        'มีไข้เหรอ ไม่รู้สิครับ ตัวร้อนไหม ตัวร้อนไหม ตัวร้อนไหม',
      ],
      [
        'Doctor',
        "No, you're not hot. You don't have a fever.",
        'ไม่ค่ะ ตัวไม่ร้อน ไม่มีไข้',
      ],
      ['Joe', 'No?', 'ไม่มีเหรอ'],
      ['Doctor', 'Do you have a headache?', 'ปวดหัวไหมคะ'],
      ['Joe', 'No, just — just my stomach.', 'ไม่ครับ แค่...แค่ท้องเจ็บ'],
      [
        'Doctor',
        'Okay. Uh, have you been feeling tired?',
        'โอเคค่ะ รู้สึกเหนื่อยล้าไหมคะ',
      ],
      ['Joe', 'Tired? Not very much.', 'เหนื่อยเหรอ ไม่ค่อยเท่าไหร่ครับ'],
      [
        'Doctor',
        'Have you been coughing or sneezing?',
        'มีอาการไอหรือจามไหมคะ',
      ],
      [
        'Joe',
        'Coughing or sneezing? No, I have not been coughing or sneezing.',
        'ไอหรือจามเหรอ ไม่มีเลยครับ',
      ],
      [
        'Sue',
        "Doctor, do you know what's wrong with Joe?",
        'คุณหมอคะ รู้ไหมว่าโจเป็นอะไร',
      ],
      [
        'Doctor',
        'Well, he has a very bad stomach ache, but he does not have a headache. He does not have a fever.',
        'ก็เขาปวดท้องมาก แต่ไม่ปวดหัว ไม่มีไข้ด้วย',
      ],
      [
        'Doctor',
        "He has not been feeling tired, and he hasn't been coughing or sneezing. Have you been eating these?",
        'ไม่รู้สึกเหนื่อยล้า ไม่ไอไม่จาม แล้วคุณกินพวกนี้เข้าไปหรือเปล่าคะ',
      ],
      ['Joe', 'Eating? Oh, um, yes.', 'กินเหรอครับ อ่อ...ใช่ครับ'],
      ['Doctor', 'How many of these have you eaten?', 'กินไปกี่ชิ้นแล้วคะ'],
      ['Joe', "I... I don't know.", 'ไม่...ไม่รู้เหมือนกันครับ'],
      ['Sue', '20?', '20 ชิ้นเหรอ'],
      ['Joe', '20.', '20 ครับ'],
      [
        'Doctor',
        "20! Well, they're very delicious, they're very good — now I know why you have a stomach ache. Here, take three of these every hour for the next two days. You will be feeling better by tomorrow.",
        '20 ชิ้นเลยเหรอคะ! มันอร่อยก็จริงนะคะ แต่ตอนนี้รู้แล้วว่าทำไมถึงปวดท้อง นี่ค่ะ กินยานี้สามเม็ดทุกชั่วโมงต่อไปอีกสองวัน พรุ่งนี้จะรู้สึกดีขึ้นค่ะ',
      ],
    ],
  },
  {
    key: 'lst3-making-up',
    title: 'Making Up',
    emoji: '🍫',
    lines: [
      ['Joe', "I'm sorry. So really, I'm very sorry.", 'ขอโทษนะ ผมขอโทษจริงๆ'],
      ['Sue', "I don't believe you.", 'ไม่เชื่อหรอก'],
      [
        'Joe',
        'Oh, Sue, please, please forgive me.',
        'โอ้ ซู ได้โปรดยกโทษให้ผมเถอะ',
      ],
      [
        'Sue',
        "I couldn't go to my mother's today.",
        'วันนี้ฉันไปหาแม่ไม่ได้เลย',
      ],
      ['Joe', 'What?', 'อะไรนะ'],
      ['Sue', 'You had to go to the doctor.', 'เพราะคุณต้องไปหาหมอ'],
      [
        'Joe',
        "I can't hear you. Please speak louder.",
        'ผมไม่ได้ยิน พูดดังกว่านี้หน่อย',
      ],
      [
        'Sue',
        "I said, we couldn't go to my mother's today because you had to go to the doctor.",
        'ฉันบอกว่าวันนี้เราไปหาแม่ไม่ได้ เพราะคุณต้องไปหาหมอไง',
      ],
      ['Joe', 'I was sick.', 'ผมป่วยนี่นา'],
      [
        'Sue',
        'You ate too many chocolate bars.',
        'ก็คุณกินช็อกโกแลตเยอะเกินไปเอง',
      ],
      ['Joe', "I'm really sorry.", 'ผมขอโทษจริงๆ'],
      ['Sue', "I don't forgive you.", 'ไม่ยกโทษให้หรอก'],
      [
        'Joe',
        "So please, really, I'm sorry. Please forgive me.",
        'ได้โปรดเถอะ ผมขอโทษจริงๆ ยกโทษให้ผมเถอะนะ',
      ],
      [
        'Sue',
        "No, you shouldn't have eaten so many chocolate bars.",
        'ไม่ยกโทษให้ คุณไม่น่ากินช็อกโกแลตเยอะขนาดนั้นเลย',
      ],
      [
        'Joe',
        'Hey, wait a minute — you gave me those chocolate bars!',
        'เฮ้ เดี๋ยวก่อนนะ คุณเป็นคนให้ช็อกโกแลตพวกนั้นกับผมเองนี่',
      ],
      [
        'Sue',
        'I... oh, I guess I did give you those chocolate bars.',
        'ฉัน...อ๋อ ก็ใช่ ฉันเป็นคนให้ช็อกโกแลตพวกนั้นจริงด้วย',
      ],
      ['Joe', 'Yeah.', 'ใช่ไง'],
      [
        'Sue',
        "Oh, Joe, I'm sorry. I shouldn't have gotten mad at you for eating the chocolate bars I gave you. Will you forgive me?",
        'โอ้ โจ ขอโทษนะ ฉันไม่น่าโมโหคุณที่กินช็อกโกแลตที่ฉันให้ไปเลย ยกโทษให้ฉันได้ไหม',
      ],
      [
        'Joe',
        "Okay, I'll forgive you if you forgive me.",
        'โอเค ผมจะยกโทษให้คุณ ถ้าคุณยกโทษให้ผมด้วย',
      ],
      [
        'Sue',
        "Okay, we'll forgive each other.",
        'โอเค งั้นเรายกโทษให้กันและกันนะ',
      ],
      [
        'Joe',
        'Okay. So, what do you want to do now?',
        'โอเค แล้วตอนนี้อยากทำอะไรต่อ',
      ],
      [
        'Sue',
        'Well, I am quite hungry, actually. How about we eat some chocolate bars?',
        'ก็...จริงๆ แล้วหิวอยู่เหมือนกันนะ กินช็อกโกแลตกันดีไหม',
      ],
      [
        'Joe',
        'Oh, Sue, no more chocolate!',
        'โอ้ ซู ไม่เอาช็อกโกแลตอีกแล้วนะ!',
      ],
      ['Sue', "I'm just kidding.", 'ล้อเล่นน่า'],
    ],
  },
  {
    key: 'lst3-morning-rush',
    title: 'Morning Rush — Off to Florida',
    emoji: '⏰',
    lines: [
      [
        'David',
        "Mary. Mary, wake up. It's ten till ten. We're late.",
        'แมรี่ แมรี่ ตื่นเร็ว อีกสิบนาทีจะสิบโมงแล้ว เราสายแล้ว',
      ],
      ['Mary', "That's nice, dear.", 'ดีจังเลยที่รัก'],
      [
        'David',
        "What? It's 9:50! Oh, we are late, and we have to leave the house to go to the airport at fifteen after ten!",
        'อะไรนะ 9 โมง 50 แล้ว! โอ้ เราสายแล้ว แล้วเราต้องออกจากบ้านไปสนามบินตอน 10 โมง 15!',
      ],
      [
        'Mary',
        'Oh, that means we only have 25 minutes to get ready!',
        'โอ้ นั่นแปลว่าเรามีเวลาแค่ 25 นาทีในการเตรียมตัว!',
      ],
      ['Tina', 'Mom, Dad, what time is it?', 'แม่คะ พ่อคะ กี่โมงแล้ว'],
      ['David', "It's 9:52.", '9 โมง 52 แล้ว'],
      [
        'Tina',
        "That means we only have 23 minutes to get to the airport. Let's go!",
        'นั่นแปลว่าเรามีเวลาแค่ 23 นาทีจะไปถึงสนามบิน ไปกันเถอะ!',
      ],
      ['David', 'Oh yes — come in!', 'อ้อ ใช่ เข้ามาเลย!'],
      [
        'Mary',
        "You know what time it is? It's 10:03! We have to go to the airport at 10:15!",
        'รู้ไหมกี่โมงแล้ว 10 โมง 3 นาทีแล้ว! เราต้องไปสนามบินตอน 10 โมง 15!',
      ],
      [
        'Mary',
        'Can you please take our bags to the car?',
        'ช่วยยกกระเป๋าไปใส่รถให้หน่อยได้ไหม',
      ],
      ['Tina', 'Sure, sure.', 'ได้ค่ะ ได้'],
      [
        'Mary',
        'Okay, Dad, what time do we have to be at the airport?',
        'โอเค พ่อ เราต้องไปถึงสนามบินกี่โมง',
      ],
      ['David', 'Uh, at 11:00.', 'เอ่อ 11 โมงครับ'],
      ['Mary', '11:30.', '11 โมงครึ่งต่างหาก'],
      ['David', 'Okay.', 'โอเค'],
    ],
  },
  {
    key: 'lst3-last-checks',
    title: 'Last Checks Before Leaving',
    emoji: '✅',
    lines: [
      ['Mary', "You think we'll make it?", 'คิดว่าเราจะไปทันไหม'],
      ['David', 'I sure hope so.', 'หวังว่างั้นนะ'],
      [
        'Mary',
        'Tina, did you pack all of your suitcases?',
        'ทีน่า เก็บกระเป๋าครบหมดแล้วใช่ไหม',
      ],
      ['Tina', "Yeah, they're all packed.", 'ค่ะ เก็บครบหมดแล้ว'],
      [
        'Mary',
        'Okay. Are you sure you got everything?',
        'โอเค แน่ใจนะว่าได้ทุกอย่างแล้ว',
      ],
      ['Tina', 'Yes.', 'ค่ะ'],
      [
        'Mary',
        'Okay — you got your toothbrush, your toothpaste, your hair dryer, your makeup?',
        'โอเค แปรงสีฟัน ยาสีฟัน ไดร์เป่าผม เครื่องสำอาง เอาหมดแล้วใช่ไหม',
      ],
      ['Tina', 'Yes. Yes. And yes.', 'ค่ะ ค่ะ แล้วก็ค่ะ'],
      [
        'Mary',
        'Okay. And David, did you get everything?',
        'โอเค แล้วเดวิด เก็บของครบหมดหรือยัง',
      ],
      [
        'David',
        'Yes, I have my shoes, my clothes, uh, a book to read on the plane, and all of our money.',
        'ครับ ผมมีรองเท้า เสื้อผ้า เอ่อ หนังสือไว้อ่านบนเครื่องบิน แล้วก็เงินของเราทั้งหมดแล้ว',
      ],
      [
        'Mary',
        "Okay, okay. So, everyone's got everything, right?",
        'โอเค โอเค งั้นทุกคนได้ของครบหมดแล้วใช่ไหม',
      ],
      [
        'Tina',
        "Yes, we're sure we have everything.",
        'ใช่ เรามั่นใจว่าครบหมดแล้ว',
      ],
      [
        'Mary',
        "Okay, I think this is everything. Let's go.",
        'โอเค ฉันว่าครบแล้ว ไปกันเถอะ',
      ],
      ['David', 'All right.', 'ได้เลย'],
    ],
  },
  {
    key: 'lst3-airport-confusion',
    title: 'Airport Check-In Confusion',
    emoji: '✈️',
    lines: [
      [
        'Announcement',
        'Attention, please. Flight 747 is now boarding at gate 39.',
        'โปรดทราบ เที่ยวบิน 747 กำลังเริ่มขึ้นเครื่องที่ประตู 39',
      ],
      ['Mary', 'Excuse me.', 'ขอโทษนะคะ'],
      ['Agent', "Yes, ma'am. Can I help you?", 'คะ มีอะไรให้ช่วยไหมคะ'],
      [
        'Mary',
        'Yes, we are late for a flight to Florida.',
        'ค่ะ เราไปสายสำหรับเที่ยวบินไปฟลอริดาน่ะค่ะ',
      ],
      [
        'Agent',
        'Okay. And what is your flight number?',
        'ได้ค่ะ ขอเบอร์เที่ยวบินหน่อยค่ะ',
      ],
      ['Mary', 'Our flight number is 1250.', 'เที่ยวบินของเราคือ 1250 ค่ะ'],
      [
        'Agent',
        'Your flight is at 12:50?',
        'เที่ยวบินของคุณคือ 12:50 น. ใช่ไหมคะ',
      ],
      [
        'Mary',
        'No, no. Our flight is at 11:30. Our flight number is 1250.',
        'ไม่ใช่ค่ะ เที่ยวบินของเราคือ 11:30 น. เบอร์เที่ยวบินคือ 1250',
      ],
      [
        'Agent',
        'Okay. Uh, how many tickets do you need for your flight?',
        'ได้ค่ะ ต้องใช้ตั๋วกี่ใบคะ',
      ],
      [
        'Mary',
        'We have six tickets for our flight to Florida at 11:30, flight 1250.',
        'เรามีตั๋วหกใบสำหรับเที่ยวบินไปฟลอริดา 11:30 น. เที่ยวบิน 1250 ค่ะ',
      ],
      ['Agent', 'Okay.', 'ค่ะ'],
      [
        'Agent',
        'You have 12 tickets for flight 11:30 that leaves at half past 6?',
        'คุณมีตั๋ว 12 ใบสำหรับเที่ยวบิน 11:30 ที่ออกตอน 6 โมงครึ่งใช่ไหมคะ',
      ],
      [
        'Mary',
        'No, no. We have six tickets at 11:30 for flight number 1250.',
        'ไม่ใช่ค่ะ เรามีตั๋วหกใบตอน 11:30 น. เที่ยวบินเบอร์ 1250',
      ],
      [
        'David',
        "Whoa, you need to hurry — it's 11:00!",
        'โห รีบเลยนะ ตอนนี้ 11 โมงแล้ว!',
      ],
      [
        'Mary',
        'I know! Could you hurry as quickly as possible, please?',
        'รู้แล้ว! ช่วยรีบให้เร็วที่สุดได้ไหมคะ',
      ],
      ['Agent', "Okay. Um, that's six tickets?", 'ได้ค่ะ ตั๋วหกใบใช่ไหมคะ'],
      ['Mary', 'Yes.', 'ใช่ค่ะ'],
      [
        'Agent',
        'And it is flight number 1250?',
        'แล้วก็เที่ยวบินเบอร์ 1250 ใช่ไหมคะ',
      ],
      ['Mary', 'Yes.', 'ใช่ค่ะ'],
      [
        'Agent',
        'Okay, and it leaves at 11:30?',
        'โอเค แล้วออกตอน 11:30 น. ใช่ไหมคะ',
      ],
      ['Mary', 'Yes. Yes. Yes.', 'ใช่ค่ะ ใช่ ใช่'],
      [
        'Agent',
        "Okay. Uh, I'm sorry, ma'am, but that flight has been delayed. It does not leave for another 1 hour and 45 minutes.",
        'โอเคค่ะ เอ่อ ขอโทษด้วยนะคะ เที่ยวบินนั้นล่าช้าค่ะ จะออกอีกทีในอีก 1 ชั่วโมง 45 นาทีข้างหน้า',
      ],
      [
        'Mary',
        'What do you mean? We got up very quickly, we got ready very quickly, we came to the airport very quickly, and you are telling me that our flight does not leave for another hour and 45 minutes?',
        'หมายความว่ายังไงคะ เราตื่นเร็วมาก เตรียมตัวเร็วมาก มาถึงสนามบินเร็วมาก แล้วคุณมาบอกว่าเที่ยวบินจะออกอีกตั้งชั่วโมงกับ 45 นาที',
      ],
      ['Agent', "Yeah, but that's good.", 'ใช่ค่ะ แต่นั่นเป็นเรื่องดีนะ'],
      ['Mary', 'How is that good?', 'ดียังไงเหรอ'],
      ['Agent', "Well, now you're not late.", 'ก็...ตอนนี้คุณไม่สายแล้วไงคะ'],
    ],
  },
  {
    key: 'lst3-evening-florida',
    title: 'Evening in Florida — Deciding What to Eat',
    emoji: '🌆',
    lines: [
      ['Kathy', "I'm so tired.", 'ฉันเหนื่อยจังเลย'],
      [
        'Mary',
        "I'm more than tired. I'm exhausted.",
        'ฉันไม่ใช่แค่เหนื่อยนะ ฉันหมดแรงเลย',
      ],
      [
        'Tina',
        "I think everybody's tired. I'm a little tired, but not too much.",
        'หนูว่าทุกคนเหนื่อยกันหมดเลย หนูก็เหนื่อยนิดหน่อย แต่ไม่มากเท่าไหร่',
      ],
      [
        'Jack',
        'Yes, me too. I think we should go somewhere tonight.',
        'ใช่ ผมก็เหมือนกัน ผมว่าคืนนี้เราน่าจะไปเที่ยวไหนกันสักที่นะ',
      ],
      ['David', 'How about going out to a movie?', 'ไปดูหนังกันไหม'],
      ['Bill', 'No.', 'ไม่เอา'],
      ['Kathy', 'No.', 'ไม่เอา'],
      [
        'David',
        "Sorry. I thought you'd like to go.",
        'โทษที นึกว่าจะอยากไปซะอีก',
      ],
      ['Tina', "I'd like to go see the beach.", 'หนูอยากไปดูชายหาด'],
      [
        'Mary',
        "Sweetheart, it's a little late. It's dark outside already.",
        'ลูกจ๋า มันดึกไปหน่อยแล้วนะ ข้างนอกมืดแล้ว',
      ],
      [
        'David',
        'I would like to take a shower before we go out.',
        'พ่ออยากอาบน้ำก่อนที่เราจะออกไปข้างนอก',
      ],
      [
        'Mary',
        'Yes, David is right. I think we all need a shower before we go out.',
        'ใช่ เดวิดพูดถูก แม่ว่าเราทุกคนต้องอาบน้ำก่อนออกไปข้างนอกกันนะ',
      ],
      [
        'David',
        "All right. After everyone's had a shower, we'll go out and eat.",
        'โอเค พออาบน้ำเสร็จกันหมดแล้ว เราจะออกไปกินข้าวกัน',
      ],
      ['Tina', 'Could we eat pizza?', 'กินพิซซ่ากันได้ไหมคะ'],
      [
        'Mary',
        'Tina, dear, we had pizza last night. We need to try something different tonight.',
        'ทีน่าลูก เมื่อคืนเรากินพิซซ่าไปแล้วนะ คืนนี้ลองอย่างอื่นกันดีกว่า',
      ],
      ['Bill', 'How about Chinese food?', 'กินอาหารจีนกันดีไหม'],
      [
        'Kathy',
        "You'd like to go out and get some Chinese food?",
        'อยากออกไปกินอาหารจีนกันเหรอ',
      ],
      ['Jack', 'Mm, sounds good.', 'อืม ฟังดูดีนะ'],
      ['Tina', 'Yeah.', 'เอาค่ะ'],
      [
        'Mary',
        "Okay, okay. Let's take a shower first and then we'll all go out to eat Chinese food.",
        'โอเค โอเค อาบน้ำกันก่อน แล้วเราจะไปกินอาหารจีนกันหมดทุกคนเลย',
      ],
      ['Tina', 'Mom.', 'แม่คะ'],
      ['Mary', 'Yes, Tina.', 'ว่าไงจ๊ะ'],
      [
        'Tina',
        "If I don't want Chinese food, could I order a pizza?",
        'ถ้าหนูไม่อยากกินอาหารจีน หนูสั่งพิซซ่าเองได้ไหมคะ',
      ],
    ],
  },
  {
    key: 'lst3-chinese-restaurant',
    title: 'At the Chinese Restaurant',
    emoji: '🥡',
    lines: [
      ['Waiter', 'Oh, hello.', 'อ้าว สวัสดีครับ'],
      ['David', 'Hi.', 'สวัสดีครับ'],
      ['Mary', 'Hi.', 'สวัสดีค่ะ'],
      ['Kathy', 'Hello.', 'สวัสดีค่ะ'],
      ['Waiter', 'Good evening. Hi.', 'สวัสดีตอนเย็นครับ สวัสดีครับ'],
      ['Bill', 'Hi.', 'สวัสดีครับ'],
      ['David', 'There are six of us.', 'เรามากันหกคนครับ'],
      ['Waiter', 'Ah, you want to kick a bus?', 'อ๋อ อยากจะเตะรถบัสเหรอครับ'],
      [
        'David',
        'No, I said there are six of us.',
        'เปล่าครับ ผมบอกว่าเรามากันหกคน',
      ],
      ['Waiter', 'Oh, there are six of you.', 'อ๋อ พวกคุณมากันหกคนนี่เอง'],
      ['David', 'Yes. Is there a table free?', 'ใช่ครับ มีโต๊ะว่างไหมครับ'],
      ['Waiter', "Huh? You can't see?", 'หา? มองไม่เห็นเหรอครับ'],
      [
        'David',
        'No, no — is there a table free?',
        'เปล่าครับ เปล่า ผมถามว่ามีโต๊ะว่างไหม',
      ],
      [
        'Waiter',
        'Oh, yes. Please come. Excuse me.',
        'อ๋อ มีครับ เชิญเลยครับ ขอทางหน่อยนะครับ',
      ],
      ['David', 'How much is the soup?', 'ซุปราคาเท่าไหร่ครับ'],
      [
        'Waiter',
        'You are a very large group.',
        'พวกคุณมากันเป็นกลุ่มใหญ่มากเลยนะครับ',
      ],
      [
        'David',
        'No, I asked you how much is the soup.',
        'เปล่าครับ ผมถามว่าซุปราคาเท่าไหร่',
      ],
      ['Waiter', "Oh, it's $3.", 'อ๋อ ราคา 3 ดอลลาร์ครับ'],
      ['David', 'And what about the rice?', 'แล้วข้าวล่ะครับ'],
      ['Waiter', "It's $1 a plate.", 'จานละ 1 ดอลลาร์ครับ'],
      [
        'David',
        "Okay, I think we'd like, um, six bowls of soup, six plates of rice, and one large duck.",
        'โอเคครับ เอาซุปหกถ้วย ข้าวหกจาน แล้วก็เป็ดตัวใหญ่หนึ่งตัวครับ',
      ],
    ],
  },
  {
    key: 'lst3-announcement',
    title: "Sue's Announcement",
    emoji: '👶',
    lines: [
      ['Joe', "Hi, honey. I'm home.", 'สวัสดีที่รัก ผมกลับมาแล้ว'],
      [
        'Joe',
        "Where have you been? You've been gone for a long time.",
        'คุณไปไหนมา หายไปนานเลยนะ',
      ],
      ['Sue', 'Well, I went to the doctor.', 'ก็... ฉันไปหาหมอมา'],
      [
        'Joe',
        "Sue, are you sick? Why didn't you tell me you weren't feeling well? I could've gone to the doctor with you.",
        'ซู คุณป่วยเหรอ ทำไมไม่บอกฉันว่าไม่สบาย ฉันจะได้ไปหาหมอด้วยกันกับคุณ',
      ],
      ['Sue', "Joe, dear, I'm not sick.", 'โจที่รัก ฉันไม่ได้ป่วยหรอก'],
      ['Joe', "You're not sick?", 'ไม่ป่วยเหรอ'],
      ['Sue', 'No.', 'ไม่ป่วยค่ะ'],
      [
        'Joe',
        "Well, if you're not sick, why did you go to the doctor, darling?",
        'แล้วถ้าไม่ป่วย ทำไมถึงไปหาหมอล่ะที่รัก',
      ],
      ['Sue', "We're going to have a baby.", 'เรากำลังจะมีลูกกันแล้วค่ะ'],
      ['Joe', 'A— a— a baby?', 'ลูก... ลูกเหรอ?'],
      ['Sue', "Yes, we're going to have a baby.", 'ใช่ค่ะ เรากำลังจะมีลูกกัน'],
      [
        'Joe',
        "Oh, soon! Oh, that's terrific!",
        'โอ้ เร็วๆ นี้เลย! เยี่ยมไปเลย!',
      ],
      ['Sue', "Oh, I'm so happy.", 'โอ้ ฉันมีความสุขมากเลย'],
      ['Joe', "I know. I'm excited, too.", 'ใช่ ฉันก็ตื่นเต้นเหมือนกัน'],
      [
        'Sue',
        "I'm going to call all of our friends on the telephone.",
        'ฉันจะโทรบอกเพื่อนๆ ของเราทุกคนเลย',
      ],
      ['Joe', 'Okay.', 'โอเค'],
      [
        'Sue',
        "I'm going to tell them the good news.",
        'ฉันจะบอกข่าวดีให้พวกเขาฟัง',
      ],
      ['Joe', 'Okay. Oh, a baby!', 'โอเค โอ้ ลูกน้อย!'],
      ['Sue', 'Yes.', 'ใช่ค่ะ'],
      ['Joe', 'Hello, Kathy?', 'ฮัลโหล แคธี่ใช่ไหม'],
      ['Kathy', 'Yes?', 'ใช่ค่ะ'],
      [
        'Joe',
        'This is Joe. Sue is going to have a baby.',
        'นี่โจนะ ซูกำลังจะมีลูกแล้ว',
      ],
      [
        'Kathy',
        'A baby! Oh, Sue, this is great — congratulations!',
        'ลูกเหรอ! โอ้ ซู เยี่ยมไปเลย ยินดีด้วยนะ',
      ],
      ['Sue', 'Thanks, Kathy.', 'ขอบคุณนะแคธี่'],
      [
        'Kathy',
        "I'm so happy for you and Joe. This is terrific news. We must have a congratulations party — we can invite everyone.",
        'ฉันดีใจกับเธอกับโจมากเลย นี่มันข่าวดีสุดๆ เราต้องจัดงานฉลองแสดงความยินดีกันนะ เชิญทุกคนมาเลย',
      ],
      [
        'Sue',
        "Oh, that's a terrific idea. We could invite your family, and we can invite the White family, too.",
        'โอ้ ไอเดียเยี่ยมมากเลย เชิญครอบครัวเธอด้วย แล้วก็เชิญครอบครัวไวท์มาด้วยก็ได้',
      ],
      [
        'Kathy',
        'Yes, definitely. This is fantastic. Congratulations, Joe. Congratulations, Sue.',
        'ใช่แน่นอน สุดยอดไปเลย ยินดีด้วยนะโจ ยินดีด้วยนะซู',
      ],
      ['Sue', 'Thank you.', 'ขอบคุณค่ะ'],
    ],
  },
  {
    key: 'lst3-party',
    title: 'The Congratulations Party',
    emoji: '🎉',
    lines: [
      [
        'Sue',
        'Oh, there we go. Oh, Mary, this is so beautiful. Thank you very much.',
        'โอ้ นี่ไง โอ้ แมรี่ สวยมากเลยค่ะ ขอบคุณมากนะคะ',
      ],
      ['Mary', "You're welcome, Sue.", 'ยินดีค่ะซู'],
      [
        'Sue',
        "Oh, wow. Oh, beautiful. Kathy, thank you for the lovely baby clothes. They're perfect.",
        'โอ้ ว้าว สวยจังเลย แคธี่ ขอบคุณสำหรับชุดเด็กน่ารักๆ นะ เพอร์เฟกต์เลย',
      ],
      [
        'Kathy',
        "You're welcome. It's my pleasure.",
        'ยินดีค่ะ ด้วยความยินดีเลย',
      ],
      [
        'Sue',
        "And Jack, it's so nice of you to give your ball for the baby to play with. Thank you.",
        'แล้วก็แจ็ค ใจดีจังเลยที่เอาลูกบอลมาให้ลูกฉันเล่น ขอบคุณนะ',
      ],
      ['Jack', "Don't mention it.", 'ไม่ต้องพูดถึงเลยครับ'],
      [
        'Sue',
        "And David, I can't thank you enough for the lovely toy you made. Are you sure it wasn't too difficult for you?",
        'แล้วก็เดวิด ขอบคุณมากๆ เลยสำหรับของเล่นน่ารักที่คุณทำมา แน่ใจนะว่าไม่ยากเกินไป',
      ],
      [
        'David',
        'No problem. Think nothing of it.',
        'ไม่เป็นไรเลยครับ ไม่ต้องคิดมากเลย',
      ],
      [
        'Sue',
        'I want you all to know we appreciate these gifts so much. They are really lovely. Thank you.',
        'ฉันอยากให้ทุกคนรู้ว่าเราซาบซึ้งกับของขวัญพวกนี้มากจริงๆ มันน่ารักสุดๆ เลย ขอบคุณนะคะ',
      ],
      ['Bill', 'No problem.', 'ไม่เป็นไรครับ'],
      ['Kathy', 'Sure.', 'ยินดีค่ะ'],
      [
        'Joe',
        'We are really so lucky to have such good friends.',
        'เราโชคดีมากจริงๆ ที่มีเพื่อนดีๆ แบบนี้',
      ],
      ['Mary', 'God bless you all.', 'ขอพระเจ้าอวยพรให้ทุกคนนะคะ'],
      ['Sue', 'Thank you.', 'ขอบคุณค่ะ'],
      [
        'Joe',
        "I want to thank everyone, too. When our family moved into this apartment, we didn't know anyone — but now we have many new friends.",
        'ผมก็อยากขอบคุณทุกคนเหมือนกันครับ ตอนที่ครอบครัวเราย้ายเข้ามาอยู่อพาร์ตเมนต์นี้ เราไม่รู้จักใครเลย แต่ตอนนี้เรามีเพื่อนใหม่มากมายเลย',
      ],
      [
        'Sue',
        "I agree. You're all very special to me. And Tina — you know how you can be a good friend to me in the future? By helping me take care of the baby in your free time.",
        'ฉันเห็นด้วยค่ะ ทุกคนมีความหมายกับฉันมากจริงๆ แล้วก็ทีน่า รู้ไหมว่าหนูจะเป็นเพื่อนที่ดีกับฉันในอนาคตได้ยังไง ก็ช่วยฉันดูแลลูกน้อยตอนที่หนูว่างไงจ๊ะ',
      ],
      [
        'Mary',
        "You know, I am so glad you moved into our apartment building. I think we've become very good friends.",
        'รู้ไหมคะ ฉันดีใจมากเลยที่พวกคุณย้ายมาอยู่อพาร์ตเมนต์เดียวกับเรา ฉันว่าเรากลายเป็นเพื่อนที่ดีต่อกันมากเลย',
      ],
      [
        'David',
        'Yes, we have. And I think we will all be friends for a very long time.',
        'ใช่ครับ เราเป็นแล้วจริงๆ แล้วผมก็คิดว่าเราจะเป็นเพื่อนกันไปอีกนานแสนนานเลย',
      ],
    ],
  },
  {
    key: 'lst3-vegetables',
    title: 'Bonus: Vegetables Vocabulary',
    emoji: '🥦',
    lines: [
      [
        'Teacher',
        'Which vegetables do you usually eat?',
        'ปกติคุณกินผักอะไรบ้าง',
      ],
      [
        'Student',
        'I usually eat cucumbers, potatoes, and cabbages.',
        'ปกติผมกินแตงกวา มันฝรั่ง กับกะหล่ำปลีครับ',
      ],
      [
        'Teacher',
        'Number two: do you like eating lettuce?',
        'ข้อสอง คุณชอบกินผักกาดหอมไหม',
      ],
      [
        'Student',
        'Yes, I do — I love lettuce. Or: not really, I rarely eat lettuce.',
        'ชอบครับ ผมชอบผักกาดหอมมาก หรืออาจตอบว่า ไม่ค่อยชอบเท่าไหร่ ผมแทบไม่ค่อยได้กินผักกาดหอมเลย',
      ],
      [
        'Teacher',
        '"Rarely" here means "almost never" — very seldom.',
        'คำว่า "rarely" ในที่นี้หมายถึง "แทบจะไม่เคยเลย" คือนานๆ ครั้งมาก',
      ],
      [
        'Teacher',
        'Number three: how do you like to eat carrots?',
        'ข้อสาม คุณชอบกินแครอทแบบไหน',
      ],
      [
        'Student',
        'You can eat them raw, boiled, steamed, stir-fried, fried, or grilled and baked.',
        'กินได้ทั้งแบบดิบ ต้ม นึ่ง ผัด ทอด หรือย่างกับอบ',
      ],
      [
        'Teacher',
        '"Raw" means without cooking. Do you eat asparagus?',
        '"Raw" แปลว่าไม่ผ่านการปรุงสุก แล้วคุณกินหน่อไม้ฝรั่งไหม',
      ],
      [
        'Student',
        "Yes, I do — it's delicious. Or: No, I don't, sorry — I don't eat asparagus.",
        'กินครับ อร่อยดี หรืออาจตอบว่า ไม่กินครับ ขอโทษด้วย ผมไม่กินหน่อไม้ฝรั่ง',
      ],
      [
        'Teacher',
        "Some vegetables are ones people don't really hate, but they just don't eat them.",
        'ผักบางอย่างคนเราไม่ได้เกลียดนะ แค่ไม่ค่อยได้กินเฉยๆ',
      ],
      [
        'Teacher',
        "Number five — this one's a bit harder: which vegetables are there in the fridge?",
        'ข้อห้า ข้อนี้ยากขึ้นมาหน่อย มีผักอะไรอยู่ในตู้เย็นบ้าง',
      ],
      ['Teacher', '"Fridge" means refrigerator.', '"Fridge" หมายถึงตู้เย็น'],
      [
        'Student',
        "There are green beans and eggplants. Or: there aren't any vegetables in the fridge.",
        'มีถั่วฝักยาวกับมะเขือม่วงอยู่ในตู้เย็น หรืออาจตอบว่า ไม่มีผักอะไรอยู่ในตู้เย็นเลย',
      ],
      [
        'Teacher',
        'If there are some vegetables, you say "there are" plus the vegetable. And if there aren\'t any, you just say "there aren\'t any vegetables in the fridge" — meaning there are none at all.',
        'ถ้ามีผักอยู่ ก็พูดว่า "there are" ตามด้วยชื่อผัก แต่ถ้าไม่มีเลย ก็พูดว่า "there aren\'t any vegetables in the fridge" ซึ่งหมายความว่าไม่มีผักเลยสักอย่าง',
      ],
      [
        'Teacher',
        'Can you go to the supermarket to buy some sweet potatoes for me?',
        'ช่วยไปซูเปอร์มาร์เก็ตซื้อมันเทศให้หน่อยได้ไหม',
      ],
      [
        'Teacher',
        "This means, say we don't have any sweet potatoes at home right now, and I want to cook, so I ask you to go buy some for me.",
        'ประโยคนี้หมายความว่า สมมติว่าที่บ้านตอนนี้ไม่มีมันเทศเลย แล้วฉันอยากจะทำอาหาร ก็เลยขอให้คุณไปซื้อมาให้หน่อย',
      ],
      ['Student', 'Sure, no problem.', 'ได้เลยครับ ไม่มีปัญหา'],
      [
        'Teacher',
        'Or, if you disagree and want to refuse, you can say: "Sorry, I can\'t. I\'m busy now."',
        'หรือถ้าไม่สะดวกและอยากจะปฏิเสธ ก็พูดได้ว่า "ขอโทษนะ ทำไม่ได้ ตอนนี้ยุ่งอยู่"',
      ],
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
      displayOrder: 3,
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
    `Listening seed (Lesson 3) done: units=${unitsUpserted}, lines=${linesInserted}`,
  );
  await dataSource.destroy();
}

main().catch((err) => {
  console.error('Listening seed (Lesson 3) failed:', err);
  process.exit(1);
});
