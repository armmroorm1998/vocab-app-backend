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

// Lesson 1 — "Easy English for Beginners — English Conversation 1"
// https://www.youtube.com/watch?v=MyML-yIQAGw (Units 1-20)
// More lessons (from other source videos) get their own LESSON/UNITS block
// and are appended the same way, keyed 'lesson-2', 'lesson-3', ...

const LESSON_KEY = 'lesson-1';
const LESSON_TITLE = 'Lesson 1: English Conversation 1';
const LESSON_EMOJI = '🎬';

const VIDEO_ID = 'MyML-yIQAGw';

// Start second of each Unit, read directly from the YouTube transcript's own
// timestamps at (or immediately after) the point where the "Unit N" marker is
// spoken — accurate to the transcript's caption-chunk granularity.
const UNIT_START_SECONDS = [
  0, 124, 193, 310, 412, 498, 587, 742, 823, 927, 1030, 1189, 1261, 1388, 1465,
  1567, 1712, 1840, 2030, 2159,
];
// End of the last unit is where the closing pronunciation bonus section begins.
const VIDEO_END_SECONDS = 2257;

type SeedLine = [speaker: string, en: string, th: string];

type SeedUnit = {
  key: string;
  title: string;
  emoji: string;
  lines: SeedLine[];
};

