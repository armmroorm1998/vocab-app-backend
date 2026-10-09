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

// Lesson 4 — "Easy English for Beginners — English Conversation 4"
// https://www.youtube.com/watch?v=0mcMaZPsOhI
// Unlike Lessons 1-3, this video is a retail-English course made of 10
// spoken "Unit N" segments (each with 2-3 self-contained customer/clerk
// scenes) plus a closing grammar bonus. Start seconds are read from the
// auto-caption transcript's own timestamps at (or immediately after) the
// point where each "Unit N" marker is spoken.

const LESSON_KEY = 'lesson-4';
const LESSON_TITLE = 'Lesson 4: English Conversation 4';
const LESSON_EMOJI = '🛍️';

const VIDEO_ID = '0mcMaZPsOhI';

const UNIT_START_SECONDS = [
  2, 140, 360, 590, 850, 1086, 1281, 1438, 1655, 1952, 2065,
];
// Approximate end of the video, after the closing grammar bonus.
const VIDEO_END_SECONDS = 2300;

type SeedLine = [speaker: string, en: string, th: string];

type SeedUnit = {
  key: string;
  title: string;
  emoji: string;
  lines: SeedLine[];
};

const UNITS: SeedUnit[] = [
  {
    key: 'lst4-unit1-greeting',
    title: 'Unit 1: Greeting Customers',
    emoji: '👋',
    lines: [
      [
        'Clerk',
        'Good afternoon. Has anyone helped you yet?',
        'สวัสดีตอนบ่ายค่ะ มีคนช่วยดูแลลูกค้าหรือยังคะ',
      ],
      ['Customer', 'No, not yet.', 'ยังเลยครับ'],
      ['Clerk', 'What could I do for you?', 'ให้ดิฉันช่วยอะไรได้บ้างคะ'],
      ['Customer', "I'm looking for some socks.", 'ผมกำลังหาถุงเท้าอยู่ครับ'],
      ['Clerk', 'What kind of socks?', 'ถุงเท้าแบบไหนคะ'],
      [
        'Customer',
        "Well, I'd like to buy some warm winter socks.",
        'ผมอยากได้ถุงเท้าหนาๆ ใส่หน้าหนาวครับ',
      ],
      [
        'Clerk',
        "I'm sorry, all we have is thin dress socks.",
        'ขอโทษด้วยค่ะ ที่ร้านเรามีแต่ถุงเท้าบางๆ แบบใส่กับชุดทำงาน',
      ],
      [
        'Customer',
        'Do you know where I can buy winter socks?',
        'พอจะรู้ไหมครับว่าผมจะไปซื้อถุงเท้าหน้าหนาวได้ที่ไหน',
      ],
      [
        'Clerk',
        "Yes, there's an outdoor clothing store located on the third level.",
        'ทราบค่ะ มีร้านขายเสื้อผ้ากิจกรรมกลางแจ้งอยู่ที่ชั้นสามค่ะ',
      ],
      [
        'Customer',
        "Oh, okay, I'll try there. Thanks for your help.",
        'อ๋อ โอเคครับ ผมจะลองไปดูที่นั่น ขอบคุณที่ช่วยนะครับ',
      ],
      ['Clerk', "You're welcome.", 'ยินดีค่ะ'],
      ['Clerk', 'Hello.', 'สวัสดีค่ะ'],
      ['Customer', 'Hi.', 'สวัสดีครับ'],
      ['Clerk', 'Can I help you find something?', 'ให้ดิฉันช่วยหาอะไรไหมคะ'],
      ['Customer', "Sure, I'm looking for a tie.", 'ครับ ผมกำลังหาเนคไทอยู่'],
      [
        'Clerk',
        'Oh, all of our ties are in the middle aisle.',
        'อ๋อ เนคไทของเราอยู่ที่ทางเดินตรงกลางค่ะ',
      ],
      ['Customer', 'Thank you.', 'ขอบคุณครับ'],
      ['Clerk', "You're welcome.", 'ยินดีค่ะ'],
      [
        'Customer',
        'Oh, by the way, are any of your ties on sale?',
        'อ้อ ถามหน่อยครับ เนคไทลดราคาบ้างไหม',
      ],
      [
        'Clerk',
        'Yes, all of our silk ties are on sale today.',
        'มีค่ะ เนคไทผ้าไหมทุกเส้นลดราคาวันนี้',
      ],
      [
        'Customer',
        'Oh, do you have any thin ties? I prefer the thin style.',
        'อ้อ มีเนคไทเส้นเล็กบ้างไหมครับ ผมชอบแบบเส้นเล็ก',
      ],
      [
        'Clerk',
        "Yes, we do, although we don't have many left. You'll find some on the back rack.",
        'มีค่ะ แต่เหลือไม่เยอะแล้ว ไปดูที่ราวด้านหลังได้เลยค่ะ',
      ],
      [
        'Customer',
        'One more question — do you have any solid-color ties, without any designs?',
        'ถามอีกข้อนะครับ มีเนคไทสีพื้น ไม่มีลวดลายบ้างไหม',
      ],
      [
        'Clerk',
        "No, I'm so sorry, we don't. All of our solid colors have been sold.",
        'ไม่มีค่ะ เสียใจด้วยจริงๆ สีพื้นขายหมดแล้วค่ะ',
      ],
      [
        'Clerk',
        'Good morning. May I help you?',
        'สวัสดีตอนเช้าค่ะ ให้ช่วยอะไรไหมคะ',
      ],
      [
        'Customer',
        "Uh, not quite yet, I'm still looking.",
        'เอ่อ ยังไม่ต้องครับ ผมกำลังดูอยู่',
      ],
      [
        'Clerk',
        'Okay, let me know if you have any questions.',
        'ได้ค่ะ มีคำถามอะไรก็บอกได้เลยนะคะ',
      ],
      [
        'Customer',
        'Sure, thanks. Excuse me, do you have any items on sale today?',
        'ได้ครับ ขอบคุณ ขอโทษนะครับ วันนี้มีสินค้าลดราคาอะไรบ้างไหม',
      ],
      [
        'Clerk',
        "Yes, our men's clothing department has a sale on belts.",
        'มีค่ะ แผนกเสื้อผ้าผู้ชายมีเข็มขัดลดราคาอยู่',
      ],
      [
        'Customer',
        "And where's the men's clothing department?",
        'แล้วแผนกเสื้อผ้าผู้ชายอยู่ตรงไหนครับ',
      ],
      [
        'Clerk',
        'Go straight ahead and turn left.',
        'เดินตรงไปแล้วเลี้ยวซ้ายค่ะ',
      ],
      [
        'Customer',
        'Okay, thanks. And have a nice day.',
        'โอเคครับ ขอบคุณ แล้วก็ขอให้มีความสุขวันนี้นะครับ',
      ],
      ['Clerk', 'Thanks, you too.', 'ขอบคุณค่ะ เช่นกันนะคะ'],
    ],
  },
  {
    key: 'lst4-unit2-info',
    title: 'Unit 2: Asking for More Information',
    emoji: '❓',
    lines: [
      [
        'Clerk',
        'Hi, do you need any help?',
        'สวัสดีค่ะ ต้องการให้ช่วยอะไรไหมคะ',
      ],
      [
        'Customer',
        'Yes, could you tell me how much this shirt costs?',
        'ค่ะ ช่วยบอกหน่อยได้ไหมคะว่าเสื้อตัวนี้ราคาเท่าไหร่',
      ],
      [
        'Clerk',
        'Uh, this shirt is $9.95.',
        'เอ่อ เสื้อตัวนี้ราคา 9.95 ดอลลาร์ค่ะ',
      ],
      [
        'Customer',
        "That's a very reasonable price. Do you have this one in black?",
        'ราคาสมเหตุสมผลดีนะคะ มีสีดำไหมคะ',
      ],
      [
        'Clerk',
        "I'm sorry, we only have this shirt in four colors: gray, pink, blue, and green.",
        'ขอโทษด้วยค่ะ เสื้อตัวนี้มีแค่สี่สี คือ เทา ชมพู ฟ้า และเขียวค่ะ',
      ],
      [
        'Customer',
        'I like the one in green, but do you think the colors fade?',
        'ฉันชอบสีเขียวนะคะ แต่คิดว่าสีจะซีดไหมคะ',
      ],
      [
        'Clerk',
        'Oh, the colors will definitely not fade. These are pre-washed shirts.',
        'อ๋อ สีไม่ซีดแน่นอนค่ะ เสื้อพวกนี้ผ่านการซักมาก่อนแล้ว',
      ],
      [
        'Customer',
        "I'd like the one in green, please. But can you tell me, do you have a size XXL? I'm buying this shirt for my husband, and my husband is very big.",
        'ขอสีเขียวนะคะ แต่ช่วยบอกหน่อยได้ไหมคะว่ามีไซส์ XXL ไหม ฉันจะซื้อให้สามี แล้วสามีฉันตัวใหญ่มาก',
      ],
      [
        'Clerk',
        "I'm sorry, we only have four sizes of this shirt: small, medium, large, and extra large.",
        'ขอโทษด้วยค่ะ เสื้อตัวนี้มีแค่สี่ไซส์ คือ S M L และ XL ค่ะ',
      ],
      [
        'Customer',
        'Could I see the extra large, please?',
        'ขอดูไซส์ XL หน่อยได้ไหมคะ',
      ],
      ['Clerk', 'Sure, here you are.', 'ได้ค่ะ นี่เลยค่ะ'],
      [
        'Customer',
        "I think this will fit my husband. It's 100% cotton — I wonder if it will shrink after a few washes.",
        'ฉันว่าตัวนี้น่าจะพอดีกับสามีนะคะ เป็นผ้าฝ้าย 100% ด้วย สงสัยว่าซักไปหลายๆ ครั้งจะหดไหมคะ',
      ],
      [
        'Clerk',
        "Ma'am, these shirts are pre-shrunk, so you don't need to worry about shrinking.",
        'คุณผู้หญิงคะ เสื้อพวกนี้ผ่านกระบวนการกันหดมาแล้ว ไม่ต้องกังวลเรื่องหดเลยค่ะ',
      ],
      [
        'Customer',
        "That's good. I'll take this one, please.",
        'ดีเลยค่ะ เอาตัวนี้ค่ะ',
      ],
      ['Clerk', "Okay, uh, that'll be $9.95.", 'โอเคค่ะ ราคา 9.95 ดอลลาร์ค่ะ'],
      [
        'Customer',
        'Here you go. Thank you so much for your help.',
        'นี่ค่ะ ขอบคุณมากๆ นะคะที่ช่วยเหลือ',
      ],
      [
        'Clerk',
        "You're welcome. Just one moment, please, for your change and your receipt.",
        'ยินดีค่ะ รอสักครู่นะคะ เดี๋ยวเอาเงินทอนกับใบเสร็จมาให้ค่ะ',
      ],
      [
        'Clerk',
        'Hello, has anyone taken care of you yet?',
        'สวัสดีค่ะ มีคนดูแลหรือยังคะ',
      ],
      [
        'Customer',
        'No, not yet. Could you help me find a pair of jeans, please?',
        'ยังเลยครับ ช่วยหากางเกงยีนส์ให้หน่อยได้ไหมครับ',
      ],
      ['Clerk', 'Sure, what style do you like?', 'ได้ค่ะ ชอบทรงไหนคะ'],
      ['Customer', 'I like the loose-fitting style.', 'ผมชอบทรงหลวมๆ ครับ'],
      ['Clerk', "And what's your size?", 'แล้วไซส์เท่าไหร่คะ'],
      ['Customer', 'My waist size is 29 inches.', 'เอวผม 29 นิ้วครับ'],
      ['Clerk', 'What length are you looking for?', 'ต้องการความยาวเท่าไหร่คะ'],
      ['Customer', 'Approximately 30 inches.', 'ประมาณ 30 นิ้วครับ'],
      [
        'Clerk',
        'And what color do you like? We have black, light blue, and navy blue.',
        'แล้วชอบสีอะไรคะ เรามีสีดำ ฟ้าอ่อน กับกรมท่าค่ะ',
      ],
      ['Customer', 'I like the navy blue.', 'ผมชอบสีกรมท่าครับ'],
      [
        'Clerk',
        'Okay, you might be interested in these.',
        'โอเคค่ะ ลองดูตัวนี้สิคะ น่าจะถูกใจ',
      ],
      [
        'Customer',
        'Yes, I like this style very much.',
        'ใช่ครับ ผมชอบทรงนี้มากเลย',
      ],
      [
        'Clerk',
        "They're very popular. We sell a lot of them.",
        'รุ่นนี้ขายดีมากค่ะ เราขายได้เยอะเลย',
      ],
      ['Customer', 'Can I try them on?', 'ลองใส่ได้ไหมครับ'],
      [
        'Clerk',
        'Yes, of course. The fitting rooms are over there to your left.',
        'ได้เลยค่ะ ห้องลองอยู่ทางซ้ายมือตรงโน้นค่ะ',
      ],
      [
        'Clerk',
        'Hello, can I help you with something?',
        'สวัสดีค่ะ ให้ช่วยอะไรไหมคะ',
      ],
      [
        'Customer',
        "Yes please, I'm looking for some ties.",
        'ครับ ผมกำลังหาเนคไทอยู่',
      ],
      [
        'Clerk',
        "Well, you're in luck, because we have some ties that are on sale today.",
        'โชคดีนะคะ วันนี้มีเนคไทลดราคาอยู่ค่ะ',
      ],
      ['Customer', 'Really? Which ones?', 'จริงเหรอครับ เส้นไหนบ้าง'],
      [
        'Clerk',
        'Well, the ties on this rack are 30 to 50% off, and the ties on this rack are 60% off.',
        'เนคไทบนราวนี้ลด 30-50% ส่วนราวนี้ลด 60% ค่ะ',
      ],
      ['Customer', 'Do you have any silk ties?', 'มีเนคไทผ้าไหมไหมครับ'],
      [
        'Clerk',
        'Yes, we do. We have some ties that were made in Thailand.',
        'มีค่ะ เรามีเนคไทที่ผลิตในประเทศไทยด้วย',
      ],
      [
        'Customer',
        'Really? Can I see a few?',
        'จริงเหรอครับ ขอดูสักสองสามเส้นได้ไหม',
      ],
      [
        'Clerk',
        "Sure — they're on sale for 30 to 50% off, too. Which do you like — solid colors, stripes, or designs?",
        'ได้ค่ะ พวกนี้ก็ลด 30-50% เหมือนกัน ชอบแบบไหนคะ สีพื้น ลายทาง หรือมีลวดลาย',
      ],
      ['Customer', 'Oh, I prefer solid colors.', 'อ๋อ ผมชอบสีพื้นครับ'],
      ['Clerk', 'Okay, how about these?', 'โอเคค่ะ แบบนี้เป็นไงคะ'],
      [
        'Customer',
        'Oh, these are nice, but do you have a wide tie?',
        'โอ้ สวยดีครับ แต่มีเส้นใหญ่ไหมครับ',
      ],
      [
        'Clerk',
        "No, I'm sorry, we only have the thin style.",
        'ไม่มีค่ะ ขอโทษด้วย เรามีแต่แบบเส้นเล็กค่ะ',
      ],
      [
        'Customer',
        "That's okay, I'll take these.",
        'ไม่เป็นไรครับ เอาเส้นนี้แหละ',
      ],
    ],
  },
  {
    key: 'lst4-unit3-advice',
    title: 'Unit 3: Asking for Advice',
    emoji: '🎁',
    lines: [
      [
        'Clerk',
        'Hi, is there anything I could help you with?',
        'สวัสดีค่ะ มีอะไรให้ช่วยไหมคะ',
      ],
      [
        'Customer',
        "Yes, I'm going to a friend's housewarming party, and I'd appreciate some suggestions on what gift to buy.",
        'ค่ะ ฉันจะไปงานขึ้นบ้านใหม่ของเพื่อน อยากได้คำแนะนำหน่อยว่าจะซื้อของขวัญอะไรดี',
      ],
      [
        'Clerk',
        'Sure. How about some detergent and utensils, to help clean the house?',
        'ได้ค่ะ ผงซักฟอกกับอุปกรณ์ทำความสะอาดบ้านเป็นไงคะ',
      ],
      [
        'Customer',
        "Oh, I'm sure other people will also buy detergent.",
        'อ๋อ ฉันว่าคนอื่นก็คงซื้อผงซักฟอกไปให้เหมือนกันแหละ',
      ],
      [
        'Clerk',
        "What about a nice fruit basket? It's simple.",
        'แล้วตะกร้าผลไม้สวยๆ ล่ะคะ ง่ายดี',
      ],
      [
        'Customer',
        'No, I was thinking about getting them something more useful around the house.',
        'ไม่ล่ะ ฉันอยากได้อะไรที่มีประโยชน์ในบ้านมากกว่านี้',
      ],
      ['Clerk', 'Is your friend a man?', 'เพื่อนคุณเป็นผู้ชายหรือเปล่าคะ'],
      ['Customer', 'Yes.', 'ใช่ค่ะ'],
      [
        'Clerk',
        'Perhaps he likes fixing things around the house. Maybe you could get him a set of tools.',
        'งั้นเขาอาจจะชอบซ่อมแซมข้าวของในบ้านนะคะ ลองซื้อชุดเครื่องมือช่างให้ดูสิคะ',
      ],
      [
        'Customer',
        "That's a great idea. I'll get him a toolbox.",
        'ไอเดียดีมากเลย ฉันจะซื้อกล่องเครื่องมือให้เขา',
      ],
      [
        'Clerk',
        'You can find that in the hardware section, located on the third floor.',
        'ไปหาได้ที่แผนกเครื่องมือช่าง อยู่ชั้นสามค่ะ',
      ],
      ['Customer', 'Okay, thank you so much.', 'โอเค ขอบคุณมากนะคะ'],
      ['Clerk', "You're welcome.", 'ยินดีค่ะ'],
      ['Clerk', 'Hello. What can I do for you?', 'สวัสดีค่ะ ให้ช่วยอะไรไหมคะ'],
      [
        'Customer',
        "Well, I'm looking for a new outfit for this weekend.",
        'ผมกำลังหาชุดใหม่ใส่สุดสัปดาห์นี้ครับ',
      ],
      [
        'Clerk',
        'Okay. May I ask what the occasion would be?',
        'โอเคค่ะ ขอถามหน่อยได้ไหมคะว่าไปงานอะไร',
      ],
      ['Customer', "Yes, it's a casual party.", 'ครับ เป็นงานปาร์ตี้แบบลำลอง'],
      ['Clerk', 'Would this be for yourself?', 'ใส่เองใช่ไหมคะ'],
      ['Customer', 'Yes.', 'ใช่ครับ'],
      [
        'Clerk',
        'Okay, what price range are you thinking about?',
        'โอเคค่ะ งบประมาณเท่าไหร่คะ',
      ],
      [
        'Customer',
        "I'm looking to spend between $150 and $200.",
        'ผมอยากใช้เงินประมาณ 150 ถึง 200 ดอลลาร์ครับ',
      ],
      [
        'Clerk',
        'Well, we could start by looking at some pants.',
        'งั้นเริ่มดูกางเกงกันก่อนดีไหมคะ',
      ],
      [
        'Customer',
        'I like these navy blue slacks. How much are they?',
        'ผมชอบกางเกงสแลคสีกรมท่านี้ครับ ราคาเท่าไหร่',
      ],
      [
        'Clerk',
        'These are $60. Would you like to try them on?',
        'ตัวนี้ 60 ดอลลาร์ค่ะ อยากลองใส่ไหมคะ',
      ],
      [
        'Customer',
        'Oh, yes, please. I really like these slacks. What color shirt would go well with them?',
        'ครับ ลองเลย ผมชอบกางเกงตัวนี้มากเลย เสื้อสีไหนจะเข้ากันดีครับ',
      ],
      [
        'Clerk',
        "Well, if you're really brave, I'd recommend this red shirt.",
        'ถ้ากล้าจริงๆ นะคะ ดิฉันแนะนำเสื้อสีแดงตัวนี้เลยค่ะ',
      ],
      ['Customer', 'Do you have anything else?', 'มีแบบอื่นอีกไหมครับ'],
      ['Clerk', 'We have these silk shirts.', 'มีเสื้อผ้าไหมพวกนี้ค่ะ'],
      ['Customer', 'How much are they?', 'ราคาเท่าไหร่ครับ'],
      [
        'Clerk',
        'The silk shirts are $60. Would you like to try them on?',
        'เสื้อผ้าไหมราคา 60 ดอลลาร์ค่ะ อยากลองไหมคะ',
      ],
      [
        'Customer',
        'Yes, please. I like the texture of silk, but I think these shirts are too tight for me. Do you have anything with a loose fit?',
        'ครับ ลองเลย ผมชอบเนื้อผ้าไหมนะ แต่รู้สึกว่าเสื้อพวกนี้คับไปหน่อยสำหรับผม มีทรงหลวมๆ บ้างไหมครับ',
      ],
      [
        'Clerk',
        'Yes. Do you like this loose-fit shirt?',
        'มีค่ะ ชอบเสื้อทรงหลวมตัวนี้ไหมคะ',
      ],
      [
        'Customer',
        "Yes, I do. I'll take the black and white one, please.",
        'ชอบครับ เอาตัวลายขาวดำแล้วกัน',
      ],
      [
        'Clerk',
        "Okay. Oh, but don't you think this one is nice, too?",
        'โอเคค่ะ อ้อ แต่ตัวนี้ก็สวยดีนะคะ ว่าไหมคะ',
      ],
      [
        'Customer',
        "Please, I think I'm done here.",
        'ไม่ต้องแล้วครับ ผมว่าพอแค่นี้ดีกว่า',
      ],
      [
        'Clerk',
        'Okay, very well. Please pay at the cashier counter over there.',
        'โอเคค่ะ ได้เลย ไปจ่ายเงินที่แคชเชียร์ตรงโน้นได้เลยค่ะ',
      ],
      [
        'Customer',
        'Thank you very much for your help.',
        'ขอบคุณมากครับที่ช่วยเหลือ',
      ],
      ['Clerk', 'Sure.', 'ยินดีค่ะ'],
      ['Clerk', 'May I help you?', 'ให้ช่วยอะไรไหมคะ'],
      [
        'Customer',
        "Yes, Father's Day is approaching, and I'd like to get a gift for my dad.",
        'ค่ะ วันพ่อใกล้เข้ามาแล้ว ฉันอยากซื้อของขวัญให้พ่อค่ะ',
      ],
      [
        'Clerk',
        'Do you have any ideas for a gift?',
        'มีไอเดียของขวัญอยู่บ้างไหมคะ',
      ],
      [
        'Customer',
        "Not really. I thought I'd shop around for some ideas first.",
        'ยังไม่มีเลยค่ะ คิดว่าจะเดินดูรอบๆ หาไอเดียก่อน',
      ],
      ['Clerk', 'How about some clothing?', 'เสื้อผ้าเป็นไงคะ'],
      [
        'Customer',
        'No, not clothing. I get him clothing every year. This year I want to do something just a little bit different.',
        'ไม่เอาเสื้อผ้าค่ะ ทุกปีฉันซื้อเสื้อผ้าให้อยู่แล้ว ปีนี้อยากลองทำอะไรที่ต่างออกไปหน่อย',
      ],
      [
        'Clerk',
        "Would you like to look at our men's accessories?",
        'อยากดูเครื่องประดับผู้ชายของเราไหมคะ',
      ],
      ['Customer', 'Sure, what do you suggest?', 'ได้ค่ะ แนะนำอะไรดี'],
      [
        'Clerk',
        'Well, that depends. Does your father wear suits?',
        'ก็แล้วแต่นะคะ คุณพ่อใส่สูทไหมคะ',
      ],
      [
        'Customer',
        "Oh, yes. He's a businessman. He wears suits every day.",
        'ใส่ค่ะ พ่อเป็นนักธุรกิจ ใส่สูททุกวันเลย',
      ],
      [
        'Clerk',
        'Then would you like to look at our tie clips or cufflinks?',
        'งั้นอยากดูที่หนีบเนคไทหรือกระดุมข้อมือไหมคะ',
      ],
      [
        'Customer',
        "That sounds great. Let's see your cufflinks.",
        'ฟังดูดีค่ะ ขอดูกระดุมข้อมือหน่อยค่ะ',
      ],
      [
        'Clerk',
        "Sure. Step over to the counter with me, and I'll show you what we have.",
        'ได้ค่ะ มาที่เคาน์เตอร์กับดิฉันนะคะ จะได้โชว์ของที่เรามีให้ดูค่ะ',
      ],
    ],
  },
  {
    key: 'lst4-unit4-discounts',
    title: 'Unit 4: Asking for Discounts',
    emoji: '💸',
    lines: [
      [
        'Clerk',
        'Good afternoon. Is someone taking care of you?',
        'สวัสดีตอนบ่ายค่ะ มีคนดูแลหรือยังคะ',
      ],
      [
        'Customer',
        'No, not yet. Um, could I ask you about the prices for these shoes?',
        'ยังเลยครับ ขอถามราคารองเท้าคู่นี้หน่อยได้ไหมครับ',
      ],
      [
        'Clerk',
        'Yes. Which shoes are you interested in?',
        'ได้ค่ะ สนใจรองเท้าคู่ไหนคะ',
      ],
      [
        'Customer',
        "I'm interested in these two pairs of shoes.",
        'ผมสนใจรองเท้าสองคู่นี้ครับ',
      ],
      [
        'Clerk',
        'The first pair is $65. And the second pair, which just arrived yesterday, is $85.',
        'คู่แรก 65 ดอลลาร์ค่ะ ส่วนคู่ที่สองเพิ่งเข้ามาเมื่อวานนี้ ราคา 85 ดอลลาร์ค่ะ',
      ],
      [
        'Customer',
        "They're quite expensive. Could you give me a discount?",
        'แพงเหมือนกันนะครับ ลดราคาให้หน่อยได้ไหม',
      ],
      [
        'Clerk',
        "I'm sorry, sir. The prices are fixed throughout this store.",
        'ขอโทษด้วยค่ะคุณลูกค้า ราคาสินค้าในร้านนี้เป็นราคาตายตัวค่ะ',
      ],
      [
        'Customer',
        'Could you give me a discount if I bought both pairs of shoes?',
        'ถ้าผมซื้อทั้งสองคู่ ลดราคาให้ได้ไหมครับ',
      ],
      [
        'Clerk',
        "I'm really sorry, sir, but there's no bargaining in this store.",
        'ขอโทษจริงๆ ค่ะ แต่ร้านนี้ไม่มีการต่อรองราคาค่ะ',
      ],
      [
        'Customer',
        "Okay. A discount really would've helped me buy both pairs of shoes.",
        'โอเคครับ ถ้าลดราคาได้ก็คงช่วยให้ผมซื้อได้ทั้งสองคู่เลยนะครับ',
      ],
      [
        'Clerk',
        'Sir, if you need shoes with lower prices, I could show you some.',
        'คุณลูกค้าคะ ถ้าต้องการรองเท้าราคาถูกกว่านี้ ดิฉันมีให้ดูนะคะ',
      ],
      [
        'Customer',
        "No, that's okay. Um, I'll take this pair.",
        'ไม่เป็นไรครับ เอาคู่นี้แล้วกัน',
      ],
      [
        'Clerk',
        'All right, then. That will be $85.',
        'ได้ค่ะ ราคา 85 ดอลลาร์ค่ะ',
      ],
      ['Clerk', 'Good morning. How are you?', 'สวัสดีตอนเช้าค่ะ สบายดีไหมคะ'],
      ['Customer', "I'm very well, thank you.", 'สบายดีครับ ขอบคุณ'],
      [
        'Clerk',
        "I'd like to direct your attention to the televisions.",
        'ดิฉันอยากให้คุณลองดูโทรทัศน์พวกนี้ค่ะ',
      ],
      [
        'Customer',
        "They're very nice. The overall design is very modern and sleek. How much are they?",
        'สวยดีนะครับ ดีไซน์ดูทันสมัยเรียบหรูดี ราคาเท่าไหร่ครับ',
      ],
      [
        'Clerk',
        'Well, the 14-inch, the 20-inch, and the 21-inch are $110, $180, and $210 respectively.',
        'รุ่น 14 นิ้ว 20 นิ้ว และ 21 นิ้ว ราคา 110, 180 และ 210 ดอลลาร์ตามลำดับค่ะ',
      ],
      [
        'Customer',
        'I really like the 21-inch. Um, do you give a discount?',
        'ผมชอบรุ่น 21 นิ้วมากเลยครับ มีส่วนลดไหมครับ',
      ],
      [
        'Clerk',
        'The TVs are already on sale. These are sale prices — 20% off the regular price.',
        'ทีวีพวกนี้ลดราคาอยู่แล้วค่ะ ราคานี้เป็นราคาลด ลด 20% จากราคาปกติค่ะ',
      ],
      [
        'Customer',
        'Oh, but I was expecting bigger discounts.',
        'โอ้ แต่ผมนึกว่าจะลดมากกว่านี้ครับ',
      ],
      [
        'Clerk',
        "I'm sorry. And I should mention, this is a special promotion sale for a limited time only.",
        'ขอโทษด้วยค่ะ แล้วก็ต้องบอกไว้ก่อนว่านี่เป็นโปรโมชั่นพิเศษช่วงเวลาจำกัดเท่านั้นค่ะ',
      ],
      [
        'Customer',
        'Maybe I should wait for a clearance sale.',
        'งั้นผมรอลดล้างสต๊อกดีกว่ามั้งครับ',
      ],
      [
        'Clerk',
        'You could do that, but the model you want may no longer be in stock.',
        'ทำแบบนั้นก็ได้ค่ะ แต่รุ่นที่ต้องการอาจจะหมดสต๊อกไปแล้วนะคะ',
      ],
      [
        'Customer',
        "Okay, it's a little bit expensive, but I'll go for the 21-inch.",
        'โอเคครับ แพงไปหน่อยแต่ผมเอารุ่น 21 นิ้วแล้วกัน',
      ],
      ['Clerk', 'Hello. How may I help you?', 'สวัสดีค่ะ มีอะไรให้ช่วยไหมคะ'],
      [
        'Customer',
        "I've come to buy the new Sony stereo that was advertised in the newspaper last week.",
        'ฉันมาซื้อเครื่องเสียงโซนี่รุ่นใหม่ที่ลงโฆษณาในหนังสือพิมพ์เมื่ออาทิตย์ที่แล้วค่ะ',
      ],
      ['Clerk', "Ah, that's just right over here.", 'อ๋อ อยู่ตรงนี้เลยค่ะ'],
      [
        'Customer',
        'The price for the new model was advertised at $179. But the price on the price tag shows $199.',
        'ราคาที่โฆษณาไว้คือ 179 ดอลลาร์ แต่ป้ายราคาที่นี่เขียนไว้ 199 ดอลลาร์ค่ะ',
      ],
      [
        'Clerk',
        "Yes, the $179 was for the weekend sale. The weekend's over now.",
        'ใช่ค่ะ 179 ดอลลาร์นั้นเป็นราคาโปรโมชั่นวันหยุดสุดสัปดาห์ ตอนนี้หมดเขตแล้วค่ะ',
      ],
      [
        'Customer',
        'But I came in expecting it to be $179.',
        'แต่ฉันมาโดยคิดว่าราคาจะเป็น 179 ดอลลาร์นะคะ',
      ],
      [
        'Clerk',
        "I'm sorry, ma'am, but as you've missed the weekend sale period, I'm afraid I can't offer you the weekend sale price.",
        'ขอโทษด้วยค่ะคุณผู้หญิง แต่เนื่องจากพ้นช่วงโปรโมชั่นวันหยุดสุดสัปดาห์ไปแล้ว ดิฉันเกรงว่าจะให้ราคานั้นไม่ได้ค่ะ',
      ],
      ['Customer', 'Let me talk to the manager.', 'ขอคุยกับผู้จัดการหน่อยค่ะ'],
      [
        'Clerk',
        'Okay, one moment, please. Hello, Simon? Yes, can you help me with some customer service, please, over at Sony? Thank you. One moment, please.',
        'ได้ค่ะ รอสักครู่นะคะ ฮัลโหล ไซมอนใช่ไหม ช่วยมาดูแลลูกค้าที่แผนกโซนี่หน่อยได้ไหมคะ ขอบคุณค่ะ รอสักครู่นะคะ',
      ],
      [
        'Simon',
        'Good afternoon. How can I be of service to you?',
        'สวัสดีตอนบ่ายครับ มีอะไรให้ผมช่วยไหมครับ',
      ],
      [
        'Customer',
        'I came in expecting to buy the new Sony model for the advertised price of $179, but your salesperson tells me I have missed the sale period.',
        'ฉันมาซื้อโซนี่รุ่นใหม่โดยคิดว่าราคาโฆษณาคือ 179 ดอลลาร์ แต่พนักงานบอกว่าพ้นช่วงลดราคาไปแล้วค่ะ',
      ],
      [
        'Simon',
        "I see. It's correct that the sale price was only for the weekend. However, if you purchase the stereo for the regular price of $199, what I could do is give you discount coupons for your next purchase at our store.",
        'เข้าใจแล้วครับ ราคาลดนั้นใช้ได้แค่ช่วงวันหยุดสุดสัปดาห์จริงๆ ครับ แต่ถ้าคุณซื้อในราคาปกติ 199 ดอลลาร์ ผมสามารถให้คูปองส่วนลดสำหรับการซื้อครั้งหน้าที่ร้านเราได้ครับ',
      ],
      [
        'Customer',
        'Okay, thank you. Then I will take the stereo and the discount coupons.',
        'โอเคค่ะ ขอบคุณ งั้นฉันเอาเครื่องเสียงกับคูปองส่วนลดค่ะ',
      ],
      ['Simon', 'Great.', 'ดีเลยครับ'],
    ],
  },
  {
    key: 'lst4-unit5-bargaining',
    title: 'Unit 5: Bargaining',
    emoji: '🤝',
    lines: [
      ['Clerk', 'Hi. Can I help you?', 'สวัสดีครับ ให้ช่วยอะไรไหมครับ'],
      [
        'Customer',
        "Uh, yes. I'd like to buy a new GSM phone with internet capabilities.",
        'เอ่อ ค่ะ ฉันอยากซื้อโทรศัพท์ GSM รุ่นใหม่ที่เข้าเน็ตได้ค่ะ',
      ],
      [
        'Clerk',
        'I think this Panasonic would be the best phone for you.',
        'ผมว่าพานาโซนิครุ่นนี้เหมาะกับคุณที่สุดครับ',
      ],
      ['Customer', 'Okay. How much is it?', 'โอเค ราคาเท่าไหร่คะ'],
      ['Clerk', "It's only $375.", 'แค่ 375 ดอลลาร์เองครับ'],
      [
        'Customer',
        "Wow, that's too expensive. The last Panasonic model that I bought was only $250.",
        'โห แพงไปนะคะ รุ่นพานาโซนิคที่ฉันซื้อครั้งก่อนแค่ 250 ดอลลาร์เอง',
      ],
      [
        'Clerk',
        "Yes, well, the internet capability has pushed up the cost of the phone. Really, $375 isn't that expensive.",
        'ใช่ครับ แต่ฟังก์ชันเข้าเน็ตทำให้ราคาสูงขึ้นครับ จริงๆ แล้ว 375 ดอลลาร์ไม่แพงเลยนะครับ',
      ],
      [
        'Customer',
        'Well, could you lower the price to $300?',
        'งั้นลดให้เหลือ 300 ดอลลาร์ได้ไหมคะ',
      ],
      [
        'Clerk',
        'No. The best I can do for you is $340.',
        'ไม่ได้ครับ ราคาดีที่สุดที่ผมให้ได้คือ 340 ดอลลาร์',
      ],
      [
        'Customer',
        "Okay, I'll take this new Panasonic model.",
        'โอเคค่ะ เอาพานาโซนิครุ่นใหม่นี้แล้วกัน',
      ],
      [
        'Seller',
        'Good morning. How are you?',
        'สวัสดีตอนเช้าครับ สบายดีไหมครับ',
      ],
      ['Buyer', "I'm fine. How's business?", 'สบายดีค่ะ ธุรกิจเป็นยังไงบ้างคะ'],
      [
        'Seller',
        'Business is going good. How is your business doing?',
        'ธุรกิจไปได้ดีครับ แล้วธุรกิจของคุณล่ะครับ',
      ],
      [
        'Buyer',
        'Our business is not so good. Everybody in the market is reducing their prices.',
        'ธุรกิจเราไม่ค่อยดีเท่าไหร่ค่ะ ทุกเจ้าในตลาดพากันลดราคากันหมดเลย',
      ],
      [
        'Seller',
        'Have you lowered your retail prices?',
        'แล้วคุณลดราคาขายปลีกหรือยังครับ',
      ],
      [
        'Buyer',
        "Not yet. But when we do, we'd like to ask you to reduce your prices to us.",
        'ยังเลยค่ะ แต่พอถึงตอนนั้น เราอยากขอให้คุณลดราคาที่ขายให้เราด้วย',
      ],
      [
        'Seller',
        'How much of a reduction in price do you need?',
        'ต้องการให้ลดราคาลงเท่าไหร่ครับ',
      ],
      [
        'Buyer',
        'Well, everybody else is reducing their prices between 10 and 15%.',
        'ก็ เจ้าอื่นๆ เขาลดราคากันประมาณ 10 ถึง 15% ค่ะ',
      ],
      [
        'Seller',
        "Well, as you know, costs are increasing. It'll be very difficult for us to reduce our prices.",
        'อย่างที่คุณทราบ ต้นทุนเรากำลังสูงขึ้นครับ คงยากมากที่จะลดราคาให้ได้ขนาดนั้น',
      ],
      [
        'Buyer',
        "Well, as you know, if we can't remain competitive, we'll lose our business.",
        'แต่อย่างที่คุณก็รู้ ถ้าเราแข่งขันไม่ได้ เราก็จะเสียลูกค้าไปค่ะ',
      ],
      [
        'Seller',
        "Yes. Well, we understand, and we want to work with you. However, we simply can't cut our prices by 10 to 15%.",
        'ใช่ครับ เราเข้าใจ และเราก็อยากร่วมงานกับคุณต่อไป แต่เราลดราคาลง 10-15% ไม่ได้จริงๆ ครับ',
      ],
      [
        'Buyer',
        'What is the best deal that you could offer us?',
        'ข้อเสนอที่ดีที่สุดที่คุณให้เราได้คืออะไรคะ',
      ],
      [
        'Seller',
        'Well, we could reduce your prices by 5%, and if you buy more than 50 units, we can give you an additional 5% discount.',
        'เราลดราคาให้ 5% ได้ครับ แล้วถ้าคุณสั่งซื้อมากกว่า 50 ชิ้น เราจะลดเพิ่มให้อีก 5%',
      ],
      ['Buyer', 'Fair enough. Deal.', 'ยุติธรรมดี ตกลงค่ะ'],
      ['Clerk', 'Hello. How can I help you?', 'สวัสดีครับ ให้ช่วยอะไรไหมครับ'],
      [
        'Customer',
        "I'm looking to buy a car for my wife.",
        'ผมอยากซื้อรถให้ภรรยาครับ',
      ],
      [
        'Clerk',
        'Did you have a specific model in mind?',
        'มีรุ่นที่สนใจอยู่แล้วไหมครับ',
      ],
      [
        'Customer',
        "Yes, I'm most interested in the Saloona, with automatic transmission and the full option package.",
        'ครับ ผมสนใจรุ่นซาลูน่ามากที่สุด แบบเกียร์ออโต้พร้อมออปชันเต็มครับ',
      ],
      [
        'Clerk',
        "That's a very popular model at the moment. The price is $13,500.",
        'รุ่นนี้ได้รับความนิยมมากตอนนี้เลยครับ ราคา 13,500 ดอลลาร์ครับ',
      ],
      [
        'Customer',
        'That seems quite expensive. Is it possible you could give me a discount?',
        'ดูแพงเหมือนกันนะครับ พอจะลดราคาให้ได้ไหมครับ',
      ],
      [
        'Clerk',
        "The best we could do is $13,200. Additionally, we'll also include $300 worth of shopping coupons at Central Department Store.",
        'ราคาดีที่สุดที่เราให้ได้คือ 13,200 ดอลลาร์ครับ แถมคูปองช้อปปิ้งมูลค่า 300 ดอลลาร์ที่ห้างเซ็นทรัลให้ด้วยครับ',
      ],
      [
        'Customer',
        'Well, maybe you could throw in a spoiler and other accessories. Or perhaps you could absorb the cost of insurance.',
        'งั้นแถมสปอยเลอร์กับอุปกรณ์เสริมอื่นๆ ให้ด้วยได้ไหมครับ หรือไม่ก็ช่วยออกค่าประกันให้หน่อย',
      ],
      [
        'Clerk',
        "I'll have to check with my manager. Please hold on for a moment. Okay, in addition to the $300 discount and the $300 shopping coupons, we'll also include the spoiler and a CD player. As for the insurance, you'll have to pay for that yourself.",
        'ผมต้องเช็คกับผู้จัดการก่อนนะครับ รอสักครู่ครับ โอเคครับ นอกจากส่วนลด 300 ดอลลาร์กับคูปอง 300 ดอลลาร์แล้ว เราจะแถมสปอยเลอร์กับเครื่องเล่นซีดีให้ด้วย ส่วนค่าประกันคุณต้องออกเองนะครับ',
      ],
      [
        'Customer',
        "Okay. Thank you very much. I'll take the Saloona.",
        'โอเคครับ ขอบคุณมากครับ เอารุ่นซาลูน่าแล้วกัน',
      ],
      [
        'Clerk',
        'Great. Come this way. Someone will show you where to sign the necessary forms.',
        'ดีเลยครับ ทางนี้ครับ จะมีคนพาไปเซ็นเอกสารที่จำเป็นให้ครับ',
      ],
    ],
  },
  {
    key: 'lst4-unit6-mistakes',
    title: 'Unit 6: Mistakes About a Price',
    emoji: '⚠️',
    lines: [
      [
        'Customer',
        'Excuse me, could you help me for a moment?',
        'ขอโทษนะครับ ช่วยผมสักครู่ได้ไหมครับ',
      ],
      [
        'Clerk',
        'Certainly. What can I do for you?',
        'ได้เลยค่ะ มีอะไรให้ช่วยคะ',
      ],
      [
        'Customer',
        'Well, I think there might be some mistake about phone prices in your store.',
        'ก็ ผมว่าราคาโทรศัพท์ในร้านนี้อาจจะผิดพลาดนะครับ',
      ],
      [
        'Clerk',
        'Really? Can you tell me some more details about this mistake?',
        'จริงเหรอคะ ช่วยเล่ารายละเอียดให้ฟังหน่อยได้ไหมคะ',
      ],
      [
        'Customer',
        'Yes. Well, the price quoted on a special advertisement for this phone was $25, but the tag on the phone says $30. What is the correct price?',
        'ได้ครับ คือราคาที่โฆษณาพิเศษบอกไว้สำหรับโทรศัพท์รุ่นนี้คือ 25 ดอลลาร์ แต่ป้ายราคาที่ตัวเครื่องเขียนไว้ 30 ดอลลาร์ ราคาที่ถูกต้องคือเท่าไหร่ครับ',
      ],
      [
        'Clerk',
        "I don't know, but I'm going to check. One moment, please. You are right, this phone should only be $25. I'm so sorry about the confusion. I'm going to find out who's responsible for this mistake and have it corrected right away.",
        'ดิฉันไม่แน่ใจค่ะ แต่จะไปเช็คให้ รอสักครู่นะคะ คุณพูดถูกค่ะ โทรศัพท์เครื่องนี้ควรจะราคาแค่ 25 ดอลลาร์ ขอโทษด้วยจริงๆ ค่ะที่ทำให้สับสน ดิฉันจะไปหาว่าใครทำผิดพลาดตรงนี้ แล้วรีบแก้ไขให้ทันทีค่ะ',
      ],
      ['Customer', 'Thank you.', 'ขอบคุณครับ'],
      ['Clerk', 'Thank you for helping us.', 'ขอบคุณค่ะที่ช่วยแจ้งให้เราทราบ'],
      ['Clerk', 'Good afternoon.', 'สวัสดีตอนบ่ายค่ะ'],
      ['Customer', 'Good afternoon.', 'สวัสดีตอนบ่ายครับ'],
      ['Clerk', 'Will this be all?', 'มีแค่นี้ใช่ไหมคะ'],
      ['Customer', 'Yes, just one pair of pants.', 'ครับ กางเกงแค่ตัวเดียว'],
      ['Clerk', "That'll be $39.99.", 'ราคา 39.99 ดอลลาร์ค่ะ'],
      [
        'Customer',
        'Wait a second — I thought the sign back there said $29.99 for these pants.',
        'เดี๋ยวก่อนนะครับ ผมจำได้ว่าป้ายตรงโน้นเขียนว่ากางเกงตัวนี้ 29.99 ดอลลาร์นะครับ',
      ],
      [
        'Clerk',
        'Really? Let me try to rescan the barcode and see. The computer still shows the price of $39.99. Let me check with the floor salesperson. Please wait a moment. Thank you, sir. The price is $39.99. You may have misread the price.',
        'จริงเหรอคะ ขอสแกนบาร์โค้ดใหม่ดูนะคะ คอมพิวเตอร์ยังขึ้นราคา 39.99 ดอลลาร์เหมือนเดิมค่ะ ขอเช็คกับพนักงานหน้าร้านก่อนนะคะ รอสักครู่ค่ะ ขอบคุณค่ะคุณลูกค้า ราคาคือ 39.99 ดอลลาร์ค่ะ คุณอาจจะอ่านป้ายผิดค่ะ',
      ],
      [
        'Customer',
        'Okay. Well, is it possible to cancel this purchase? I would like to look for another pair of pants.',
        'โอเคครับ งั้นยกเลิกการซื้อได้ไหมครับ ผมอยากไปหากางเกงตัวอื่นดู',
      ],
      ['Clerk', 'Sure.', 'ได้เลยค่ะ'],
      ['Customer', 'Thank you.', 'ขอบคุณครับ'],
      ['Clerk', "You're welcome.", 'ยินดีค่ะ'],
      ['Clerk', 'May I help you?', 'ให้ช่วยอะไรไหมคะ'],
      [
        'Customer',
        "Yes, I'm looking for the Ralph Lauren cosmetic set.",
        'ค่ะ ฉันกำลังหาชุดเครื่องสำอางราล์ฟ ลอเรนอยู่ค่ะ',
      ],
      [
        'Clerk',
        "Oh, great, you're in luck. We still have three sets left.",
        'โอ้ โชคดีจังค่ะ เรายังเหลืออยู่สามชุดเลยค่ะ',
      ],
      [
        'Customer',
        'Great. I will take one, please.',
        'ดีเลยค่ะ เอาหนึ่งชุดค่ะ',
      ],
      [
        'Clerk',
        'It comes with a complimentary bag.',
        'แถมกระเป๋าให้ฟรีด้วยนะคะ',
      ],
      [
        'Customer',
        'How nice. Is there more than one color for the bag?',
        'ดีจังเลย มีสีให้เลือกมากกว่าหนึ่งสีไหมคะ',
      ],
      [
        'Clerk',
        'Actually, we have two colors, silver and black. Which one would you like?',
        'จริงๆ แล้วมีสองสีค่ะ สีเงินกับสีดำ อยากได้สีไหนคะ',
      ],
      ['Customer', "I'll take the black one, please.", 'เอาสีดำแล้วกันค่ะ'],
      ['Clerk', 'Great. That will be $85.', 'ได้ค่ะ ราคา 85 ดอลลาร์ค่ะ'],
      [
        'Customer',
        'Excuse me. According to the advertisement in L Magazine this month, one set costs $65.',
        'ขอโทษนะคะ ในโฆษณานิตยสาร L ฉบับเดือนนี้เขียนว่าชุดนี้ราคา 65 ดอลลาร์ค่ะ',
      ],
      [
        'Clerk',
        'Yes, the ad quotes $65 for the set, but you must bring the ad in order to receive the discount.',
        'ใช่ค่ะ โฆษณาลงราคา 65 ดอลลาร์จริง แต่ต้องนำโฆษณามาแสดงถึงจะได้ส่วนลดค่ะ',
      ],
      [
        'Clerk',
        'Let me check with my manager whether we can still give it to you with a discount. The manager has agreed to give it to you for $65.',
        'ขอเช็คกับผู้จัดการก่อนนะคะว่ายังให้ส่วนลดได้ไหม ผู้จัดการอนุมัติให้ในราคา 65 ดอลลาร์ค่ะ',
      ],
      ['Customer', 'Thank you so much.', 'ขอบคุณมากค่ะ'],
      ['Clerk', "You're welcome.", 'ยินดีค่ะ'],
    ],
  },
  {
    key: 'lst4-unit7-paying',
    title: 'Unit 7: How Will You Be Paying?',
    emoji: '💳',
    lines: [
      [
        'Clerk',
        'Can I help you find anything else?',
        'มีอะไรให้ช่วยหาเพิ่มไหมคะ',
      ],
      ['Customer', 'No, that should do it.', 'ไม่ล่ะครับ แค่นี้พอแล้ว'],
      ['Clerk', 'How would you like to pay today?', 'วันนี้จะชำระเงินยังไงคะ'],
      ['Customer', 'Do you accept Mastercard?', 'รับบัตรมาสเตอร์การ์ดไหมครับ'],
      [
        'Clerk',
        "No, I'm sorry, we only accept Visa or American Express.",
        'ไม่รับค่ะ ขอโทษด้วย เรารับแค่วีซ่ากับอเมริกันเอ็กซ์เพรสค่ะ',
      ],
      [
        'Customer',
        "All right then, I'll pay with my Visa card.",
        'งั้นผมจ่ายด้วยบัตรวีซ่าแล้วกันครับ',
      ],
      [
        'Clerk',
        "Okay, wait a moment, please. I'm sorry, this card has been denied.",
        'ได้ค่ะ รอสักครู่นะคะ ขอโทษด้วยค่ะ บัตรนี้ถูกปฏิเสธค่ะ',
      ],
      ['Customer', 'I wonder what the problem is.', 'สงสัยจังว่าปัญหาคืออะไร'],
      [
        'Clerk',
        'Well, the computer indicates to contact your bank.',
        'คอมพิวเตอร์แจ้งว่าให้ติดต่อธนาคารของคุณค่ะ',
      ],
      [
        'Customer',
        "All right, I'll do that immediately. It looks like I'll be paying with cash today.",
        'โอเคครับ เดี๋ยวผมติดต่อทันที ดูเหมือนวันนี้ผมต้องจ่ายเป็นเงินสดแล้วล่ะ',
      ],
      [
        'Clerk',
        "I'm so sorry for the trouble.",
        'ขอโทษด้วยจริงๆ นะคะที่ทำให้ยุ่งยาก',
      ],
      ['Customer', "It's quite all right.", 'ไม่เป็นไรครับ'],
      [
        'Clerk',
        'Have you found what you were looking for, sir?',
        'เจอของที่ต้องการหรือยังคะ',
      ],
      [
        'Customer',
        "Yes, I have. Thank you. I'm ready to pay.",
        'เจอแล้วครับ ขอบคุณ ผมพร้อมจ่ายเงินแล้ว',
      ],
      [
        'Clerk',
        'Will you be paying by cash or credit?',
        'จะจ่ายเป็นเงินสดหรือบัตรเครดิตคะ',
      ],
      ['Customer', 'Oh, credit, please.', 'บัตรเครดิตครับ'],
      [
        'Clerk',
        "I'm very sorry, there seems to be a problem with your credit card. The transaction is not going through.",
        'ขอโทษด้วยค่ะ ดูเหมือนบัตรเครดิตของคุณมีปัญหา รายการไม่ผ่านค่ะ',
      ],
      ['Customer', "Really? What's the matter?", 'จริงเหรอครับ มีปัญหาอะไร'],
      [
        'Clerk',
        "I'm not sure. The computer says to contact your bank.",
        'ดิฉันก็ไม่แน่ใจค่ะ คอมพิวเตอร์แจ้งให้ติดต่อธนาคารค่ะ',
      ],
      [
        'Customer',
        'Well, can you try the card again?',
        'ลองรูดบัตรอีกทีได้ไหมครับ',
      ],
      [
        'Clerk',
        'Sir, I already tried the transaction three times. I still received the same message.',
        'คุณลูกค้าคะ ดิฉันลองมาสามครั้งแล้ว ก็ยังขึ้นข้อความเดิมค่ะ',
      ],
      [
        'Customer',
        'All right. Can you try this card?',
        'โอเคครับ ลองบัตรนี้ดูได้ไหมครับ',
      ],
      [
        'Clerk',
        'Sure, wait a moment. Okay, this one works just fine. Your total is $28.18. Please sign the receipt right here.',
        'ได้ค่ะ รอสักครู่นะคะ โอเค ใบนี้ใช้ได้เลยค่ะ ยอดรวม 28.18 ดอลลาร์ค่ะ กรุณาเซ็นใบเสร็จตรงนี้ด้วยค่ะ',
      ],
      [
        'Customer',
        'Thanks. Sorry for the confusion.',
        'ขอบคุณครับ ขอโทษด้วยนะครับที่วุ่นวาย',
      ],
      ['Clerk', 'Not a problem.', 'ไม่เป็นไรค่ะ'],
      ['Clerk', 'May I help you, sir?', 'ให้ช่วยอะไรไหมคะคุณลูกค้า'],
      ['Customer', 'Is this tie on sale?', 'เนคไทเส้นนี้ลดราคาไหมครับ'],
      ['Clerk', 'Yes, it is.', 'ลดค่ะ'],
      ['Customer', 'How much is it?', 'ราคาเท่าไหร่ครับ'],
      ['Clerk', "It's $14.99.", '14.99 ดอลลาร์ค่ะ'],
      [
        'Customer',
        'Can I pay with my Visa card?',
        'จ่ายด้วยบัตรวีซ่าได้ไหมครับ',
      ],
      ['Clerk', 'Sure.', 'ได้ค่ะ'],
      ['Customer', 'Here you go.', 'นี่ครับ'],
      [
        'Clerk',
        'Thank you. Could you please sign here?',
        'ขอบคุณค่ะ ช่วยเซ็นตรงนี้หน่อยได้ไหมคะ',
      ],
      ['Customer', 'Okay.', 'ได้ครับ'],
      ['Clerk', "Here's your receipt.", 'นี่ใบเสร็จค่ะ'],
      ['Customer', 'Thank you.', 'ขอบคุณครับ'],
      ['Clerk', 'Please come again.', 'เชิญมาใหม่นะคะ'],
    ],
  },
  {
    key: 'lst4-unit8-exchange',
    title: 'Unit 8: Exchanging Merchandise',
    emoji: '🔄',
    lines: [
      ['Clerk', 'Could I help you?', 'ให้ช่วยอะไรไหมคะ'],
      [
        'Customer',
        "Yes, I'd like to return these shoes, please.",
        'ค่ะ ฉันอยากคืนรองเท้าคู่นี้ค่ะ',
      ],
      ['Clerk', 'What seems to be the problem?', 'มีปัญหาอะไรคะ'],
      [
        'Customer',
        'Well, the sole is coming off the right shoe.',
        'คือพื้นรองเท้าข้างขวามันหลุดออกมาค่ะ',
      ],
      ['Clerk', 'Really? Do you have a receipt?', 'จริงเหรอคะ มีใบเสร็จไหมคะ'],
      ['Customer', 'Yes, I do.', 'มีค่ะ'],
      [
        'Clerk',
        'You may exchange the shoes for any item with the same price.',
        'คุณสามารถเปลี่ยนเป็นสินค้าชิ้นอื่นที่ราคาเท่ากันได้ค่ะ',
      ],
      [
        'Customer',
        'Actually, I like these shoes very much. Could I exchange them for another pair?',
        'จริงๆ แล้วฉันชอบรองเท้าคู่นี้มากเลยค่ะ เปลี่ยนเป็นคู่ใหม่ได้ไหมคะ',
      ],
      ['Clerk', 'Of course you may.', 'ได้แน่นอนค่ะ'],
      [
        'Customer',
        'Although, do you have the same style of shoes in a darker color?',
        'แต่มีรองเท้าทรงเดียวกันสีเข้มกว่านี้ไหมคะ',
      ],
      [
        'Clerk',
        'Let me check our stock. Yes, we carry a black pair and a navy blue pair.',
        'ขอเช็คสต๊อกก่อนนะคะ มีค่ะ เรามีสีดำกับสีกรมท่าค่ะ',
      ],
      [
        'Customer',
        "Great, I'll exchange these for the navy blue pair, please.",
        'ดีค่ะ งั้นขอเปลี่ยนเป็นสีกรมท่าค่ะ',
      ],
      ['Clerk', 'May I help you?', 'ให้ช่วยอะไรไหมคะ'],
      [
        'Customer',
        "I'd like to return this shirt.",
        'ฉันอยากคืนเสื้อตัวนี้ค่ะ',
      ],
      [
        'Clerk',
        "I'm sorry, we only have an exchange policy.",
        'ขอโทษด้วยค่ะ ร้านเรามีแค่นโยบายเปลี่ยนสินค้า ไม่มีการคืนเงินค่ะ',
      ],
      [
        'Customer',
        'What is your exchange policy?',
        'นโยบายเปลี่ยนสินค้าเป็นยังไงคะ',
      ],
      [
        'Clerk',
        "You can exchange this item for any item equivalent to the shirt's price.",
        'คุณสามารถเปลี่ยนเป็นสินค้าชิ้นอื่นที่ราคาเท่ากับเสื้อตัวนี้ได้ค่ะ',
      ],
      [
        'Customer',
        'I see. In that case, I may browse around a bit.',
        'เข้าใจแล้วค่ะ งั้นฉันขอเดินดูรอบๆ ก่อนนะคะ',
      ],
      [
        'Clerk',
        'Sure, feel free. Take your time.',
        'ได้เลยค่ะ เชิญตามสบาย ค่อยๆ ดูนะคะ',
      ],
      [
        'Customer',
        "Thank you. I don't see anything else I like. Is it possible to get the same shirt but only one size larger?",
        'ขอบคุณค่ะ ฉันไม่เห็นอะไรที่ชอบเลย ขอเสื้อแบบเดียวกันแต่ไซส์ใหญ่ขึ้นอีกไซส์ได้ไหมคะ',
      ],
      [
        'Clerk',
        "Sure, I'll look for one size larger. I'm sorry, we don't have this color, but we do have this size in other colors.",
        'ได้ค่ะ ขอไปหาไซส์ใหญ่กว่านี้ให้นะคะ ขอโทษด้วยค่ะ สีนี้ไม่มีไซส์นี้แล้ว แต่มีไซส์นี้ในสีอื่นค่ะ',
      ],
      [
        'Customer',
        "All right then. I'll look at some other colors.",
        'โอเคค่ะ งั้นฉันขอดูสีอื่นก็แล้วกัน',
      ],
      [
        'Clerk',
        "Okay, let me know if you're interested in anything you see.",
        'ได้ค่ะ ถ้าสนใจอันไหนบอกได้เลยนะคะ',
      ],
      ['Customer', 'Thank you.', 'ขอบคุณค่ะ'],
      [
        'Clerk',
        "Hello, ma'am. May I help you?",
        'สวัสดีค่ะคุณผู้หญิง ให้ช่วยอะไรไหมคะ',
      ],
      [
        'Customer',
        "Yes. I bought this purse last week, and now the zipper doesn't work properly. Can I get my money back?",
        'ค่ะ ฉันซื้อกระเป๋าใบนี้เมื่ออาทิตย์ที่แล้ว แล้วตอนนี้ซิปมันเสีย ขอคืนเงินได้ไหมคะ',
      ],
      [
        'Clerk',
        "Oh, I'm so sorry, ma'am, but our store does not have a refund policy. You may exchange it for another purse.",
        'โอ้ ขอโทษด้วยจริงๆ ค่ะ ทางร้านเราไม่มีนโยบายคืนเงินค่ะ แต่เปลี่ยนเป็นกระเป๋าใบอื่นได้ค่ะ',
      ],
      [
        'Customer',
        'Do I have to get another purse?',
        'ต้องเปลี่ยนเป็นกระเป๋าอีกใบเท่านั้นเหรอคะ',
      ],
      [
        'Clerk',
        'No, not actually. You can exchange it for any item of equal price.',
        'ไม่จำเป็นค่ะ คุณเปลี่ยนเป็นสินค้าอื่นที่ราคาเท่ากันก็ได้ค่ะ',
      ],
      [
        'Customer',
        'Well, that sounds good. May I take a look around?',
        'งั้นก็ดีค่ะ ขอเดินดูรอบๆ ได้ไหมคะ',
      ],
      ['Clerk', 'Yes, of course. Take your time.', 'ได้เลยค่ะ ค่อยๆ ดูนะคะ'],
      [
        'Customer',
        "Could I see some of your women's wallets?",
        'ขอดูกระเป๋าสตางค์ผู้หญิงหน่อยได้ไหมคะ',
      ],
      [
        'Clerk',
        'Yes, actually, yesterday we just received a shipment of some really nice leather wallets, for men and women.',
        'ได้ค่ะ พอดีเมื่อวานเราเพิ่งได้กระเป๋าหนังสวยๆ ล็อตใหม่มา มีทั้งของผู้ชายและผู้หญิงค่ะ',
      ],
      [
        'Customer',
        'May I see the wallets that snap closed?',
        'ขอดูกระเป๋าสตางค์แบบมีกระดุมล็อกหน่อยได้ไหมคะ',
      ],
      [
        'Clerk',
        'Sure, what color would you like — brown or black?',
        'ได้ค่ะ อยากได้สีอะไรคะ สีน้ำตาลหรือสีดำ',
      ],
      ['Customer', 'Brown sounds nice.', 'สีน้ำตาลดูดีนะคะ'],
      ['Clerk', 'Follow me, please.', 'เชิญตามมาทางนี้ค่ะ'],
    ],
  },
  {
    key: 'lst4-unit9-phone-sales',
    title: 'Unit 9: Making Sales on the Phone',
    emoji: '☎️',
    lines: [
      [
        'Stephanie',
        'Hello, P&J Flowers. This is Stephanie speaking.',
        'สวัสดีค่ะ ร้านดอกไม้พีแอนด์เจ ฉันสเตฟานีค่ะ',
      ],
      [
        'Lee',
        'Hello. I would like to order a dozen roses.',
        'สวัสดีครับ ผมอยากสั่งกุหลาบหนึ่งโหลครับ',
      ],
      [
        'Stephanie',
        'Would you like it in a box or a bouquet?',
        'อยากได้แบบใส่กล่องหรือช่อดอกไม้คะ',
      ],
      [
        'Lee',
        'I would like a dozen red roses in a box, with a card that says "I love you, from Lee."',
        'ผมอยากได้กุหลาบแดงหนึ่งโหลใส่กล่อง พร้อมการ์ดเขียนว่า "ผมรักคุณ จากลี" ครับ',
      ],
      [
        'Stephanie',
        'How sweet. Would you like anything else with it? Perhaps a box of chocolates or a teddy bear?',
        'หวานจังเลยค่ะ อยากได้อะไรเพิ่มไหมคะ ช็อกโกแลตหรือตุ๊กตาหมีสักตัวไหมคะ',
      ],
      ['Lee', 'No, thank you.', 'ไม่ล่ะครับ ขอบคุณ'],
      ['Stephanie', 'When are you going to pick it up?', 'จะมารับเมื่อไหร่คะ'],
      [
        'Lee',
        'No, um, I would like those delivered by 7:00 p.m. to Miss Melanie Larson, at 133 Sequoia Lane, in Glendale.',
        'ไม่ครับ เอ่อ ผมอยากให้จัดส่งภายในหนึ่งทุ่มไปที่คุณเมลานี ลาร์สัน บ้านเลขที่ 133 ถนนซีควอยา เลน เมืองเกลนเดลครับ',
      ],
      [
        'Stephanie',
        "Could you spell 'Sequoia' for me?",
        'ช่วยสะกดคำว่า "Sequoia" ให้หน่อยได้ไหมคะ',
      ],
      ['Lee', 'Certainly. S-E-Q-U-O-I-A.', 'ได้ครับ S-E-Q-U-O-I-A'],
      [
        'Stephanie',
        'Thank you. The delivery will be arranged.',
        'ขอบคุณค่ะ ทางร้านจะจัดส่งให้เลยนะคะ',
      ],
      ['Lee', 'Excuse me. How much is that?', 'ขอโทษนะครับ ราคาเท่าไหร่ครับ'],
      ['Stephanie', 'That will be $70.', 'ราคา 70 ดอลลาร์ค่ะ'],
      [
        'Lee',
        "Okay. Since I'm not in town, can I pay by my Visa card?",
        'โอเคครับ เนื่องจากผมไม่อยู่ในเมือง ขอจ่ายด้วยบัตรวีซ่าได้ไหมครับ',
      ],
      [
        'Stephanie',
        'Sure. May I have your credit card information?',
        'ได้ค่ะ ขอข้อมูลบัตรเครดิตหน่อยได้ไหมคะ',
      ],
      [
        'Lee',
        "Yes. My name is Lee King. I'll use my Visa card. The number is 7543 2811 3049 7227. That expires December 25th, 2002.",
        'ได้ครับ ผมชื่อลี คิง จะใช้บัตรวีซ่า หมายเลข 7543 2811 3049 7227 หมดอายุวันที่ 25 ธันวาคม 2002 ครับ',
      ],
      ['Stephanie', 'Thank you very much.', 'ขอบคุณมากค่ะ'],
      ['Lee', 'Thank you.', 'ขอบคุณครับ'],
      [
        'Claire',
        'Hello, MA Books. This is Claire speaking. How can I help you?',
        'สวัสดีค่ะ ร้านหนังสือ MA ฉันแคลร์ค่ะ มีอะไรให้ช่วยไหมคะ',
      ],
      [
        'Andrew',
        "Yes, I'm looking for J.R.R. Tolkien's Lord of the Rings trilogy. Do you have it in stock?",
        'ครับ ผมกำลังหาไตรภาค The Lord of the Rings ของ เจ.อาร์.อาร์. โทลคีน มีของอยู่ไหมครับ',
      ],
      [
        'Claire',
        "Just a moment while I check our inventory, sir. Yes, we have the trilogy in stock. You'd like one set, I assume?",
        'รอสักครู่นะคะ ดิฉันขอเช็คสต๊อกก่อน มีค่ะ เรามีไตรภาคชุดนี้อยู่ คิดว่าคุณคงต้องการชุดเดียวใช่ไหมคะ',
      ],
      [
        'Andrew',
        'Actually, I would like two sets, please.',
        'จริงๆ แล้วผมอยากได้สองชุดครับ',
      ],
      [
        'Claire',
        'Okay. Two sets at $17 each, plus $4 for shipping, comes to $38. May I have your credit card information?',
        'โอเคค่ะ สองชุด ชุดละ 17 ดอลลาร์ บวกค่าส่ง 4 ดอลลาร์ รวมเป็น 38 ดอลลาร์ค่ะ ขอข้อมูลบัตรเครดิตหน่อยได้ไหมคะ',
      ],
      [
        'Andrew',
        "Yes. My name is Andrew Arnold, and I'll be using Mastercard. The card number is 7160 4218 9397 1432, with the expiration date July 15th, 2004.",
        'ได้ครับ ผมชื่อแอนดรูว์ อาร์โนลด์ จะใช้บัตรมาสเตอร์การ์ด หมายเลข 7160 4218 9397 1432 หมดอายุวันที่ 15 กรกฎาคม 2004 ครับ',
      ],
      [
        'Claire',
        'I also need your home address, phone number, and email, please.',
        'ขอที่อยู่บ้าน เบอร์โทรศัพท์ และอีเมลด้วยนะคะ',
      ],
      [
        'Andrew',
        'Okay, my address is 10/4 Parkwood, Baltimore, and my phone number is 410-488-3297.',
        'ได้ครับ ที่อยู่ผมคือ 10/4 พาร์กวูด เมืองบัลติมอร์ เบอร์โทร 410-488-3297 ครับ',
      ],
      [
        'Claire',
        'Okay, may I have your zip code, please?',
        'โอเคค่ะ ขอรหัสไปรษณีย์หน่อยได้ไหมคะ',
      ],
      [
        'Andrew',
        'Oh, my zip code is 21206.',
        'อ้อ รหัสไปรษณีย์ผมคือ 21206 ครับ',
      ],
      ['Claire', 'And your email?', 'แล้วอีเมลล่ะคะ'],
      [
        'Andrew',
        'My email address is m-f-l-i-m-s at hotmail dot com.',
        'อีเมลผมคือ เอ็ม-เอฟ-แอล-ไอ-เอ็ม-เอส แอท ฮอตเมล ดอท คอม ครับ',
      ],
      [
        'Claire',
        "Great. Okay, I'll get those books out today, and you should receive them within the next 3 days.",
        'ดีเลยค่ะ วันนี้ดิฉันจะจัดส่งหนังสือให้เลย คุณจะได้รับภายใน 3 วันค่ะ',
      ],
      ['Andrew', 'Thank you.', 'ขอบคุณครับ'],
      [
        'Claire',
        "You're welcome, and thank you for shopping at MA Books. Goodbye.",
        'ยินดีค่ะ ขอบคุณที่อุดหนุนร้าน MA Books นะคะ สวัสดีค่ะ',
      ],
      [
        'Clerk',
        'Hello, PNS. How may I help you?',
        'สวัสดีค่ะ ร้าน PNS มีอะไรให้ช่วยไหมคะ',
      ],
      [
        'Customer',
        'I would like to order set menus for five, please.',
        'ฉันอยากสั่งเซ็ตเมนูสำหรับห้าคนค่ะ',
      ],
      [
        'Clerk',
        'Yes, we currently have regular five-course menus priced at $5 — your choice between beef, chicken, vegetarian, or fish.',
        'ได้ค่ะ ตอนนี้เรามีเซ็ตเมนูห้าคอร์สราคา 5 ดอลลาร์ เลือกได้ระหว่างเนื้อวัว ไก่ มังสวิรัติ หรือปลาค่ะ',
      ],
      [
        'Customer',
        'And what is included in the five-course meal?',
        'แล้วในเซ็ตห้าคอร์สมีอะไรบ้างคะ',
      ],
      [
        'Clerk',
        "Well, there's rice, soup, a stir-fried dish, a main course, and a dessert.",
        'มีข้าว ซุป กับข้าวผัด อาหารจานหลัก และของหวานค่ะ',
      ],
      [
        'Customer',
        'How long would it take to deliver?',
        'ใช้เวลาส่งนานแค่ไหนคะ',
      ],
      [
        'Clerk',
        'The delivery time ranges between 10 to 30 minutes, depending on the location. Where would you like it delivered to?',
        'เวลาจัดส่งอยู่ที่ประมาณ 10 ถึง 30 นาที ขึ้นอยู่กับสถานที่ค่ะ จะให้ส่งไปที่ไหนคะ',
      ],
      [
        'Customer',
        'The address is the National Bank, on the second floor of the MM Building, on Thompson Street.',
        'ที่อยู่คือธนาคารเนชั่นแนล ชั้นสองของตึก MM บนถนนธอมป์สันค่ะ',
      ],
      [
        'Clerk',
        'And may I have your phone number, please?',
        'ขอเบอร์โทรศัพท์หน่อยได้ไหมคะ',
      ],
      ['Customer', "Yes, it's 5859-2348.", 'ได้ค่ะ เบอร์ 5859-2348 ค่ะ'],
      [
        'Clerk',
        'The total bill will be $25. Please have it ready.',
        'ยอดรวมทั้งหมด 25 ดอลลาร์ค่ะ เตรียมเงินไว้ให้พร้อมด้วยนะคะ',
      ],
      ['Customer', 'Thank you.', 'ขอบคุณค่ะ'],
      [
        'Clerk',
        'Thank you for ordering from PNS. Bye-bye.',
        'ขอบคุณที่สั่งจาก PNS นะคะ สวัสดีค่ะ',
      ],
      ['Customer', 'Bye.', 'บายค่ะ'],
    ],
  },
  {
    key: 'lst4-unit10-unsatisfied',
    title: 'Unit 10: Dealing With an Unsatisfied Customer',
    emoji: '😠',
    lines: [
      [
        'Clerk',
        'Oh, good morning. May I help you?',
        'อ้อ สวัสดีตอนเช้าครับ มีอะไรให้ช่วยไหมครับ',
      ],
      [
        'Customer',
        'Yes. I would like an explanation on how the extra-large shirt that I bought two days ago now looks like an extra-small shirt after just one wash.',
        'ค่ะ ฉันอยากได้คำอธิบายหน่อยว่าทำไมเสื้อไซส์ XL ที่ฉันซื้อไปเมื่อสองวันก่อน ซักแค่ครั้งเดียวกลับกลายเป็นไซส์ XS ไปได้ยังไงคะ',
      ],
      [
        'Clerk',
        "Ma'am, may I see the shirt?",
        'คุณลูกค้าครับ ขอดูเสื้อหน่อยได้ไหมครับ',
      ],
      [
        'Customer',
        'Yes, you may see the extra-small shirt.',
        'ได้ค่ะ นี่เสื้อไซส์ XS ค่ะ',
      ],
      [
        'Clerk',
        "It's amazing how much it shrunk.",
        'หดขนาดนี้เลยเหรอครับ น่าทึ่งจริงๆ',
      ],
      [
        'Customer',
        "Yes, it is. It's now the right size for my young son.",
        'ใช่ค่ะ ตอนนี้มันพอดีกับลูกชายตัวเล็กๆ ของฉันเลย',
      ],
      [
        'Clerk',
        'Did you read the washing directions before you did your laundry?',
        'คุณอ่านคำแนะนำการซักผ้าก่อนซักไหมครับ',
      ],
      [
        'Customer',
        'No, I just washed it in hot water with all the rest of my clothes.',
        'ไม่ค่ะ ฉันแค่เอาไปซักกับผ้าอื่นๆ ด้วยน้ำร้อนเลย',
      ],
      [
        'Clerk',
        "The washing directions clearly indicate that you shouldn't wash it in hot water.",
        'คำแนะนำเขียนไว้ชัดเจนเลยครับว่าห้ามซักด้วยน้ำร้อน',
      ],
      ['Customer', 'Really?', 'จริงเหรอคะ'],
      [
        'Clerk',
        "Yes. I'm sorry, I'm afraid there's nothing I can do to help you.",
        'ใช่ครับ ขอโทษด้วยจริงๆ ผมเกรงว่าจะช่วยอะไรไม่ได้เลยครับ',
      ],
      [
        'Customer',
        'Well, then I guess my son has got a new shirt.',
        'งั้นก็คงต้องบอกว่าลูกชายฉันได้เสื้อตัวใหม่ไปแล้วสินะคะ',
      ],
      [
        'Clerk',
        "Has anyone waited on you yet, ma'am?",
        'มีคนดูแลหรือยังคะคุณผู้หญิง',
      ],
      ['Customer', 'Not yet.', 'ยังเลยค่ะ'],
      ['Clerk', 'What can I help you with?', 'มีอะไรให้ช่วยคะ'],
      [
        'Customer',
        "I purchased this shirt for my husband last week, and I'd like to return it.",
        'ฉันซื้อเสื้อตัวนี้ให้สามีเมื่ออาทิตย์ที่แล้ว อยากจะคืนค่ะ',
      ],
      ['Clerk', 'What is the problem with the shirt?', 'เสื้อมีปัญหาอะไรคะ'],
      [
        'Customer',
        'Well, I washed it once, and the color has faded.',
        'คือฉันซักแค่ครั้งเดียว สีมันซีดไปเลยค่ะ',
      ],
      [
        'Clerk',
        'Oh, did you follow the washing instructions on the shirt tag?',
        'อ้อ คุณทำตามคำแนะนำการซักที่ป้ายเสื้อไหมคะ',
      ],
      [
        'Customer',
        'Of course. I did exactly what the instructions indicated to do.',
        'แน่นอนค่ะ ฉันทำตามที่คำแนะนำบอกไว้ทุกอย่างเลย',
      ],
      ['Clerk', 'Oh, do you have a receipt?', 'อ้อ มีใบเสร็จไหมคะ'],
      [
        'Customer',
        "Yes, here it is. I'm not too happy about this, because when the color faded, it ruined some of my other clothing.",
        'มีค่ะ นี่ค่ะ ฉันไม่ค่อยพอใจเท่าไหร่ เพราะตอนสีมันตกใส่เสื้อผ้าตัวอื่นเสียหายไปด้วยค่ะ',
      ],
      [
        'Clerk',
        "I'm very sorry to hear that. The only thing I can do is refund the price for the shirt.",
        'เสียใจด้วยจริงๆ ค่ะ สิ่งเดียวที่ดิฉันทำได้คือคืนเงินค่าเสื้อให้ค่ะ',
      ],
      [
        'Customer',
        'At least you can do that. Thank you.',
        'อย่างน้อยก็ยังทำแบบนั้นได้ ขอบคุณค่ะ',
      ],
      [
        'Clerk',
        'All right. Could you please fill out the return form?',
        'ได้ค่ะ ช่วยกรอกแบบฟอร์มขอคืนสินค้าให้หน่อยนะคะ',
      ],
    ],
  },
  {
    key: 'lst4-bonus-grammar',
    title: 'Bonus: Have vs. Has, and the Dropped "T" Sound',
    emoji: '📘',
    lines: [
      [
        'Teacher',
        "\"For 'I,' 'you,' 'we,' 'they,' and plural nouns, we use 'have' — I have, we have. But for 'she,' 'he,' 'it,' and singular nouns, we use 'has' — she has, my dad has. Remember that.\"",
        'สำหรับ I, you, we, they และคำนามพหูพจน์ เราใช้ "have" — I have, we have แต่สำหรับ she, he, it และคำนามเอกพจน์ เราใช้ "has" — she has, my dad has จำไว้นะครับ',
      ],
      [
        'Teacher',
        'I have one house. I have a house.',
        'ฉันมีบ้านหนึ่งหลัง ฉันมีบ้านหลังหนึ่ง',
      ],
      [
        'Teacher',
        'She has one apple. She has an apple.',
        'เธอมีแอปเปิลหนึ่งลูก เธอมีแอปเปิลลูกหนึ่ง',
      ],
      ['Teacher', 'We have six cars.', 'เรามีรถหกคัน'],
      ['Teacher', 'My dad has three watches.', 'พ่อฉันมีนาฬิกาสามเรือน'],
      [
        'Teacher',
        'Our apartment is on the fifth floor.',
        'อพาร์ตเมนต์ของเราอยู่ชั้นห้า',
      ],
      [
        'Teacher',
        'It was the first time I met him.',
        'นั่นเป็นครั้งแรกที่ฉันได้เจอเขา',
      ],
      [
        'Teacher',
        "How old are you? I'm 20 years old.",
        'คุณอายุเท่าไหร่ ฉันอายุ 20 ปี',
      ],
      [
        'Teacher',
        'How many students are there in your class? There are 15 students in my class.',
        'ในห้องคุณมีนักเรียนกี่คน ในห้องฉันมีนักเรียน 15 คน',
      ],
      [
        'Teacher',
        "Can we meet this Sunday, the 19th? Sure, it's fine for me. Or: Sorry, I'm busy on that day.",
        'เราเจอกันวันอาทิตย์ที่ 19 นี้ได้ไหม ได้เลย ฉันสะดวก หรือ ขอโทษนะ วันนั้นฉันติดธุระ',
      ],
      [
        'Teacher',
        'When a word ends in "t," and the next word begins with a consonant, you usually don\'t pronounce the "t" clearly — you say it quickly, almost blended in. For example: "go out now" is said quickly and smoothly.',
        'เวลาคำที่ลงท้ายด้วยเสียง "t" แล้วคำถัดไปขึ้นต้นด้วยพยัญชนะ ปกติเราจะไม่ออกเสียง "t" ให้ชัดเจน แต่จะพูดเร็วๆ กลืนเสียงไปเลย เช่น "go out now" จะพูดรวดเร็วลื่นไหล',
      ],
      ['Wife', "Honey, I'll go out now.", 'ที่รัก ฉันจะออกไปข้างนอกแล้วนะ'],
      ['Husband', 'Where will you go?', 'จะไปไหนเหรอ'],
      ['Wife', "I'll go to the shopping mall.", 'ฉันจะไปห้างสรรพสินค้าน่ะ'],
      ['Husband', 'Do you need to buy something?', 'ต้องไปซื้ออะไรเหรอ'],
      [
        'Wife',
        "Yes, I'll buy dresses and high heels.",
        'ใช่ จะไปซื้อชุดเดรสกับรองเท้าส้นสูง',
      ],
      [
        'Husband',
        "I'll go with you. I think I need some new socks.",
        'ไปด้วยกันดีกว่า ฉันว่าฉันก็ต้องการถุงเท้าคู่ใหม่เหมือนกัน',
      ],
      ['Wife', 'Which one?', 'แบบไหนล่ะ'],
      ['Husband', "I'll go with you.", 'ไปด้วยกันแหละ'],
      [
        'Wife',
        "I'll buy and take them home for you.",
        'เดี๋ยวฉันซื้อแล้วเอากลับมาบ้านให้เองก็ได้',
      ],
      ['Husband', 'So, will you go there alone?', 'งั้นเธอจะไปคนเดียวเหรอ'],
      [
        'Wife',
        "No, I'll go with Jane, one of my best friends.",
        'เปล่า ฉันจะไปกับเจน เพื่อนสนิทคนหนึ่งของฉัน',
      ],
      ['Husband', 'Okay. When will you come back?', 'โอเค แล้วจะกลับมาตอนไหน'],
      [
        'Wife',
        "Well, after shopping, I'll meet another friend, and I'll have dinner with her and Jane. So I think I'll come back by 10:30 or so.",
        'ก็หลังจากช้อปปิ้งเสร็จ ฉันจะไปเจอเพื่อนอีกคนหนึ่งด้วย แล้วจะกินมื้อเย็นกับเธอกับเจน คิดว่าคงจะกลับมาประมาณสี่ทุ่มครึ่งได้มั้ง',
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
      displayOrder: 4,
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
    `Listening seed (Lesson 4) done: units=${unitsUpserted}, lines=${linesInserted}`,
  );
  await dataSource.destroy();
}

main().catch((err) => {
  console.error('Listening seed (Lesson 4) failed:', err);
  process.exit(1);
});