const UNITS: SeedUnit[] = [
  {
    key: 'lst-where-from',
    title: 'Where Do You Come From?',
    emoji: '🌍',
    lines: [
      ['A', 'Hello.', 'สวัสดีค่ะ'],
      ['B', 'Hello.', 'สวัสดีครับ'],
      ['A', 'How are you?', 'สบายดีไหมคะ'],
      [
        'B',
        "I'm fine, thank you. And you?",
        'สบายดีครับ ขอบคุณ แล้วคุณล่ะครับ',
      ],
      [
        'A',
        "I'm fine, thank you. Where are you from?",
        'สบายดีค่ะ ขอบคุณ คุณมาจากไหนคะ',
      ],
      ['B', 'I come from England.', 'ผมมาจากประเทศอังกฤษครับ'],
      [
        'A',
        'You come from England. Do you like Manchester United?',
        'คุณมาจากอังกฤษเหรอคะ คุณชอบทีมแมนเชสเตอร์ยูไนเต็ดไหม',
      ],
      ['B', "Um, I don't like football.", 'อืม ผมไม่ชอบฟุตบอลครับ'],
      [
        'A',
        "Oh, you don't like football? I see. Why did you come here?",
        'อ๋อ คุณไม่ชอบฟุตบอลเหรอ เข้าใจแล้วค่ะ แล้วทำไมถึงมาที่นี่ล่ะคะ',
      ],
      ['B', 'I came for vacation.', 'ผมมาพักร้อนครับ'],
      [
        'A',
        'You came for vacation. Are you having fun?',
        'มาพักร้อนเหรอคะ สนุกไหม',
      ],
      ['B', "Yes, I'm having a great time.", 'ครับ สนุกมากเลย'],
      [
        'A',
        'What do you like the best about here?',
        'คุณชอบอะไรที่นี่มากที่สุดคะ',
      ],
      [
        'B',
        'What do I like the best? Well, the people are very kind.',
        'ชอบอะไรมากที่สุดเหรอครับ ก็... ผู้คนที่นี่ใจดีมากครับ',
      ],
      [
        'A',
        'Yes, the people here are kind. Do you like the food?',
        'ใช่ค่ะ คนที่นี่ใจดี แล้วคุณชอบอาหารไหมคะ',
      ],
      ['B', 'Yes, the food is great.', 'ครับ อาหารอร่อยมาก'],
      ['A', 'Is the food too spicy for you?', 'อาหารเผ็ดเกินไปสำหรับคุณไหมคะ'],
      [
        'B',
        'No, I love spicy food. I can eat spicy food every day.',
        'ไม่เลยครับ ผมชอบอาหารเผ็ด กินทุกวันได้เลย',
      ],
      [
        'A',
        'How much longer will you stay here?',
        'คุณจะอยู่ที่นี่อีกนานแค่ไหนคะ',
      ],
      ['B', 'I will stay two more days.', 'ผมจะอยู่อีกสองวันครับ'],
      ['A', 'Oh, then you will go home.', 'อ๋อ แล้วก็จะกลับบ้านสินะคะ'],
      ['B', 'Yes, then I will go home.', 'ใช่ครับ แล้วผมก็จะกลับบ้าน'],
      ['A', 'Oh, where do you work?', 'อ้อ แล้วคุณทำงานที่ไหนคะ'],
      ['B', 'I work for a big company.', 'ผมทำงานบริษัทใหญ่แห่งหนึ่งครับ'],
      ['A', 'What kind of company do you work for?', 'เป็นบริษัทประเภทไหนคะ'],
      [
        'B',
        'I work for an import company. And, uh, what about you?',
        'ผมทำงานบริษัทนำเข้าครับ แล้วคุณล่ะครับ',
      ],
      ['A', 'I work at a bank.', 'ฉันทำงานธนาคารค่ะ'],
      [
        'B',
        'Huh? Are you a bank teller?',
        'หา? คุณเป็นพนักงานเคาน์เตอร์ธนาคารเหรอครับ',
      ],
      ['A', "No, I'm the owner.", 'เปล่าค่ะ ฉันเป็นเจ้าของธนาคาร'],
      ['B', 'Oh!', 'โอ้โห!'],
    ],
  },
  {
    key: 'lst-vacation',
    title: 'How Was Your Vacation?',
    emoji: '🏖️',
    lines: [
      ['A', 'Hey, how was your vacation?', 'นี่ ไปพักร้อนมาเป็นยังไงบ้าง'],
      ['B', 'It was very fun.', 'สนุกมากเลย'],
      ['A', 'Where did you go?', 'ไปเที่ยวที่ไหนมา'],
      ['B', 'I went to the beach.', 'ไปทะเลมา'],
      ['A', 'Who did you go with?', 'ไปกับใครเหรอ'],
      [
        'B',
        'I went with my father, mother, and older sister.',
        'ไปกับพ่อ แม่ และพี่สาว',
      ],
      ['A', 'Do you have a house at the beach?', 'มีบ้านอยู่ที่ชายหาดเหรอ'],
      ['B', 'No, we stayed at a hotel.', 'เปล่า เราพักโรงแรม'],
      ['A', 'Which hotel did you stay at?', 'พักโรงแรมไหนล่ะ'],
      ['B', "It's called the Imperial.", 'ชื่อโรงแรมอิมพีเรียล'],
      ['A', 'Have you stayed there before?', 'เคยไปพักที่นั่นมาก่อนไหม'],
      [
        'B',
        "Yes, we've been going there for years.",
        'เคยสิ เราไปที่นั่นมาหลายปีแล้ว',
      ],
      ['A', 'Must be very nice.', 'คงดีมากเลยสินะ'],
      [
        'B',
        "Yes, it's very nice and not too expensive.",
        'ใช่ ดีมากและก็ไม่แพงเกินไปด้วย',
      ],
      ['A', 'Did you play in the water?', 'ได้เล่นน้ำไหม'],
      [
        'B',
        'Yes, I went swimming and I rode the banana boat.',
        'ใช่ ได้ว่ายน้ำและเล่นบานาน่าโบ๊ตด้วย',
      ],
      ['A', 'How about your older sister?', 'แล้วพี่สาวล่ะ'],
      [
        'B',
        'She does not like the water. She likes to sit on the beach and read a book.',
        'พี่สาวไม่ชอบเล่นน้ำ เขาชอบนั่งอ่านหนังสือบนชายหาดมากกว่า',
      ],
      [
        'A',
        'What do your mother and father like to do?',
        'แล้วพ่อกับแม่ชอบทำอะไร',
      ],
      [
        'B',
        'They like to eat in the restaurant.',
        'ท่านชอบไปกินอาหารที่ร้านอาหาร',
      ],
      ['A', 'How long was your vacation?', 'ไปพักร้อนกี่วัน'],
      ['B', 'Three or four days.', 'สามหรือสี่วัน'],
      ['A', 'And will you go there again next year?', 'แล้วปีหน้าจะไปอีกไหม'],
      ['B', 'Of course.', 'แน่นอนอยู่แล้ว'],
    ],
  },
  {
    key: 'lst-remember-me',
    title: 'Do You Remember Me?',
    emoji: '🤔',
    lines: [
      ['A', 'Hey, is that Bill?', 'เฮ้ นั่นบิลใช่ไหม'],
      [
        'B',
        'Uh, yeah. Um... do you remember me from school?',
        'เอ่อ ใช่ครับ...คุณจำผมได้จากตอนเรียนไหม',
      ],
      ['A', "I'm sorry, I don't remember you.", 'ขอโทษนะ จำไม่ได้เลย'],
      ['B', 'Did we study together?', 'เราเคยเรียนด้วยกันไหมครับ'],
      [
        'A',
        'Yes. And we lived in the same dorm, too.',
        'ใช่ แล้วก็เคยอยู่หอเดียวกันด้วย',
      ],
      ['B', 'Really? What floor did you live on?', 'จริงเหรอครับ อยู่ชั้นไหน'],
      [
        'A',
        'I lived on the ninth floor. You lived on the seventh floor.',
        'ฉันอยู่ชั้นเก้า คุณอยู่ชั้นเจ็ด',
      ],
      ['B', "That's right. How did you know?", 'ใช่เลยครับ รู้ได้ยังไง'],
      [
        'A',
        'I would see you in the elevator sometimes.',
        'บางทีก็เจอคุณในลิฟต์',
      ],
      [
        'B',
        "I'm sorry, I don't remember you.",
        'ขอโทษจริงๆ ครับ จำคุณไม่ได้เลย',
      ],
      [
        'A',
        "It's all right. It was several years ago.",
        'ไม่เป็นไร มันก็ผ่านมาหลายปีแล้วนี่',
      ],
      [
        'B',
        "Well, anyway, it's nice to meet you again. Um... Monica?",
        'เอาเถอะครับ ดีใจที่ได้เจออีกครั้ง เอ่อ...โมนิกาใช่ไหมครับ',
      ],
      ['A', 'Monica Sales, right?', 'โมนิกา เซลส์ ใช่ไหม'],
      [
        'B',
        'Yes. See, so you do remember me!',
        'ใช่ค่ะ เห็นไหม คุณจำฉันได้นี่',
      ],
      ['A', 'Okay. So, where do you live now?', 'เอาล่ะ ตอนนี้อยู่ที่ไหนครับ'],
      ['B', 'I live in an apartment.', 'ฉันอยู่อพาร์ตเมนต์ค่ะ'],
      ['A', 'Oh. Do you live with your parents?', 'อ๋อ อยู่กับพ่อแม่เหรอ'],
      [
        'B',
        'No, my parents moved to the country.',
        'เปล่าค่ะ พ่อแม่ย้ายไปอยู่ต่างจังหวัด',
      ],
      [
        'A',
        'Oh, they must be very happy there.',
        'โอ้ ท่านคงมีความสุขที่นั่นมากเลยสินะ',
      ],
      ['B', 'Yes, they enjoy it very much.', 'ใช่ค่ะ ท่านชอบมากเลย'],
      ['A', 'So, do you live alone?', 'แล้วคุณอยู่คนเดียวเหรอ'],
      [
        'B',
        'No, I share the apartment with an old friend.',
        'เปล่าค่ะ ฉันอยู่กับเพื่อนเก่าคนหนึ่ง',
      ],
      [
        'A',
        'Really? A friend? Is he a boyfriend?',
        'จริงเหรอ เพื่อนเหรอ เป็นแฟนหรือเปล่า',
      ],
      [
        'B',
        "No, she's an old friend from school. We've known each other for many years. How about you, Bill? Where do you live?",
        'เปล่าค่ะ เธอเป็นเพื่อนเก่าตั้งแต่สมัยเรียน รู้จักกันมาหลายปีแล้ว แล้วบิลล่ะ อยู่ที่ไหน',
      ],
      [
        'A',
        "Oh, I rent an apartment. I'm by myself.",
        'อ๋อ ผมเช่าอพาร์ตเมนต์อยู่ครับ อยู่คนเดียว',
      ],
      ['B', 'Do you like it there?', 'ชอบที่นั่นไหม'],
      ['A', "Yeah, but it's kind of noisy.", 'ชอบครับ แต่ค่อนข้างจะเสียงดัง'],
      [
        'B',
        'Oh, maybe you should complain to your neighbors.',
        'โอ้ บางทีคุณอาจจะต้องไปบอกเพื่อนบ้านนะ',
      ],
      [
        'A',
        "Oh, no, no, no. I'm the one who makes the noise.",
        'โอ้ ไม่ๆๆ ผมนี่แหละที่เป็นคนเสียงดัง',
      ],
    ],
  },
  {
    key: 'lst-style',
    title: 'I Like Your Style',
    emoji: '👕',
    lines: [
      ['A', 'Hey, I like your shirt.', 'เฮ้ ฉันชอบเสื้อของคุณจัง'],
      [
        'B',
        "Thanks. It's new. I got it last week.",
        'ขอบคุณ เพิ่งซื้อมาใหม่เมื่อสัปดาห์ก่อน',
      ],
      ['A', 'Huh? Did you get anything else?', 'หา ซื้ออย่างอื่นมาด้วยไหม'],
      ['B', 'No, just the shirt.', 'เปล่า ซื้อแค่เสื้อตัวนี้'],
      ['A', 'Where did you get it?', 'ซื้อมาจากไหน'],
      ['B', 'I got it from the weekend market.', 'ซื้อมาจากตลาดนัดสุดสัปดาห์'],
      ['A', 'How much did it cost?', 'ราคาเท่าไหร่'],
      ['B', 'It cost about $12.', 'ประมาณ 12 ดอลลาร์'],
      [
        'A',
        'Really? That did not cost too much at all.',
        'จริงเหรอ ไม่แพงเลยนะ',
      ],
      ['B', "Yeah, it's a good price.", 'ใช่ ราคาดีเลย'],
      ['A', 'Do you like to wear hats?', 'ชอบใส่หมวกไหม'],
      [
        'B',
        'Yeah, I like to wear hats, but only in the winter time when it is cold.',
        'ชอบนะ แต่ใส่เฉพาะหน้าหนาวตอนอากาศเย็นเท่านั้น',
      ],
      ['A', 'Do you like to wear jewelry?', 'ชอบใส่เครื่องประดับไหม'],
      [
        'B',
        'I just have this necklace that my girlfriend gave to me.',
        'มีแค่สร้อยคอเส้นนี้ที่แฟนให้มา',
      ],
      ['A', 'What do you think about fashion?', 'คิดยังไงเรื่องแฟชั่น'],
      [
        'B',
        'I think it is important to be in fashion.',
        'ฉันว่าการแต่งตัวให้ทันสมัยเป็นเรื่องสำคัญ',
      ],
      ['A', 'Do you have a pierced ear?', 'เจาะหูไหม'],
      [
        'B',
        'No, I do not have a pierced ear. Do you have a tattoo?',
        'ไม่ ไม่ได้เจาะหู แล้วคุณมีรอยสักไหม',
      ],
      ['A', 'Yes, I do.', 'มีสิ'],
      ['B', 'Huh? What is the tattoo of?', 'หา เป็นรูปอะไร'],
      [
        'A',
        "It's a big blue scary monster.",
        'เป็นรูปสัตว์ประหลาดสีฟ้าตัวใหญ่น่ากลัว',
      ],
      ['B', 'Huh? Really?', 'หา จริงเหรอ'],
      ['A', 'Yeah.', 'ใช่'],
      ['B', 'Wow. Can I see it?', 'ว้าว ขอดูหน่อยได้ไหม'],
      ['A', 'Are you sure?', 'แน่ใจนะ'],
      ['B', "Yes, I'm sure.", 'แน่ใจ'],
      ['A', "Okay, here's my tattoo.", 'โอเค นี่ไงรอยสักของฉัน'],
    ],
  },
  {
    key: 'lst-family',
    title: 'Family',
    emoji: '👨‍👩‍👧',
    lines: [
      ['A', 'Do you have any brothers and sisters?', 'มีพี่น้องไหม'],
      ['B', 'I have one sister.', 'มีพี่สาวคนหนึ่ง'],
      ['A', 'Who is older, you or your sister?', 'ใครโตกว่ากัน คุณหรือพี่สาว'],
      ['B', 'My sister is older than me.', 'พี่สาวโตกว่าฉัน'],
      ['A', 'Do you get along with your sister?', 'เข้ากับพี่สาวได้ดีไหม'],
      ['B', 'Yes, we get along.', 'ดีค่ะ เราเข้ากันได้ดี'],
      ['A', 'Okay. How about your parents?', 'เข้าใจแล้ว แล้วพ่อแม่ล่ะ'],
      ['B', 'My father died many years ago.', 'พ่อเสียไปหลายปีแล้ว'],
      ['A', 'I am sorry to hear about that.', 'เสียใจด้วยนะ'],
      [
        'B',
        'My mother is fine though. She is very strong and likes to work.',
        'แต่แม่ยังสบายดี ท่านเข้มแข็งมากและชอบทำงาน',
      ],
      ['A', 'What does your mother do?', 'แม่ทำงานอะไร'],
      ['B', 'She teaches at a university.', 'ท่านสอนที่มหาวิทยาลัย'],
      ['A', "That's great. What does she teach?", 'เยี่ยมเลย สอนวิชาอะไร'],
      ['B', 'She teaches psych— psychology.', 'ท่านสอนวิชาจิต...จิตวิทยา'],
      ['A', 'Pardon me. I do not understand.', 'ขอโทษนะ ไม่เข้าใจ'],
      ['B', 'She teaches psychology.', 'ท่านสอนวิชาจิตวิทยา'],
      [
        'A',
        'Psychology. I understand now. How about you? Are you married?',
        'จิตวิทยาเหรอ เข้าใจแล้ว แล้วคุณล่ะ แต่งงานหรือยัง',
      ],
      [
        'B',
        "I'm not married yet. I had a girlfriend for many years, but we broke up.",
        'ยังไม่แต่งครับ มีแฟนมาหลายปีแต่เลิกกันไปแล้ว',
      ],
      ['A', "I'm sad to hear that.", 'เสียใจด้วยนะ'],
    ],
  },
  {
    key: 'lst-return-shirt',
    title: 'Returning a Shirt',
    emoji: '🧾',
    lines: [
      ['A', 'Can I return this?', 'ขอคืนสินค้าชิ้นนี้ได้ไหมคะ'],
      ['B', 'What is it?', 'เป็นอะไรเหรอครับ'],
      ['A', "It's a shirt.", 'เป็นเสื้อเชิ้ตค่ะ'],
      ['B', "What's wrong with it?", 'มีปัญหาอะไรกับมันเหรอครับ'],
      [
        'A',
        "Well, nothing's wrong with it. It just doesn't fit.",
        'ก็ไม่มีอะไรผิดปกติหรอกค่ะ แค่ใส่ไม่พอดี',
      ],
      ['B', 'Is the color wrong?', 'สีผิดหรือเปล่าครับ'],
      [
        'A',
        'No, the color is fine, but the size is much too small.',
        'ไม่ค่ะ สีถูกต้อง แต่ไซซ์เล็กเกินไปมาก',
      ],
      [
        'B',
        'Do you remember when you bought it?',
        'จำได้ไหมครับว่าซื้อมาเมื่อไหร่',
      ],
      ['A', "I didn't.", 'ฉันไม่ได้ซื้อค่ะ'],
      [
        'B',
        "You didn't buy the shirt? Who bought it?",
        'คุณไม่ได้ซื้อเองเหรอครับ แล้วใครซื้อ',
      ],
      ['A', 'My friend bought it.', 'เพื่อนซื้อให้ค่ะ'],
      [
        'B',
        'Do you remember when your friend bought it?',
        'จำได้ไหมว่าเพื่อนซื้อเมื่อไหร่',
      ],
      ['A', 'She bought it last week.', 'เธอซื้อเมื่อสัปดาห์ที่แล้วค่ะ'],
      ['B', 'Okay, good. Do you have the receipt?', 'โอเค ดีครับ มีใบเสร็จไหม'],
      ['A', 'As a matter of fact, I do.', 'มีค่ะ พอดีเลย'],
      [
        'B',
        'Let me have the shirt and the receipt, please. Would you like to exchange it for a larger size?',
        'ขอเสื้อกับใบเสร็จหน่อยครับ คุณอยากเปลี่ยนเป็นไซซ์ใหญ่ขึ้นไหม',
      ],
      [
        'A',
        'Um, can I get cash back instead?',
        'เอ่อ ขอเป็นเงินคืนแทนได้ไหมคะ',
      ],
      [
        'B',
        'No, but I can give you store credit.',
        'ไม่ได้ครับ แต่ผมให้เป็นเครดิตร้านค้าได้',
      ],
      ['A', 'What is that?', 'คืออะไรเหรอคะ'],
      [
        'B',
        'Well, the shirt was $19.99, right?',
        'ก็คือเสื้อตัวนี้ราคา 19.99 ดอลลาร์ใช่ไหมครับ',
      ],
      ['A', "Yeah, that's right.", 'ใช่ค่ะ ถูกต้อง'],
      [
        'B',
        'Well, I can give you a store coupon good for $19.99, or you can exchange this shirt for a larger size.',
        'ผมให้คูปองร้านมูลค่า 19.99 ดอลลาร์ได้ครับ หรือจะเปลี่ยนเป็นเสื้อไซซ์ใหญ่ขึ้นก็ได้',
      ],
      ['A', "Okay, I'll take the coupon.", 'โอเค ขอเป็นคูปองแล้วกันค่ะ'],
      ['B', 'Okay, thank you.', 'ได้ครับ ขอบคุณครับ'],
    ],
  },
  {
    key: 'lst-pet',
    title: 'Do You Have a Pet?',
    emoji: '🦎',
    lines: [
      ['A', 'Do you have a pet?', 'คุณมีสัตว์เลี้ยงไหม'],
      ['B', 'Yes, I do.', 'มีสิ'],
      ['A', 'Oh. What kind of pet do you have?', 'อ๋อ เลี้ยงสัตว์อะไรเหรอ'],
      ['B', 'Can you guess?', 'ลองทายดูสิ'],
      [
        'A',
        'Can I guess? Okay. Do you have a pet dog?',
        'ให้ทายเหรอ โอเค คุณเลี้ยงหมาหรือเปล่า',
      ],
      ['B', 'No, I do not have a pet dog.', 'ไม่ ไม่ได้เลี้ยงหมา'],
      [
        'A',
        'Okay. You do not have a pet dog. Do you have a pet cat?',
        'โอเค ไม่ได้เลี้ยงหมา แล้วเลี้ยงแมวไหม',
      ],
      ['B', 'No, I do not have a pet cat.', 'ไม่ ไม่ได้เลี้ยงแมว'],
      [
        'A',
        'You do not have a pet cat. Do you have a pet fish?',
        'ไม่ได้เลี้ยงแมว แล้วเลี้ยงปลาไหม',
      ],
      ['B', 'No, I do not have a pet fish.', 'ไม่ ไม่ได้เลี้ยงปลา'],
      [
        'A',
        "You don't have a pet fish? You cannot guess? Do you want me to tell you?",
        'ไม่ได้เลี้ยงปลาเหรอ ทายไม่ออกแล้วเหรอ อยากให้บอกไหม',
      ],
      [
        'B',
        "No. Wait a minute. I'm thinking. Give me one more guess.",
        'ไม่ รอเดี๋ยว กำลังคิดอยู่ ขอทายอีกครั้งนะ',
      ],
      [
        'A',
        "Okay, I'll give you one more guess. I know — you have a pet monkey!",
        'โอเค ให้ทายอีกครั้งนึง ฉันรู้แล้ว...คุณเลี้ยงลิงใช่ไหม',
      ],
      [
        'B',
        'What? A pet monkey? Why would I have a pet monkey?',
        'อะไรนะ เลี้ยงลิงเหรอ ทำไมฉันจะเลี้ยงลิงล่ะ',
      ],
      ['A', 'Because you look like a monkey.', 'ก็เพราะคุณหน้าตาเหมือนลิงไง'],
      ['B', "I don't look like a monkey.", 'ฉันไม่ได้หน้าเหมือนลิงสักหน่อย'],
      ['A', 'You look like a monkey.', 'คุณหน้าเหมือนลิงจริงๆ นะ'],
      [
        'B',
        'Okay, I cannot guess. What kind of pet do you have?',
        'โอเค ทายไม่ออกแล้ว คุณเลี้ยงสัตว์อะไรกันแน่',
      ],
      ['A', 'I have a pet iguana.', 'ฉันเลี้ยงอีกัวน่า'],
      [
        'B',
        'An iguana? How unusual. Where did you get it?',
        'อีกัวน่าเหรอ แปลกจัง ได้มาจากไหน',
      ],
      ['A', 'From the pet shop.', 'จากร้านขายสัตว์เลี้ยง'],
      ['B', 'How long have you had it?', 'เลี้ยงมานานแค่ไหนแล้ว'],
      ['A', 'About 4 years.', 'ประมาณ 4 ปีแล้ว'],
      ['B', "Wow. What is your iguana's name?", 'ว้าว อีกัวน่าของคุณชื่ออะไร'],
      ['A', 'Uh, his name is Winnie.', 'เอ่อ ชื่อวินนี่'],
      ['B', 'Winnie. What does Winnie do?', 'วินนี่เหรอ แล้ววินนี่ทำอะไรบ้าง'],
      [
        'A',
        "Winnie doesn't do very much. He's quite lazy.",
        'วินนี่ไม่ค่อยทำอะไรหรอก มันขี้เกียจมาก',
      ],
      ['B', 'Oh, what does Winnie eat?', 'อ้อ แล้ววินนี่กินอะไร'],
      [
        'A',
        'Winnie is a vegetarian. He eats vegetables.',
        'วินนี่กินมังสวิรัติ มันกินแต่ผัก',
      ],
      ['B', "That's quite interesting.", 'น่าสนใจดีจัง'],
    ],
  },
  {
    key: 'lst-food',
    title: 'What Kind of Food Do You Like?',
    emoji: '🌶️',
    lines: [
      ['A', 'What kind of foods do you like?', 'คุณชอบกินอาหารแบบไหน'],
      ['B', 'I like all kinds of foods.', 'ฉันชอบกินทุกอย่างเลย'],
      ['A', 'Really? Can you eat spicy food?', 'จริงเหรอ กินเผ็ดได้ไหม'],
      [
        'B',
        'I love spicy food. The hotter the better.',
        'ชอบมากเลย ยิ่งเผ็ดยิ่งดี',
      ],
      ['A', 'You are so lucky.', 'โชคดีจังเลยนะ'],
      ['B', 'Why am I lucky?', 'ทำไมถึงโชคดีล่ะ'],
      [
        'A',
        "It's terrible when I eat a hot pepper.",
        'เวลาฉันกินพริกเผ็ดๆ แย่มากเลย',
      ],
      [
        'B',
        'Can you eat Thai or Mexican food?',
        'กินอาหารไทยหรือเม็กซิกันได้ไหม',
      ],
      [
        'A',
        "Yes, I can. But only if it's really bland.",
        'ได้สิ แต่ต้องไม่เผ็ดเลยจริงๆ',
      ],
      ['B', 'Do you eat out very often?', 'ไปกินข้าวนอกบ้านบ่อยไหม'],
      ['A', 'Sometimes.', 'บางครั้ง'],
      ['B', 'Do you have a favorite restaurant?', 'มีร้านโปรดไหม'],
      [
        'A',
        'I do have a favorite vegetarian restaurant.',
        'มีร้านมังสวิรัติที่ชอบอยู่ร้านหนึ่ง',
      ],
      ['B', 'Are you a vegetarian?', 'คุณกินมังสวิรัติเหรอ'],
      ['A', 'Yes, I am.', 'ใช่'],
      ['B', "So, you don't eat chicken or pork?", 'งั้นก็ไม่กินไก่หรือหมูสินะ'],
      [
        'A',
        'No chicken, no pork, but I do eat fish.',
        'ไม่กินไก่ ไม่กินหมู แต่กินปลา',
      ],
      [
        'B',
        'Are you vegetarian for health reasons or religious reasons?',
        'กินมังสวิรัติเพราะเรื่องสุขภาพหรือศาสนา',
      ],
      ['A', 'Mostly for health reasons.', 'ส่วนใหญ่เพื่อสุขภาพ'],
      [
        'B',
        'All this talk about food has made me hungry. Are you hungry?',
        'คุยเรื่องอาหารมาตั้งนานทำให้หิวเลย คุณหิวไหม',
      ],
      [
        'A',
        'Yes, I am. Would you like to go to my favorite vegetarian restaurant?',
        'หิวสิ อยากไปร้านมังสวิรัติโปรดของฉันไหม',
      ],
      ['B', 'What is good there?', 'ที่นั่นเมนูไหนอร่อย'],
      [
        'A',
        'Well, of course, the fresh vegetables are outstanding.',
        'ก็ต้องผักสดๆ นี่แหละ อร่อยเยี่ยมมาก',
      ],
      ['B', "Sounds delicious. Let's go.", 'ฟังดูอร่อยเลย ไปกันเถอะ'],
    ],
  },
  {
    key: 'lst-graduate',
    title: 'After You Graduate',
    emoji: '🎓',
    lines: [
      ['A', 'Do you study?', 'คุณเรียนหนังสืออยู่ไหม'],
      [
        'B',
        'Yes, I study at the university.',
        'ใช่ค่ะ เรียนอยู่ที่มหาวิทยาลัย',
      ],
      ['A', 'Oh, what subject do you study?', 'อ๋อ เรียนวิชาอะไร'],
      ['B', 'I am studying marketing.', 'เรียนการตลาดค่ะ'],
      ['A', 'Okay. And when will you graduate?', 'โอเค แล้วจะเรียนจบเมื่อไหร่'],
      ['B', 'I will graduate next semester.', 'จะจบเทอมหน้าค่ะ'],
      [
        'A',
        "Okay. Will you continue to study for your master's degree?",
        'โอเค แล้วจะเรียนต่อปริญญาโทไหม',
      ],
      ['B', 'No, not yet.', 'ยังไม่ค่ะ ตอนนี้ยัง'],
      ['A', 'What will you do after you graduate?', 'จบแล้วจะทำอะไรต่อ'],
      [
        'B',
        "I'm not sure yet. It depends.",
        'ยังไม่แน่ใจค่ะ ขึ้นอยู่กับสถานการณ์',
      ],
      ['A', 'Depends on what?', 'ขึ้นอยู่กับอะไร'],
      [
        'B',
        'It depends on what kinds of job offers I get. Well, if I get a job that provides opportunity, I will take it.',
        'ขึ้นอยู่กับว่าจะได้งานแบบไหน ถ้าได้งานที่มีโอกาสก้าวหน้า ฉันก็จะรับค่ะ',
      ],
      [
        'A',
        'What other jobs have you applied for?',
        'สมัครงานที่ไหนไปบ้างแล้ว',
      ],
      [
        'B',
        "Oh, I've made many applications to all kinds of companies.",
        'สมัครไปหลายที่เลยค่ะ หลากหลายบริษัท',
      ],
      [
        'A',
        'Okay. What kinds of companies did you apply to?',
        'โอเค สมัครบริษัทประเภทไหนบ้าง',
      ],
      [
        'B',
        'Hotels, factories, import companies.',
        'โรงแรม โรงงาน บริษัทนำเข้า',
      ],
      [
        'A',
        'What if you get a job far away from home?',
        'ถ้าได้งานที่ไกลบ้านล่ะ',
      ],
      [
        'B',
        'I would rather stay close to my family.',
        'ฉันอยากอยู่ใกล้ครอบครัวมากกว่า',
      ],
      [
        'A',
        'What will you do if you cannot find a job?',
        'ถ้าหางานไม่ได้จะทำยังไง',
      ],
      [
        'B',
        "If I cannot find a job, I will stay in school and study for a master's degree.",
        'ถ้าหางานไม่ได้ ก็จะเรียนต่อปริญญาโทค่ะ',
      ],
      ['A', "A master's degree in what faculty?", 'ปริญญาโทสาขาอะไร'],
      [
        'B',
        "I'm not sure yet. I'll have to think about it.",
        'ยังไม่แน่ใจค่ะ ต้องคิดดูก่อน',
      ],
    ],
  },
  {
    key: 'lst-trip',
    title: 'Planning a Trip',
    emoji: '🏕️',
    lines: [
      [
        'A',
        "Let's get out of the city this weekend.",
        'สุดสัปดาห์นี้ออกไปนอกเมืองกันเถอะ',
      ],
      [
        'B',
        "That's a good idea. I'm getting sick of being here.",
        'ไอเดียดีนะ ฉันเบื่ออยู่ที่นี่แล้ว',
      ],
      ['A', 'Do you want to go to the beach?', 'อยากไปทะเลไหม'],
      [
        'B',
        "We always go to the beach. Let's do something different.",
        'เราไปทะเลบ่อยแล้ว ลองทำอย่างอื่นดูบ้างเถอะ',
      ],
      ['A', 'How about camping?', 'ไปตั้งแคมป์ดีไหม'],
      [
        'B',
        'Hm. Camping. That sounds terrific.',
        'อืม ตั้งแคมป์เหรอ ฟังดูเยี่ยมเลย',
      ],
      ['A', 'All my ideas are terrific.', 'ไอเดียของฉันเยี่ยมทุกอันแหละ'],
      ['B', 'Do you have a tent?', 'มีเต็นท์ไหม'],
      ['A', 'No. Do you?', 'ไม่มี แล้วเธอล่ะ'],
      [
        'B',
        'No, but I can borrow a large one from my friend.',
        'ไม่มีเหมือนกัน แต่ยืมของเพื่อนหลังใหญ่ได้',
      ],
      ['A', 'How about a sleeping bag?', 'แล้วถุงนอนล่ะ'],
      [
        'B',
        'Yes, I have a sleeping bag. Do you have one?',
        'มีถุงนอนอยู่ แล้วเธอมีไหม',
      ],
      ['A', "No, I don't.", 'ไม่มีเลย'],
      ['B', 'Do you want to share one with me?', 'อยากใช้ถุงนอนร่วมกับฉันไหม'],
      [
        'A',
        "No thanks. I'll buy a new sleeping bag. Do you think we should go far, far away?",
        'ไม่ล่ะ ขอบใจ ฉันจะซื้อถุงนอนใหม่เอง คิดว่าเราควรไปไกลๆ ไหม',
      ],
      ['B', 'How much time do you have?', 'มีเวลาแค่ไหน'],
      [
        'A',
        'I can leave Friday after work.',
        'ออกเดินทางได้หลังเลิกงานวันศุกร์',
      ],
      [
        'B',
        'I can leave Friday, too. When do you have to be back?',
        'ฉันก็ออกวันศุกร์ได้เหมือนกัน ต้องกลับตอนไหน',
      ],
      ['A', 'Well, I have to be back by Sunday.', 'ต้องกลับก่อนวันอาทิตย์'],
      [
        'B',
        "Okay, we'll be back by Sunday. What should we do while we're there?",
        'โอเค งั้นเรากลับวันอาทิตย์ แล้วตอนอยู่ที่นั่นจะทำอะไรกันดี',
      ],
      ['A', 'Do you want to go hiking?', 'อยากไปเดินป่าไหม'],
      [
        'B',
        "Hiking? Okay, but we shouldn't go far from the campground.",
        'เดินป่าเหรอ ได้ แต่ไม่ควรไปไกลจากที่ตั้งแคมป์นะ',
      ],
      [
        'A',
        'If we stay around the campground, will you bring the barbecue?',
        'ถ้าอยู่แถวๆ แคมป์ จะเอาเตาบาร์บีคิวมาไหม',
      ],
      [
        'B',
        'Of course. What is camping without a barbecue?',
        'แน่นอนอยู่แล้ว จะตั้งแคมป์ทั้งทีไม่มีบาร์บีคิวได้ยังไง',
      ],
      [
        'A',
        'Will you make your famous hamburgers?',
        'จะทำแฮมเบอร์เกอร์สูตรเด็ดของเธอไหม',
      ],
      ['B', "Sure thing. I'll make hamburgers.", 'ได้เลย ฉันจะทำแฮมเบอร์เกอร์'],
      ['A', 'Should we invite some friends?', 'ชวนเพื่อนไปด้วยกันดีไหม'],
      [
        'B',
        "Great idea. Let's invite all of our friends.",
        'ไอเดียเยี่ยม ชวนเพื่อนๆ ทุกคนไปเลย',
      ],
      ['A', 'This is going to be fun.', 'ต้องสนุกแน่ๆ เลย'],
      ['B', "I can't wait.", 'รอไม่ไหวแล้ว'],
    ],
  },
  {
    key: 'lst-hobbies',
    title: 'Hobbies',
    emoji: '📮',
    lines: [
      ['A', 'Do you have any hobbies?', 'มีงานอดิเรกไหม'],
      ['B', 'Yes, I have several.', 'มีหลายอย่างเลย'],
      [
        'A',
        'Really? Please tell me more about your hobbies.',
        'จริงเหรอ เล่าให้ฟังหน่อยสิ',
      ],
      ['B', 'Well, I do like to collect things.', 'ก็...ฉันชอบสะสมของ'],
      ['A', 'Really? What do you like to collect?', 'จริงเหรอ สะสมอะไร'],
      ['B', 'I like to collect stamps.', 'สะสมแสตมป์'],
      [
        'A',
        'Really? Where do you collect stamps from?',
        'จริงเหรอ ได้แสตมป์มาจากไหนบ้าง',
      ],
      [
        'B',
        'I collect stamps from all over the world.',
        'สะสมแสตมป์จากทั่วโลกเลย',
      ],
      ['A', 'Why do you do that?', 'ทำไมถึงชอบสะสมล่ะ'],
      [
        'B',
        'Because eventually I hope to have a stamp from every country.',
        'เพราะฉันหวังว่าสักวันจะมีแสตมป์จากทุกประเทศ',
      ],
      [
        'A',
        'Why do you want all of those stamps?',
        'ทำไมถึงอยากได้แสตมป์พวกนั้นทั้งหมด',
      ],
      [
        'B',
        "Well, I think it's because I won't be able to go to those countries myself.",
        'ก็เพราะฉันคงไม่มีโอกาสได้ไปประเทศเหล่านั้นด้วยตัวเอง',
      ],
      [
        'A',
        'Oh. What is another hobby of yours?',
        'อ้อ แล้วมีงานอดิเรกอื่นอีกไหม',
      ],
      ['B', 'I collect beer.', 'ฉันสะสมเบียร์'],
      ['A', 'Pardon me. You collect beer?', 'ขอโทษนะ สะสมเบียร์เหรอ'],
      [
        'B',
        'Well, actually, I collect beer cans.',
        'อันที่จริงคือสะสมกระป๋องเบียร์',
      ],
      [
        'A',
        "Okay. Where'd you get the cans from?",
        'โอเค แล้วได้กระป๋องมาจากไหน',
      ],
      ['B', 'From every place that I travel to.', 'จากทุกที่ที่ฉันไปเที่ยว'],
      ['A', 'Do you drink the beer?', 'แล้วดื่มเบียร์ด้วยไหม'],
      ['B', "Nah, I'm not a beer drinker.", 'เปล่า ฉันไม่ดื่มเบียร์'],
      [
        'A',
        'Oh, I see. What about you? What are your hobbies?',
        'อ๋อ เข้าใจแล้ว แล้วคุณล่ะ มีงานอดิเรกอะไรบ้าง',
      ],
      ['B', 'Well, I like to read a lot.', 'ฉันชอบอ่านหนังสือมาก'],
      ['A', 'Really? What do you read about?', 'จริงเหรอ อ่านเรื่องอะไร'],
      [
        'B',
        'I like to read about best sellers, and I like to read a lot about science, too.',
        'ชอบอ่านหนังสือขายดี แล้วก็ชอบอ่านเรื่องวิทยาศาสตร์ด้วย',
      ],
      ['A', 'What kind of science do you read about?', 'วิทยาศาสตร์แบบไหน'],
      [
        'B',
        'A variety of topics, but I especially like to read about nature and about electronics.',
        'หลายหัวข้อเลย แต่ที่ชอบเป็นพิเศษคือเรื่องธรรมชาติกับอิเล็กทรอนิกส์',
      ],
      [
        'A',
        'Fascinating. Why do you like to read so much?',
        'น่าสนใจมาก ทำไมถึงชอบอ่านหนังสือขนาดนั้น',
      ],
      [
        'B',
        'Well, I think it helps me exercise my brain.',
        'ฉันว่ามันช่วยฝึกสมองของฉัน',
      ],
      [
        'A',
        "Well, that's a good reason, if it doesn't make you too tired.",
        'เป็นเหตุผลที่ดีนะ ถ้าไม่ทำให้เหนื่อยเกินไป',
      ],
    ],
  },
  {
    key: 'lst-first-meet',
    title: 'The First Time to Meet',
    emoji: '🙋',
    lines: [
      ['Alex', 'Hey.', 'เฮ้'],
      [
        'Alex',
        "This is my friend Bob. He's from England.",
        'เฮ้ นี่เพื่อนฉัน บ็อบ เขามาจากอังกฤษ',
      ],
      ['Bob', 'Hey. Um, excuse me.', 'สวัสดีครับ เอ่อ ขอตัวก่อนนะครับ'],
      [
        'A',
        'Okay. Sit down, please. What city in England do you come from?',
        'เชิญนั่งก่อนค่ะ คุณมาจากเมืองไหนในอังกฤษ',
      ],
      ['Bob', 'I come from London.', 'ผมมาจากลอนดอนครับ'],
      ['A', 'Have you ever been there?', 'เคยไปที่นั่นไหมคะ'],
      [
        'Bob',
        "No, I've never been. I hope to go someday.",
        'ไม่เคยครับ หวังว่าสักวันจะได้ไป',
      ],
      [
        'A',
        'You can, if you have true desire. Have you been here a long time?',
        'ไปได้แน่นอนถ้าตั้งใจจริง แล้วคุณอยู่ที่นี่มานานหรือยังคะ',
      ],
      [
        'Bob',
        'I have been here for about 7 years. How about you?',
        'อยู่มาประมาณ 7 ปีแล้วครับ แล้วคุณล่ะ',
      ],
      ['A', "I've been here all my life.", 'ฉันอยู่ที่นี่มาตลอดชีวิตเลยค่ะ'],
      [
        'Bob',
        'Why have you stayed here such a long time?',
        'ทำไมถึงอยู่ที่นี่นานขนาดนี้ล่ะครับ',
      ],
      ['A', "I've stayed here for many reasons.", 'ก็มีหลายเหตุผลค่ะ'],
      [
        'Bob',
        'Stayed for many reasons. Are you married?',
        'หลายเหตุผลเลยเหรอครับ แล้วแต่งงานหรือยังครับ',
      ],
      ['A', 'Yes, I am.', 'แต่งแล้วค่ะ'],
      ['Bob', 'Is your wife beautiful?', 'ภรรยาสวยไหมครับ'],
      [
        'A',
        'Would you like to see a picture of my wife?',
        'อยากดูรูปภรรยาฉันไหมคะ',
      ],
      ['Bob', 'That would be nice.', 'ดีเลยครับ'],
      [
        'Bob',
        "Oh, she's very lovely. Is she from around here?",
        'โอ้ เธอสวยมากเลยครับ เธอเป็นคนแถวนี้หรือเปล่า',
      ],
      [
        'A',
        'Thank you. Yes, she is from here.',
        'ขอบคุณค่ะ ใช่ เธอเป็นคนที่นี่',
      ],
      ['Bob', 'Do you have any children?', 'มีลูกหรือยังคะ'],
      [
        'A',
        'No, no children yet, but certainly in the future.',
        'ยังไม่มีครับ แต่อนาคตต้องมีแน่นอน',
      ],
      ['Bob', 'Where do you work?', 'ทำงานที่ไหนคะ'],
      ['A', 'I work at the newspaper.', 'ผมทำงานที่หนังสือพิมพ์ครับ'],
      [
        'Bob',
        'Wow, the newspaper. What do you do there?',
        'ว้าว หนังสือพิมพ์เหรอ ทำหน้าที่อะไรที่นั่นคะ',
      ],
      ['A', 'I am a reporter.', 'ผมเป็นนักข่าวครับ'],
    ],
  },
  {
    key: 'lst-what-to-do',
    title: 'What Would You Like to Do?',
    emoji: '🎳',
    lines: [
      ['A', "I'm bored. Let's do something.", 'เบื่อจังเลย ไปทำอะไรกันเถอะ'],
      ['B', 'What do you want to do?', 'อยากทำอะไรล่ะ'],
      ['A', "I don't know. Well, anything is fine.", 'ไม่รู้สิ อะไรก็ได้'],
      ['B', "Let's go see a movie.", 'ไปดูหนังกันไหม'],
      [
        'A',
        'No, I went to see three movies this week.',
        'ไม่เอา สัปดาห์นี้ไปดูหนังมาสามเรื่องแล้ว',
      ],
      ['B', 'Three? Whoa. Why so many?', 'สามเรื่องเลยเหรอ ทำไมดูเยอะจัง'],
      ['A', 'Cuz I was bored all week.', 'ก็เบื่อทั้งอาทิตย์เลยนี่'],
      ['B', 'Well, you want to play some sports?', 'งั้นอยากไปเล่นกีฬาไหม'],
      ['A', "No, I don't want to play any sports.", 'ไม่ ไม่อยากเล่นกีฬาเลย'],
      ['B', 'Why not? Sports are fun.', 'ทำไมล่ะ กีฬาสนุกออก'],
      [
        'A',
        "Well, I don't want to run around and get all hot.",
        'ก็ไม่อยากวิ่งไปวิ่งมาจนตัวร้อนไปหมด',
      ],
      [
        'B',
        "Yeah, it's kind of hot. Um, how about shopping? You want to go shopping?",
        'ใช่ อากาศร้อนอยู่ด้วย งั้นไปช้อปปิ้งดีไหม',
      ],
      [
        'A',
        'I like shopping, but I have to watch my money until the end of the month.',
        'ชอบช้อปปิ้งนะ แต่ต้องประหยัดเงินไปจนถึงสิ้นเดือน',
      ],
      ['B', 'Well, we could go eat dinner.', 'งั้นไปกินมื้อเย็นกันดีไหม'],
      [
        'A',
        'Dinner is a good idea. Where would you like to eat?',
        'ไอเดียดี อยากกินที่ไหน',
      ],
      [
        'B',
        'I heard about this new Japanese restaurant down at the mall.',
        'ได้ยินมาว่ามีร้านอาหารญี่ปุ่นเปิดใหม่ที่ห้างนะ',
      ],
      ['A', 'Huh. Is it expensive?', 'อ๋อ แพงไหม'],
      [
        'B',
        "Uh, it's not too expensive, but it's not cheap.",
        'เอ่อ ไม่แพงมาก แต่ก็ไม่ถูก',
      ],
      [
        'A',
        "Okay, well that sounds good. And when we're finished, we can go window shopping.",
        'โอเค ฟังดูดี กินเสร็จแล้วไปเดินดูของกันก็ได้',
      ],
      [
        'B',
        'That sounds like fun. Oh, and if we want, we can play some indoor air-conditioned sports.',
        'ฟังดูสนุกดี แล้วถ้าอยากเล่น เราไปเล่นกีฬาในร่มที่มีแอร์ก็ได้นะ',
      ],
      [
        'A',
        'Really? Which sport has air conditioning?',
        'จริงเหรอ กีฬาอะไรมีแอร์',
      ],
      ['B', 'Bowling.', 'โบว์ลิ่งไง'],
      [
        'A',
        "Bowling. Right. Great. Let's go.",
        'โบว์ลิ่งเหรอ เยี่ยมเลย ไปกันเลย',
      ],
      ['B', 'Okay.', 'โอเค'],
    ],
  },
  {
    key: 'lst-coffee-tea',
    title: 'Coffee or Tea?',
    emoji: '☕',
    lines: [
      ['A', 'Excuse me.', 'ขอโทษนะครับ'],
      ['B', 'Yes?', 'คะ'],
      [
        'A',
        "Would you like some coffee or tea while you're waiting?",
        'ระหว่างรอ รับกาแฟหรือชาไหมครับ',
      ],
      ['B', 'Yes, that would be lovely. Thank you.', 'ค่ะ ดีเลย ขอบคุณค่ะ'],
      ['A', 'Which would you prefer, coffee or tea?', 'รับกาแฟหรือชาดีครับ'],
      ['B', 'Oh, coffee, please.', 'เอากาแฟค่ะ'],
      ['A', 'And how would you like your coffee?', 'รับกาแฟแบบไหนครับ'],
      ['B', 'Two sugars and some milk.', 'น้ำตาลสองช้อนกับนมค่ะ'],
      [
        'A',
        "Okay. I'm sorry, but we don't have any milk. Is coffee creamer all right?",
        'ได้ครับ แต่ขอโทษด้วยเราไม่มีนมสด ใช้ครีมเทียมแทนได้ไหมครับ',
      ],
      ['B', 'Coffee creamer is fine.', 'ครีมเทียมก็ได้ค่ะ'],
      [
        'A',
        "Okay. It's one coffee. I'll be right back.",
        'ได้ครับ กาแฟหนึ่งแก้ว เดี๋ยวมาครับ',
      ],
      ['B', 'Oh, excuse me.', 'อ้อ ขอโทษนะคะ'],
      ['A', 'Yes?', 'ครับ'],
      ['B', 'Do you use fresh ground coffee?', 'ใช้กาแฟบดสดหรือเปล่าคะ'],
      [
        'A',
        'No, we don’t. We use instant coffee. Nescafé, I think.',
        'ไม่ครับ เราใช้กาแฟสำเร็จรูป เนสกาแฟน่าจะใช่ครับ',
      ],
      [
        'B',
        'I see. On second thought, can I have some tea, please?',
        'อ๋อ เข้าใจแล้ว งั้นคิดอีกที ขอเป็นชาแทนได้ไหมคะ',
      ],
      [
        'A',
        'Yes, tea. What kind of tea would you like?',
        'ได้ครับ ชา รับชาแบบไหนดีครับ',
      ],
      ['B', 'What kind of tea do you have?', 'มีชาแบบไหนบ้างคะ'],
      [
        'A',
        'We have Earl Grey, green tea, or Lipton.',
        'มีเอิร์ลเกรย์ ชาเขียว หรือลิปตันครับ',
      ],
      ['B', 'Green tea is Chinese, is it not?', 'ชาเขียวเป็นชาจีนใช่ไหมคะ'],
      ['A', 'Yes.', 'ใช่ครับ'],
      ['B', "I'll try the green tea.", 'งั้นขอลองชาเขียวค่ะ'],
      [
        'A',
        'Okay. Would you like that iced or hot?',
        'ได้ครับ รับแบบเย็นหรือร้อนดีครับ',
      ],
      ['B', 'Iced. Iced sounds nice.', 'เย็นค่ะ แบบเย็นน่าจะดีกว่า'],
      [
        'A',
        'Okay. Too sweet? One iced green tea. Would you like a cookie?',
        'ได้ครับ หวานน้อยไหมครับ ชาเขียวเย็นหนึ่งแก้ว รับคุกกี้ด้วยไหมครับ',
      ],
      ['B', 'Cookie? No, no thank you.', 'คุกกี้เหรอ ไม่ค่ะ ไม่เป็นไร'],
      ['A', 'Okay. How about an apple?', 'ได้ครับ แล้วแอปเปิลล่ะครับ'],
      ['B', "Yes, I'd like an apple.", 'ค่ะ เอาแอปเปิลด้วย'],
      [
        'A',
        "One iced green tea and one apple. I'll be right back.",
        'ชาเขียวเย็นหนึ่งแก้วกับแอปเปิลหนึ่งลูก เดี๋ยวมาครับ',
      ],
    ],
  },
  {
    key: 'lst-abroad',
    title: 'Have You Ever Traveled Abroad?',
    emoji: '✈️',
    lines: [
      ['A', 'Have you ever traveled abroad?', 'เคยเดินทางไปต่างประเทศไหม'],
      [
        'B',
        'Yes, I have. In fact, I was born abroad.',
        'เคยสิ ที่จริงฉันเกิดที่ต่างประเทศด้วย',
      ],
      [
        'A',
        'You were born abroad? Where were you born?',
        'เกิดที่ต่างประเทศเหรอ เกิดที่ไหน',
      ],
      ['B', 'I was born in Japan.', 'เกิดที่ญี่ปุ่น'],
      ['A', "You're joking.", 'ล้อเล่นน่า'],
      [
        'B',
        "No, I'm not joking. It's true. I was made in Japan.",
        'ไม่ได้ล้อเล่นเลย จริงๆ นะ ฉัน "ผลิต" ที่ญี่ปุ่น',
      ],
      ['A', 'Do you speak Japanese?', 'พูดภาษาญี่ปุ่นได้ไหม'],
      [
        'B',
        "No, I don't. I left when I was young.",
        'ไม่ได้เลย ฉันย้ายออกมาตอนยังเด็กมาก',
      ],
      ['A', 'How old were you?', 'ตอนนั้นอายุเท่าไหร่'],
      ['B', 'I was nine.', 'เก้า'],
      [
        'A',
        'You were 9 years old and you do not speak Japanese?',
        'อายุ 9 ขวบแล้วพูดญี่ปุ่นไม่ได้เลยเหรอ',
      ],
      ['B', 'No, I was 9 months old.', 'เปล่า ฉันอายุ 9 เดือนต่างหาก'],
      [
        'A',
        'Oh. What other countries have you been to?',
        'อ๋อ แล้วเคยไปประเทศอื่นอีกไหม',
      ],
      ['B', 'Well, I went to Mexico.', 'เคยไปเม็กซิโก'],
      ['A', 'How was that?', 'เป็นยังไงบ้าง'],
      ['B', 'It was great.', 'เยี่ยมมากเลย'],
      ['A', 'What did you like the best?', 'ชอบอะไรที่สุด'],
      ['B', 'Well, the ruins were interesting.', 'ซากโบราณสถานน่าสนใจมาก'],
      ['A', 'Anything else you liked?', 'มีอะไรที่ชอบอีกไหม'],
      ['B', 'The beaches were nice.', 'ชายหาดก็สวยดี'],
      ['A', 'Where else have you been?', 'เคยไปที่ไหนอีก'],
      ['B', 'I lived in London for 1 year.', 'เคยอยู่ลอนดอนหนึ่งปี'],
      ['A', 'Really? How was that?', 'จริงเหรอ เป็นยังไงบ้าง'],
      ['B', 'I was only 8 years old.', 'ตอนนั้นอายุแค่ 8 ขวบเอง'],
      [
        'A',
        'You were 8 years old. What were you doing there?',
        'อายุ 8 ขวบเหรอ ไปทำอะไรที่นั่น',
      ],
      [
        'B',
        'I went there with my mother. She was working there.',
        'ไปกับแม่ เพราะแม่ไปทำงานที่นั่น',
      ],
      [
        'A',
        "Of all the countries you've been to, which is your favorite country?",
        'ในบรรดาประเทศที่เคยไปทั้งหมด ชอบประเทศไหนที่สุด',
      ],
      ['B', 'Thailand.', 'ประเทศไทย'],
      ['A', 'Why do you like Thailand?', 'ทำไมถึงชอบเมืองไทย'],
      [
        'B',
        'I love Thailand because the food is delicious and the people are very friendly.',
        'ฉันรักเมืองไทยเพราะอาหารอร่อยและผู้คนเป็นมิตรมาก',
      ],
    ],
  },
  {
    key: 'lst-shopping',
    title: 'Shopping',
    emoji: '🛒',
    lines: [
      ['A', 'Hi, can I help you?', 'สวัสดีค่ะ มีอะไรให้ช่วยไหมคะ'],
      [
        'B',
        "Yes, I'd like to buy a washing machine.",
        'ครับ ผมอยากซื้อเครื่องซักผ้า',
      ],
      ['A', 'Okay, which brand would you like?', 'ได้ค่ะ อยากได้ยี่ห้อไหนคะ'],
      [
        'B',
        "I don't care so much about brands.",
        'ผมไม่ค่อยซีเรียสเรื่องยี่ห้อเท่าไหร่ครับ',
      ],
      ['A', 'So, what are you looking for?', 'แล้วคุณกำลังมองหาแบบไหนคะ'],
      [
        'B',
        "I'm looking for good price and good functions.",
        'ผมอยากได้ราคาดีและฟังก์ชันดีครับ',
      ],
      [
        'A',
        'Okay. Function and price are important to you.',
        'เข้าใจแล้วค่ะ ฟังก์ชันกับราคาสำคัญกับคุณ',
      ],
      ['B', "That's right.", 'ใช่ครับ'],
      [
        'A',
        'Okay. First, may I ask you what size washer do you need?',
        'ได้ค่ะ ก่อนอื่นขอถามว่าต้องการเครื่องขนาดไหนคะ',
      ],
      [
        'B',
        'What do you mean by what size washer?',
        'หมายถึงขนาดยังไงเหรอครับ',
      ],
      [
        'A',
        'Well, a small size is 4 kilos. A large size is 8 kilos.',
        'ก็คือขนาดเล็กจะรับผ้าได้ 4 กิโล ขนาดใหญ่รับได้ 8 กิโลค่ะ',
      ],
      ['B', 'Do you have a medium size?', 'มีขนาดกลางไหมครับ'],
      ['A', 'Sure. Medium size is 6 kilos.', 'มีสิคะ ขนาดกลางรับได้ 6 กิโล'],
      [
        'B',
        'Okay. I think I want a medium size.',
        'โอเค ผมว่าเอาขนาดกลางแล้วกันครับ',
      ],
      [
        'A',
        'All right. And do you want a one-bin or a two-bin washer?',
        'ได้ค่ะ แล้วอยากได้แบบถังเดียวหรือสองถังคะ',
      ],
      [
        'B',
        "What's the difference between one-bin and two-bin?",
        'ถังเดียวกับสองถังต่างกันยังไงครับ',
      ],
      [
        'A',
        'Well, with a two-bin washer, you have to move the clothes to the spinner yourself. And the one-bin does it automatically. It’s a two-in-one spin bin.',
        'แบบสองถังคือต้องยกผ้าไปใส่ถังปั่นเองค่ะ ส่วนถังเดียวจะทำอัตโนมัติทั้งซักทั้งปั่นในถังเดียว',
      ],
      [
        'B',
        'Oh, I understand. Um, which one cleans better?',
        'อ๋อ เข้าใจแล้ว แล้วแบบไหนซักสะอาดกว่ากันครับ',
      ],
      ['A', 'Uh, they clean the same.', 'สะอาดพอๆ กันค่ะ'],
      [
        'B',
        'Really? And do the washers cost the same?',
        'จริงเหรอครับ แล้วราคาเท่ากันไหม',
      ],
      [
        'A',
        'Well, the one-bin washer is more expensive, but it’s simple to use.',
        'แบบถังเดียวจะแพงกว่านิดหน่อยค่ะ แต่ใช้งานง่ายกว่า',
      ],
      [
        'B',
        "Simple is important. Well, I think I'd like the one-bin washer.",
        'ความง่ายสำคัญนะครับ งั้นผมเอาแบบถังเดียวแล้วกัน',
      ],
      [
        'A',
        'You know, if you like things simple and easy, may I suggest to you the fuzzy logic function?',
        'ถ้าคุณชอบอะไรง่ายๆ ขอแนะนำฟังก์ชันฟัซซี่ลอจิกด้วยค่ะ',
      ],
      ['B', 'What is the fuzzy logic?', 'ฟัซซี่ลอจิกคืออะไรครับ'],
      [
        'A',
        'Oh, fuzzy logic is a special function. It makes using the washer easier.',
        'เป็นฟังก์ชันพิเศษที่ทำให้ใช้เครื่องซักผ้าง่ายขึ้นค่ะ',
      ],
      ['B', 'How does the function work?', 'ทำงานยังไงครับ'],
      [
        'A',
        'Well, you put in your clothes, you put in the soap, and the washer does the rest.',
        'ก็แค่ใส่ผ้า ใส่ผงซักฟอก แล้วเครื่องจะจัดการที่เหลือให้เองค่ะ',
      ],
      [
        'B',
        "Sounds perfect. This is exactly the kind of washing machine I've been looking for.",
        'ฟังดูเยี่ยมเลยครับ นี่แหละเครื่องซักผ้าที่ผมตามหาอยู่พอดี',
      ],
    ],
  },
  {
    key: 'lst-robbed',
    title: 'My House Was Robbed',
    emoji: '🚨',
    lines: [
      [
        'A',
        'Hey, did you have a good weekend?',
        'เฮ้ วันหยุดที่ผ่านมาเป็นยังไงบ้าง',
      ],
      ['B', 'No, not really.', 'ก็ไม่ค่อยดีเท่าไหร่'],
      [
        'A',
        "Oh, I'm sorry to hear that. What happened during the weekend?",
        'โอ้ เสียใจด้วยนะ เกิดอะไรขึ้นเหรอ',
      ],
      ['B', 'My house was robbed.', 'บ้านฉันโดนขโมยขึ้น'],
      [
        'A',
        'Your house was robbed? What do you mean?',
        'บ้านโดนขโมยเหรอ หมายความว่ายังไง',
      ],
      [
        'B',
        'I mean, I was not there and someone came and took everything from my house.',
        'ก็คือตอนนั้นฉันไม่อยู่บ้าน แล้วมีคนเข้ามาขโมยของไปหมดเลย',
      ],
      [
        'A',
        'Someone took everything from your house? That’s terrible.',
        'ขโมยของไปหมดเลยเหรอ แย่มากเลยนะ',
      ],
      ['B', 'Terrible. Yes, I think so.', 'ใช่ แย่มากจริงๆ'],
      ['A', 'Wow. Did they break anything?', 'โห แล้วมันพังอะไรไหม'],
      ['B', 'Yes, they broke a window to get in.', 'ใช่ มันทุบหน้าต่างเข้ามา'],
      ['A', 'Did they take your television?', 'เอาทีวีไปด้วยไหม'],
      ['B', 'Yes, they took the television.', 'ใช่ เอาทีวีไปด้วย'],
      ['A', 'Oh, did they take the DVD player?', 'แล้วเครื่องเล่นดีวีดีล่ะ'],
      ['B', 'Yes, they took the DVD player.', 'เอาไปด้วยเหมือนกัน'],
      ['A', 'Did they take your laptop?', 'เอาแล็ปท็อปไปไหม'],
      ['B', 'Yes, they took the laptop.', 'เอาไปด้วย'],
      ['A', 'Did they take your clothes?', 'แล้วเสื้อผ้าล่ะ'],
      ['B', 'No, they did not take my clothes.', 'ไม่ ไม่ได้เอาเสื้อผ้าไป'],
      [
        'A',
        "Oh, that's because your clothes are old and out of fashion.",
        'อ๋อ นั่นเพราะเสื้อผ้าของเธอเก่าและล้าสมัยไงล่ะ',
      ],
      [
        'B',
        'Do you really think my clothes are old-fashioned?',
        'เธอคิดจริงๆ เหรอว่าเสื้อผ้าฉันล้าสมัย',
      ],
      ['A', "Yes, I do. They're very old.", 'ใช่ คิดจริงๆ มันเก่ามากเลย'],
      [
        'B',
        'Oh, this is terrible. First, my house gets robbed, and now my clothes are old-fashioned.',
        'โอ้ แย่จังเลย ก่อนก็โดนขโมยขึ้นบ้าน ตอนนี้ยังมาบอกว่าเสื้อผ้าล้าสมัยอีก',
      ],
      [
        'A',
        'Did you tell the police that your house was robbed?',
        'แจ้งตำรวจหรือยังว่าบ้านโดนขโมย',
      ],
      ['B', 'Yes, I told the police.', 'แจ้งแล้ว'],
      ['A', 'What did they say?', 'ตำรวจว่ายังไงบ้าง'],
      [
        'B',
        "They didn't say much. They just took a report.",
        'ก็ไม่ได้พูดอะไรมาก แค่จดบันทึกไว้เฉยๆ',
      ],
    ],
  },
  {
    key: 'lst-phone-info',
    title: 'Asking Information on the Phone',
    emoji: '📞',
    lines: [
      ['Alex', 'Hello.', 'ฮัลโหล'],
      ['Alex', 'Hi. Is this Tina?', 'สวัสดีครับ นี่ทีน่าใช่ไหมครับ'],
      ['Tina', 'Yes, it is. Who is this?', 'ใช่ค่ะ นี่ใครคะ'],
      [
        'Alex',
        'This is Alex. Do you remember me?',
        'ผมอเล็กซ์เองครับ จำผมได้ไหม',
      ],
      ['Tina', 'I’m sorry. I do not remember you.', 'ขอโทษนะคะ จำไม่ได้เลย'],
      [
        'Alex',
        'Um, did you come into the CS Computer shop today?',
        'เอ่อ คุณเคยแวะเข้าร้าน CS Computer ไหมครับ',
      ],
      [
        'Tina',
        'I went to many shops today. Where is yours?',
        'วันนี้ฉันไปหลายร้านเลย ร้านของคุณอยู่ที่ไหนคะ',
      ],
      [
        'Alex',
        'Our shop is located at the Galaxy Mall.',
        'ร้านของเราอยู่ที่แกแล็กซี่มอลล์ครับ',
      ],
      ['Tina', 'Which floor is your shop on?', 'อยู่ชั้นไหนคะ'],
      ['Alex', 'Uh, CS Computer is on the third floor.', 'อยู่ชั้นสามครับ'],
      [
        'Tina',
        'Oh, yes. I think I remember now. What is your name again?',
        'อ๋อ นึกออกแล้วค่ะ คุณชื่ออะไรนะคะ',
      ],
      [
        'Alex',
        'My name is Alex Willis of CS Computer.',
        'ผมชื่ออเล็กซ์ วิลลิส จากร้าน CS Computer ครับ',
      ],
      [
        'Tina',
        'Oh, I remember you now. You were the tall person, very handsome.',
        'อ๋อ นึกออกแล้วค่ะ คุณคือคนสูงๆ หน้าตาหล่อคนนั้นใช่ไหม',
      ],
      [
        'Alex',
        'Yes, that’s right. You have a good memory, Tina.',
        'ใช่ครับ คุณความจำดีจังเลยทีน่า',
      ],
      [
        'Tina',
        'So what can I do for you, Mr. Willis?',
        'แล้วมีอะไรให้ช่วยคะ คุณวิลลิส',
      ],
      [
        'Alex',
        'Do you remember coming into our shop and asking about a catalog for computer games?',
        'จำได้ไหมครับที่เคยมาที่ร้านแล้วถามหาแคตตาล็อกเกมคอมพิวเตอร์',
      ],
      [
        'Tina',
        'Yes, I remember asking for the catalog. You could not find it.',
        'จำได้ค่ะ ฉันถามหาแคตตาล็อก แต่ตอนนั้นคุณหาไม่เจอ',
      ],
      [
        'Alex',
        'Right. I couldn’t find it. But you have it now.',
        'ใช่ครับ ตอนนั้นผมหาไม่เจอ แต่ตอนนี้มีแล้ว',
      ],
      ['Tina', 'Yes, I have the catalog.', 'ใช่ครับ ผมมีแคตตาล็อกแล้ว'],
      [
        'Alex',
        'Great. Would you like for me to keep it here at the shop for you?',
        'เยี่ยมเลยค่ะ อยากให้ฉันเก็บไว้ที่ร้านให้ไหมคะ',
      ],
      [
        'Tina',
        'No, I’m not free to go down there anytime soon.',
        'ไม่ต้องครับ ผมคงไม่มีเวลาไปที่นั่นเร็วๆ นี้',
      ],
      [
        'Alex',
        'Well, since you cannot come to the shop, can I send you the catalog?',
        'ถ้างั้น เนื่องจากคุณมาที่ร้านไม่ได้ ให้ฉันส่งแคตตาล็อกไปให้ดีไหมคะ',
      ],
      ['Tina', 'That would be wonderful.', 'ดีเลยครับ'],
      [
        'Alex',
        'Okay. May I have your address, please?',
        'ได้ค่ะ ขอที่อยู่หน่อยได้ไหมคะ',
      ],
      [
        'Tina',
        'It’s 237 T Street, Sacramento, California, 95610.',
        'เลขที่ 237 ถนนที ซาคราเมนโต แคลิฟอร์เนีย 95610 ครับ',
      ],
      [
        'Alex',
        'Okay. Was that 2703 T Street?',
        'ได้ค่ะ ขอตรวจสอบนะคะ คือ 2703 ถนนทีใช่ไหมคะ',
      ],
      ['Tina', 'No, that’s 2307 T Street.', 'ไม่ใช่ครับ คือ 2307 ถนนที'],
      [
        'Alex',
        'Okay, I have your address and I’ll send it to you today.',
        'ได้ค่ะ ได้ที่อยู่แล้ว จะส่งให้วันนี้เลยค่ะ',
      ],
      ['Tina', 'Great. Thanks.', 'เยี่ยมเลยครับ ขอบคุณ'],
      ['Alex', 'My pleasure, Mr. Willis.', 'ยินดีค่ะ คุณวิลลิส'],
      [
        'Tina',
        'Yes. I often have questions about computers and games.',
        'ครับ ผมมักมีคำถามเกี่ยวกับคอมพิวเตอร์และเกมอยู่บ่อยๆ',
      ],
      [
        'Alex',
        'Well, you can ask me anything. It’s my business.',
        'ถามได้เลยค่ะ นี่เป็นธุรกิจของฉันเอง',
      ],
      [
        'Tina',
        'Thanks for that. May I have your phone number?',
        'ขอบคุณครับ ขอเบอร์โทรของคุณได้ไหมครับ',
      ],
      [
        'Alex',
        'Sure. It’s 018-675-309. Call me anytime if you have a question.',
        'ได้ค่ะ เบอร์ 018-675-309 มีคำถามโทรมาได้ตลอดเลยค่ะ',
      ],
      ['Tina', 'Thanks a lot.', 'ขอบคุณมากครับ'],
      ['Alex', 'My pleasure.', 'ยินดีค่ะ'],
      ['Tina', 'Goodbye.', 'ลาก่อนครับ'],
      ['Alex', 'Bye-bye.', 'บายค่ะ'],
    ],
  },
  {
    key: 'lst-headache',
    title: 'Why Do You Have a Headache?',
    emoji: '🤕',
    lines: [
      ['A', "Honey, I'm home.", 'ที่รัก ฉันกลับมาแล้ว'],
      ['B', 'How are you?', 'เป็นไงบ้าง'],
      ['A', "I'm terrible. I have a headache.", 'แย่มากเลย ปวดหัวจัง'],
      [
        'B',
        "I'm so sad to hear that. What gives you a headache?",
        'เสียใจด้วยนะ อะไรทำให้ปวดหัวล่ะ',
      ],
      ['A', 'There are so many reasons.', 'มีหลายเหตุผลเลย'],
      [
        'B',
        "Maybe you'll feel better if you tell me.",
        'ลองเล่าให้ฟังดูสิ อาจจะรู้สึกดีขึ้น',
      ],
      [
        'A',
        'Well, work is my biggest headache.',
        'ก็...งานนี่แหละที่ปวดหัวที่สุด',
      ],
      ['B', 'What is wrong at work?', 'ที่ทำงานมีปัญหาอะไร'],
      [
        'A',
        'It’s my boss. He always scolds me.',
        'เป็นเพราะเจ้านาย เขาดุฉันตลอดเลย',
      ],
      ['B', 'Why does your boss scold you?', 'ทำไมเจ้านายถึงดุล่ะ'],
      [
        'A',
        "He says I'm lazy and I take too many breaks.",
        'เขาบอกว่าฉันขี้เกียจและพักเบรกบ่อยเกินไป',
      ],
      ['B', 'Well, do you take too many breaks?', 'แล้วพักบ่อยเกินไปจริงไหม'],
      ['A', "I don't think so.", 'ไม่คิดงั้นนะ'],
      [
        'B',
        "Well, why don't you ignore your boss?",
        'ทำไมไม่เมินเจ้านายไปเลยล่ะ',
      ],
      [
        'A',
        "I can't ignore him. He's my boss.",
        'เมินไม่ได้หรอก เขาเป็นเจ้านายฉันนะ',
      ],
      [
        'B',
        "That's too bad. What else gives you a headache?",
        'แย่จังเลย แล้วมีอะไรอีกที่ทำให้ปวดหัว',
      ],
      [
        'A',
        'What else gives me a headache? My co-workers. My co-workers give me a headache.',
        'อะไรอีกเหรอ เพื่อนร่วมงานไง เพื่อนร่วมงานทำให้ฉันปวดหัว',
      ],
      [
        'B',
        'Why do your co-workers give you a headache?',
        'ทำไมเพื่อนร่วมงานถึงทำให้ปวดหัวล่ะ',
      ],
      ['A', "Because they're always gossiping.", 'เพราะพวกเขาชอบนินทากันตลอด'],
      ['B', 'Do they gossip about you?', 'นินทาเรื่องเธอด้วยหรือเปล่า'],
      ['A', 'Probably, but not to my face.', 'คงจะใช่ แต่ก็ไม่ได้พูดต่อหน้า'],
      [
        'B',
        "That's too bad. What else gives you a headache?",
        'แย่จัง แล้วมีอะไรอีกไหม',
      ],
      [
        'A',
        'Driving. Driving gives me a headache.',
        'การขับรถ การขับรถก็ทำให้ปวดหัวเหมือนกัน',
      ],
      [
        'B',
        'Why does driving give you a headache?',
        'ทำไมขับรถถึงทำให้ปวดหัวล่ะ',
      ],
      [
        'A',
        "Well, there's always traffic jams and there's no place to park.",
        'ก็รถติดตลอด แล้วก็หาที่จอดรถไม่ได้เลย',
      ],
      ['B', "Why don't you take a bus to work?", 'ทำไมไม่นั่งรถเมล์ไปทำงานล่ะ'],
      [
        'A',
        "Take a bus to work? It's too crowded and there's never a seat.",
        'นั่งรถเมล์เหรอ มันแน่นมากและไม่เคยมีที่นั่งเลย',
      ],
      [
        'B',
        "That's too bad. What can you do to get rid of your headache?",
        'แย่จัง แล้วทำยังไงถึงจะหายปวดหัวได้',
      ],
      [
        'A',
        'Easy. I come home and I see you.',
        'ง่ายนิดเดียว แค่กลับบ้านมาเจอเธอก็หายแล้ว',
      ],
    ],
  },
  {
    key: 'lst-party',
    title: 'What Should We Get for the Party?',
    emoji: '🎉',
    lines: [
      [
        'A',
        'Are you excited to go to the party?',
        'ตื่นเต้นที่จะไปงานปาร์ตี้ไหม',
      ],
      ['B', 'Yes, I am very excited about the party.', 'ใช่ ตื่นเต้นมากเลย'],
      [
        'A',
        'Do you think we should bring something with us?',
        'คิดว่าเราควรเอาอะไรไปด้วยไหม',
      ],
      [
        'B',
        'Yes, I think we should bring a gift or something.',
        'คิดว่าควรเอาของขวัญหรืออะไรสักอย่างไปด้วย',
      ],
      ['A', 'What would be good to bring?', 'เอาอะไรไปดีล่ะ'],
      ['B', 'What about bringing flowers?', 'เอาดอกไม้ไปดีไหม'],
      [
        'A',
        'But the flower shop is so far away. Can you think of something else?',
        'แต่ร้านดอกไม้ไกลจังเลย คิดอย่างอื่นได้ไหม',
      ],
      ['B', 'What if we bring some chips?', 'เอามันฝรั่งทอดไปดีไหม'],
      [
        'A',
        'Someone else will be bringing chips. Can you think of something else?',
        'มีคนอื่นเอามันฝรั่งทอดไปแล้ว คิดอย่างอื่นได้อีกไหม',
      ],
      ['B', 'What about bringing food?', 'เอาอาหารไปดีไหม'],
      [
        'A',
        "Well, we don't have to bring food because there's going to be a buffet at the party.",
        'ไม่ต้องเอาอาหารไปหรอก เพราะงานนี้มีบุฟเฟ่ต์อยู่แล้ว',
      ],
      [
        'B',
        'What about bringing my music CD collection?',
        'เอาแผ่นซีดีเพลงที่สะสมไว้ไปดีไหม',
      ],
      [
        'A',
        "Bringing your music CD collection is a good idea, but they're going to have a DJ at the party.",
        'ไอเดียดีนะ แต่งานนี้มีดีเจอยู่แล้ว',
      ],
      ['B', 'What about bringing some playing cards?', 'เอาไพ่ไปเล่นดีไหม'],
      [
        'A',
        "You don't have to bring playing cards because there's going to be a mini casino at the party.",
        'ไม่ต้องเอาไพ่ไปหรอก เพราะงานนี้มีคาสิโนจำลองด้วย',
      ],
      [
        'B',
        "Really? There's going to be a mini casino at the party?",
        'จริงเหรอ มีคาสิโนจำลองด้วยเหรอ',
      ],
      [
        'A',
        "Really. It's true. I'm not kidding. Can you think of something else?",
        'จริงสิ ไม่ได้ล้อเล่นเลย คิดอย่างอื่นได้อีกไหม',
      ],
      [
        'B',
        "There's only one thing the party does not have.",
        'มีอย่างเดียวที่งานนี้ยังไม่มี',
      ],
      ['A', "What's that?", 'อะไรเหรอ'],
      [
        'B',
        'The party does not have us. Let’s just bring ourselves.',
        'งานนี้ยังไม่มีเราไง แค่เอาตัวเราไปก็พอแล้ว',
      ],
      ['A', 'Yeah!', 'ใช่เลย!'],
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
      displayOrder: 1,
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

    // Replace all lines for this unit so re-seeding stays a clean 1:1 mirror of the source.
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
    `Listening seed done: units=${unitsUpserted}, lines=${linesInserted}`,
  );
  await dataSource.destroy();
}

main().catch((err) => {
  console.error('Listening seed failed:', err);
  process.exit(1);
});
