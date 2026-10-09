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

// Lesson 5 — "Easy English for Beginners — English Conversation 5"
// https://www.youtube.com/watch?v=D6FSuyaebLU
// A travel-English course: booking flights, hotel check-in, room service,
// tours, restaurant dining, and checkout, plus a closing food-vocabulary
// bonus. Only "Unit two, hotel check-in" survives as a spoken marker in the
// source captions, so other section breaks follow the cleaned transcript's
// own grouping. Start seconds are read from the auto-caption transcript's
// own timestamps at (or immediately after) each section's first line.

const LESSON_KEY = 'lesson-5';
const LESSON_TITLE = 'Lesson 5: English Conversation 5';
const LESSON_EMOJI = '✈️';

const VIDEO_ID = 'D6FSuyaebLU';

const UNIT_START_SECONDS = [11, 698, 1075, 1290, 1855, 2335, 2450];
// Approximate end of the video, after the closing food-vocabulary bonus.
const VIDEO_END_SECONDS = 2560;

type SeedLine = [speaker: string, en: string, th: string];

type SeedUnit = {
  key: string;
  title: string;
  emoji: string;
  lines: SeedLine[];
};

const UNITS: SeedUnit[] = [
  {
    key: 'lst5-unit1-flights-hotel',
    title: 'Unit 1: Booking Flights and a Hotel Room',
    emoji: '🛫',
    lines: [
      [
        'Steven',
        'Hello, Silver Airways, this is Steven speaking. May I help you?',
        'สวัสดีครับ สายการบินซิลเวอร์ แอร์เวย์ ผมสตีเวนพูดครับ มีอะไรให้ช่วยไหมครับ',
      ],
      [
        'Richard',
        "I'd like to book two round-trip tickets to Evansville.",
        'ผมอยากจองตั๋วไป-กลับสองใบไปเอวานส์วิลล์ครับ',
      ],
      [
        'Steven',
        'Okay, sir. And what is your name?',
        'ได้ครับ ขอทราบชื่อด้วยครับ',
      ],
      [
        'Richard',
        "Richard Green. I'll be traveling with my wife, June.",
        'ริชาร์ด กรีน ครับ ผมจะเดินทางไปกับภรรยา จูนครับ',
      ],
      [
        'Steven',
        'Okay, then that is Richard Green and June Green.',
        'โอเคครับ งั้นคือริชาร์ด กรีน กับจูน กรีน',
      ],
      ['Richard', 'Yes.', 'ใช่ครับ'],
      [
        'Steven',
        'Okay. Where will you be flying from?',
        'โอเคครับ จะบินออกจากที่ไหนครับ',
      ],
      [
        'Richard',
        "Chicago. You have flights out of Chicago, don't you?",
        'ชิคาโกครับ มีเที่ยวบินออกจากชิคาโกใช่ไหมครับ',
      ],
      [
        'Steven',
        'Yes, Mr. Green. Chicago is one of our main hubs. We have two daily flights between Chicago and Evansville. The morning flight departs at 7:15. It is a direct flight, but it stops at Rapid City.',
        'มีครับคุณกรีน ชิคาโกเป็นหนึ่งในศูนย์กลางหลักของเราครับ เรามีเที่ยวบินระหว่างชิคาโกกับเอวานส์วิลล์วันละสองเที่ยว เที่ยวเช้าออกตอน 7:15 น. เป็นเที่ยวบินตรง แต่จะแวะที่แรพิดซิตี้ครับ',
      ],
      [
        'Richard',
        'Do you have any nonstop flights?',
        'มีเที่ยวบินตรงแบบไม่แวะไหมครับ',
      ],
      [
        'Steven',
        'Yes, we have a nonstop flight, Chicago–Evansville, every afternoon at 16:25.',
        'มีครับ เรามีเที่ยวบินตรงชิคาโก-เอวานส์วิลล์ ทุกบ่าย เวลา 16:25 น.',
      ],
      [
        'Richard',
        "Oh, we'd really prefer traveling in the morning. Don't you have any nonstop flights in the morning?",
        'โอ้ เราอยากเดินทางตอนเช้ามากกว่าครับ มีเที่ยวบินตรงตอนเช้าไหมครับ',
      ],
      [
        'Steven',
        "No, I'm sorry, sir. Just the one flight, with the brief stop in Rapid City, and you will not have to change planes.",
        'ไม่มีครับ ขอโทษด้วย มีแค่เที่ยวเดียวที่แวะสั้นๆ ที่แรพิดซิตี้ครับ แต่คุณไม่ต้องเปลี่ยนเครื่องนะครับ',
      ],
      [
        'Richard',
        "Okay, we'll take the morning flight, Friday, June 21st.",
        'โอเคครับ เอาเที่ยวเช้า วันศุกร์ที่ 21 มิถุนายนแล้วกัน',
      ],
      [
        'Steven',
        'Okay, one moment, please. Okay, sir, we have flight seats available. Do you have a seating preference?',
        'ได้ครับ รอสักครู่นะครับ โอเคครับ มีที่นั่งว่างครับ มีที่นั่งที่ต้องการเป็นพิเศษไหมครับ',
      ],
      [
        'Richard',
        "Yes, I'd like to have a seat on the aisle. My legs are pretty long.",
        'ครับ ผมอยากได้ที่นั่งริมทางเดินครับ ขาผมค่อนข้างยาว',
      ],
      [
        'Steven',
        'Okay, sir, I know what you mean. Do you know your return date?',
        'เข้าใจครับ ทราบวันเดินทางกลับหรือยังครับ',
      ],
      [
        'Richard',
        'Is it possible for me to leave my return date open?',
        'ผมขอเว้นวันกลับไว้ก่อนได้ไหมครับ',
      ],
      [
        'Steven',
        'Yes, sir. We can leave the return date open, but the return portion of the ticket must be used within 30 days.',
        'ได้ครับ เราเว้นวันกลับไว้ก่อนได้ แต่ตั๋วขากลับต้องใช้ภายใน 30 วันนะครับ',
      ],
      ['Richard', 'Okay, that will be no problem.', 'โอเคครับ ไม่มีปัญหา'],
      [
        'Steven',
        'Okay, your tickets come to $558. How would you like to pay for them?',
        'โอเคครับ ค่าตั๋วรวม 558 ดอลลาร์ครับ จะชำระเงินยังไงดีครับ',
      ],
      [
        'Richard',
        "I'll have my secretary come pick them up. She can pay for them then.",
        'ผมจะให้เลขาฯ มารับตั๋วครับ แล้วให้เขาจ่ายเงินตอนนั้นเลย',
      ],
      [
        'Steven',
        'Okay. The tickets have to be paid one week before departure, or your reservation will be cancelled.',
        'ได้ครับ แต่ต้องชำระเงินก่อนวันเดินทางหนึ่งอาทิตย์นะครับ ไม่งั้นการจองจะถูกยกเลิก',
      ],
      [
        'Richard',
        "I'll send my secretary over this afternoon.",
        'ผมจะส่งเลขาฯ มาบ่ายนี้เลยครับ',
      ],
      [
        'Steven',
        'Okay, that will be fine. Does she know where our offices are located?',
        'ได้ครับ เลขาฯ ทราบไหมครับว่าออฟฟิศเราอยู่ที่ไหน',
      ],
      [
        'Richard',
        'Yes, she has been there before.',
        'ทราบครับ เขาเคยไปมาก่อนแล้ว',
      ],
      [
        'Steven',
        'Okay then, sir. I have two round-trip tickets in the names of Dick and June Green. The Chicago–Evansville flight — that portion of the ticket is confirmed for Friday, June 21st at 7:15.',
        'โอเคครับ ผมมีตั๋วไป-กลับสองใบในชื่อดิ๊กกับจูน กรีน เที่ยวบินชิคาโก-เอวานส์วิลล์ ยืนยันสำหรับวันศุกร์ที่ 21 มิถุนายน เวลา 7:15 น. ครับ',
      ],
      ['Richard', 'That is correct.', 'ถูกต้องครับ'],
      [
        'Steven',
        'The return portion has been left open. The total price comes to $558, and we should expect your secretary to pick the tickets up at the office this afternoon.',
        'ส่วนขากลับเว้นไว้ก่อนนะครับ ราคารวมทั้งหมด 558 ดอลลาร์ครับ แล้วก็รอเลขาฯ มารับตั๋วที่ออฟฟิศบ่ายนี้นะครับ',
      ],
      ['Richard', 'Thanks very much.', 'ขอบคุณมากครับ'],
      [
        'Steven',
        'Our pleasure, sir. I hope you enjoy flying with Silver Airways. Goodbye.',
        'ยินดีครับ หวังว่าจะได้บินกับซิลเวอร์ แอร์เวย์อย่างมีความสุขนะครับ สวัสดีครับ',
      ],
      ['Richard', 'Goodbye.', 'สวัสดีครับ'],
      [
        'Susie',
        'Good morning, Mom. What are you doing?',
        'สวัสดีตอนเช้าค่ะแม่ กำลังทำอะไรอยู่คะ',
      ],
      [
        'Ann',
        'I was thinking I should make some reservations for our trip to Evansville next month.',
        'แม่กำลังคิดว่าจะจองที่พักสำหรับทริปเอวานส์วิลล์เดือนหน้าน่ะจ้ะ',
      ],
      ['Susie', 'Sounds like a good idea.', 'ฟังดูดีนะคะ'],
      [
        'Ann',
        'Let me see... uh, Silver Airways... let me see.',
        'เดี๋ยวดูก่อน... เอ่อ ซิลเวอร์ แอร์เวย์... เดี๋ยวนะ',
      ],
      [
        'Steven',
        'Silver Airways, this is Steven speaking. How may I help you?',
        'สายการบินซิลเวอร์ แอร์เวย์ ผมสตีเวนพูดครับ มีอะไรให้ช่วยไหมครับ',
      ],
      [
        'Ann',
        "I'd like to book a flight to Evansville.",
        'ฉันอยากจองเที่ยวบินไปเอวานส์วิลล์ค่ะ',
      ],
      [
        'Steven',
        'One moment, please. What is your name, please?',
        'รอสักครู่นะครับ ขอทราบชื่อด้วยครับ',
      ],
      ['Ann', 'Mrs. Ann Rafferty.', 'คุณนายแอน ราเฟอร์ตี้ค่ะ'],
      [
        'Steven',
        'Okay, Mrs. Rafferty. Uh, could you spell your name for me, please?',
        'โอเคครับคุณนายราเฟอร์ตี้ ช่วยสะกดชื่อให้หน่อยได้ไหมครับ',
      ],
      [
        'Ann',
        'Certainly — it\'s "Ann," without an E, then Rafferty: R-A-F-F-E-R-T-Y.',
        'ได้ค่ะ ชื่อคือ "Ann" ไม่มีตัว E นะคะ แล้วก็ราเฟอร์ตี้ สะกดว่า R-A-F-F-E-R-T-Y',
      ],
      [
        'Steven',
        'Okay, thank you, Mrs. Rafferty. Will you be traveling alone?',
        'โอเคครับ ขอบคุณครับ จะเดินทางคนเดียวไหมครับ',
      ],
      [
        'Ann',
        'No, I will be traveling with my daughter. Her name is Susie.',
        'ไม่ค่ะ ฉันจะไปกับลูกสาว ชื่อซูซี่ค่ะ',
      ],
      [
        'Steven',
        'Miss Susan Rafferty — is that correct?',
        'มิสซูซาน ราเฟอร์ตี้ ใช่ไหมครับ',
      ],
      [
        'Ann',
        'That is correct, but she prefers "Ms."',
        'ใช่ค่ะ แต่เขาอยากให้เรียก "Ms." มากกว่า',
      ],
      [
        'Steven',
        'Oh, okay — Ms. Susan Rafferty. When would you like to travel, Mrs. Rafferty?',
        'อ๋อ โอเคครับ มิสซูซาน ราเฟอร์ตี้ อยากเดินทางเมื่อไหร่ครับ',
      ],
      [
        'Ann',
        'On the 21st, in the morning, if possible.',
        'วันที่ 21 ตอนเช้าถ้าเป็นไปได้ค่ะ',
      ],
      [
        'Steven',
        "Oh, I'm sorry, Mrs. Rafferty. Tuesday, May 21st is completely booked. Would you like me to check the 22nd for you?",
        'โอ้ ขอโทษด้วยครับ วันอังคารที่ 21 พฤษภาคมเต็มหมดแล้วครับ อยากให้ผมเช็ควันที่ 22 ให้ไหมครับ',
      ],
      [
        'Ann',
        "Oh, I'm sorry — I'll be traveling on June 21st, not May 21st. It's a Friday, isn't it?",
        'อ้อ ขอโทษค่ะ ฉันหมายถึงวันที่ 21 มิถุนายน ไม่ใช่พฤษภาคม เป็นวันศุกร์ใช่ไหมคะ',
      ],
      [
        'Steven',
        'One moment, please, let me check. Yes, Friday, June 21st. We have two seats available on the 8:30 a.m. flight to Evansville. Will that be a round trip?',
        'รอสักครู่นะครับ เดี๋ยวเช็คให้ ใช่ครับ วันศุกร์ที่ 21 มิถุนายน มีที่นั่งว่างสองที่บนเที่ยวบิน 8:30 น. ไปเอวานส์วิลล์ครับ จะเอาแบบไป-กลับไหมครับ',
      ],
      [
        'Ann',
        "Yes, we'd like to return on Sunday the 23rd.",
        'ค่ะ อยากกลับวันอาทิตย์ที่ 23 ค่ะ',
      ],
      [
        'Steven',
        'Okay, we have seats available returning Sunday, June 23rd at 14:30. Would you also like to book your return flight?',
        'โอเคครับ มีที่นั่งว่างขากลับวันอาทิตย์ที่ 23 มิถุนายน เวลา 14:30 น. อยากจองขากลับด้วยเลยไหมครับ',
      ],
      ['Ann', 'Yes, I would.', 'ค่ะ จองเลย'],
      [
        'Steven',
        'Okay, then. Would you like smoking or non-smoking seats?',
        'โอเคครับ อยากได้ที่นั่งสูบบุหรี่หรือปลอดบุหรี่ครับ',
      ],
      ['Ann', 'Non-smoking, please.', 'ปลอดบุหรี่ค่ะ'],
      [
        'Steven',
        'And would you prefer an aisle or a window seat?',
        'แล้วอยากได้ริมทางเดินหรือริมหน้าต่างครับ',
      ],
      [
        'Ann',
        'Just a second. — Susie, would you like a window seat?',
        'เดี๋ยวนะคะ — ซูซี่ อยากได้ริมหน้าต่างไหมจ๊ะ',
      ],
      [
        'Susie',
        'Sure, Mom, if there is one available.',
        'ได้ค่ะแม่ ถ้ามีที่ว่างนะคะ',
      ],
      ['Ann', 'Window, please.', 'ริมหน้าต่างค่ะ'],
      [
        'Steven',
        'Okay, Mrs. Rafferty, your tickets come to $428, including tax. How would you like to pay for your tickets?',
        'โอเคครับคุณนายราเฟอร์ตี้ ค่าตั๋วรวมภาษีทั้งหมด 428 ดอลลาร์ครับ จะชำระเงินยังไงดีครับ',
      ],
      [
        'Ann',
        "I'll charge them. My Visa account number is 5494 4842 4521. Expiration date January 1998.",
        'ฉันจะรูดบัตรค่ะ เลขบัญชีวีซ่าคือ 5494 4842 4521 หมดอายุมกราคม 1998 ค่ะ',
      ],
      [
        'Steven',
        'Okay, Mrs. Rafferty, you are confirmed on flight SA455, Rapid City to Evansville, Friday, 21st of June, departing 8:30 a.m., and returning flight SA456, Evansville to Rapid City, Sunday, 23rd of June, departing 14:30 in the afternoon.',
        'โอเคครับ ยืนยันเที่ยวบิน SA455 จากแรพิดซิตี้ไปเอวานส์วิลล์ วันศุกร์ที่ 21 มิถุนายน ออกเวลา 8:30 น. และเที่ยวบินขากลับ SA456 จากเอวานส์วิลล์ไปแรพิดซิตี้ วันอาทิตย์ที่ 23 มิถุนายน ออกเวลา 14:30 น. ครับ',
      ],
      [
        'Ann',
        'Thank you. Where do I pick up my tickets?',
        'ขอบคุณค่ะ แล้วจะไปรับตั๋วได้ที่ไหนคะ',
      ],
      [
        'Steven',
        'You can pick up your tickets at the Silver Airways counter when you check in for your flight.',
        'รับตั๋วได้ที่เคาน์เตอร์ซิลเวอร์ แอร์เวย์ตอนเช็คอินเที่ยวบินได้เลยครับ',
      ],
      ['Ann', 'Excuse me.', 'ขอโทษนะคะ'],
      ['Steven', "Yes, ma'am?", 'ครับ'],
      [
        'Ann',
        'How long before the departure time should we check in?',
        'ต้องเช็คอินก่อนเวลาออกเดินทางกี่ชั่วโมงคะ',
      ],
      [
        'Steven',
        'For a domestic flight, we request that you check in at least one hour before departure time. Is there anything else I can help you with?',
        'สำหรับเที่ยวบินในประเทศ เราขอให้เช็คอินก่อนอย่างน้อยหนึ่งชั่วโมงครับ มีอะไรให้ช่วยเพิ่มอีกไหมครับ',
      ],
      ['Ann', 'No, thank you.', 'ไม่ล่ะค่ะ ขอบคุณ'],
      [
        'Steven',
        'Well, then, I hope you have a pleasant trip to Evansville, and please call us again.',
        'งั้นก็หวังว่าจะเดินทางไปเอวานส์วิลล์อย่างมีความสุขนะครับ แล้วก็เรียกใช้บริการเราอีกนะครับ',
      ],
      ['Ann', 'Thank you. Goodbye.', 'ขอบคุณค่ะ สวัสดีค่ะ'],
      ['Steven', 'Goodbye.', 'สวัสดีครับ'],
      [
        'Ann',
        'He was an awfully nice young man.',
        'เขาเป็นหนุ่มที่ใจดีมากเลยนะ',
      ],
      ['Susie', 'Who was?', 'ใครคะ'],
      ['Ann', 'The man at Silver Airways.', 'คนที่ซิลเวอร์ แอร์เวย์น่ะ'],
      [
        'Susie',
        'Oh, so you got our tickets?',
        'อ๋อ แม่จองตั๋วให้เราแล้วเหรอคะ',
      ],
      [
        'Ann',
        'Yes. We are confirmed for Friday, June 21st, 8:30 a.m. And we can pick up our tickets at the counter. Do you know where we can stay in Evansville?',
        'ใช่จ้ะ ยืนยันแล้ว วันศุกร์ที่ 21 มิถุนายน 8:30 น. แล้วก็ไปรับตั๋วที่เคาน์เตอร์ได้เลย รู้ไหมว่าเราจะพักที่ไหนดีที่เอวานส์วิลล์',
      ],
      [
        'Susie',
        "Jill's mother says that the Grand is a nice hotel.",
        'แม่ของจิลบอกว่าโรงแรมแกรนด์ดีนะคะ',
      ],
      ['Ann', 'Is it downtown?', 'อยู่ใจกลางเมืองไหมจ๊ะ'],
      [
        'Susie',
        "I think it's just off the main plaza — an old hotel which has recently been redone. Um, the Grand Plaza Hotel, I think that's its full name.",
        'หนูว่าอยู่ใกล้ๆ จัตุรัสกลางเมืองค่ะ เป็นโรงแรมเก่าที่เพิ่งรีโนเวทมาไม่นาน เอ่อ โรงแรมแกรนด์ พลาซ่า หนูว่าชื่อเต็มน่าจะเป็นแบบนี้ค่ะ',
      ],
      [
        'Ann',
        'Oh, that sounds very nice. Let me see — Grand Plaza Hotel.',
        'โอ้ ฟังดูดีจังเลย เดี๋ยวดูก่อนนะ โรงแรมแกรนด์ พลาซ่า',
      ],
      [
        'Ann',
        'Hi, my name is Ann Rafferty, and I would like to make a reservation for the weekend of Friday, June 21st.',
        'สวัสดีค่ะ ฉันชื่อแอน ราเฟอร์ตี้ อยากจองห้องพักช่วงสุดสัปดาห์วันศุกร์ที่ 21 มิถุนายนค่ะ',
      ],
      [
        'Hotel Operator',
        'One moment, please, and I will connect you with reservations.',
        'รอสักครู่นะคะ เดี๋ยวต่อสายไปแผนกจองห้องพักให้ค่ะ',
      ],
      ['Ann', 'Thank you.', 'ขอบคุณค่ะ'],
      [
        'Clerk',
        'Hello, the Grand Plaza reservations desk. How may I help you?',
        'สวัสดีค่ะ แผนกจองห้องพักโรงแรมแกรนด์ พลาซ่า มีอะไรให้ช่วยไหมคะ',
      ],
      [
        'Ann',
        'Hi, my name is Ann Rafferty, and I would like to make a reservation for the weekend of Friday, June 21st.',
        'สวัสดีค่ะ ฉันชื่อแอน ราเฟอร์ตี้ อยากจองห้องพักช่วงสุดสัปดาห์วันศุกร์ที่ 21 มิถุนายนค่ะ',
      ],
      [
        'Clerk',
        'One moment, please. Yes, Mrs. Rafferty, we have rooms available on June 21st. How long do you plan to stay with us?',
        'รอสักครู่นะคะ ค่ะคุณนายราเฟอร์ตี้ เรามีห้องว่างวันที่ 21 มิถุนายนค่ะ จะพักนานแค่ไหนคะ',
      ],
      ['Ann', 'Till Sunday the 23rd.', 'ถึงวันอาทิตย์ที่ 23 ค่ะ'],
      [
        'Clerk',
        'Will you and your daughter be sharing a room?',
        'คุณกับลูกสาวจะพักห้องเดียวกันใช่ไหมคะ',
      ],
      ['Ann', 'Yes.', 'ใช่ค่ะ'],
      [
        'Clerk',
        'And Mrs. Rafferty, would you like a room looking out on Main Street?',
        'แล้วอยากได้ห้องที่มองเห็นถนนเมนสตรีทไหมคะ',
      ],
      ['Ann', 'Is there a price difference?', 'ราคาต่างกันไหมคะ'],
      [
        'Clerk',
        'Yes. Rooms facing Main Street are slightly larger than standard rooms and cost $50 a night. Standard rooms cost $40.',
        'ต่างค่ะ ห้องที่หันหน้าไปทางเมนสตรีทจะใหญ่กว่าห้องมาตรฐานนิดหน่อย ราคาคืนละ 50 ดอลลาร์ ส่วนห้องมาตรฐานราคาคืนละ 40 ดอลลาร์ค่ะ',
      ],
      [
        'Ann',
        "We'll take a room on Main Street.",
        'เอาห้องที่หันหน้าไปทางเมนสตรีทแล้วกันค่ะ',
      ],
      [
        'Clerk',
        "Mrs. Rafferty, I believe you'll be very happy with your decision. I've reserved you and your daughter a room facing Main Street, from Friday, June 21st, until Sunday, June 23rd.",
        'ดิฉันเชื่อว่าคุณจะพอใจกับการตัดสินใจนี้แน่นอนค่ะ ดิฉันจองห้องหันหน้าไปทางเมนสตรีทให้คุณกับลูกสาว ตั้งแต่วันศุกร์ที่ 21 ถึงวันอาทิตย์ที่ 23 มิถุนายนแล้วนะคะ',
      ],
      ['Ann', 'Thank you.', 'ขอบคุณค่ะ'],
      [
        'Clerk',
        'Do you know what time you expect to arrive?',
        'ทราบไหมคะว่าจะถึงประมาณกี่โมง',
      ],
      [
        'Ann',
        'Our flight arrives in the morning, and I expect to go straight to the hotel.',
        'เที่ยวบินของเราถึงตอนเช้า แล้วเราคงจะตรงมาโรงแรมเลยค่ะ',
      ],
      [
        'Clerk',
        'Okay, Mrs. Rafferty, we will expect you in the morning. Is there anything else I can help you with?',
        'โอเคค่ะ งั้นเราจะรอต้อนรับตอนเช้านะคะ มีอะไรให้ช่วยเพิ่มอีกไหมคะ',
      ],
      ['Ann', 'No, thank you.', 'ไม่ล่ะค่ะ ขอบคุณ'],
      [
        'Clerk',
        'And thank you for calling the Grand. I hope that we will be able to make your stay a pleasant one.',
        'ขอบคุณที่โทรมาหาโรงแรมแกรนด์นะคะ หวังว่าการเข้าพักของคุณจะประทับใจค่ะ',
      ],
      ['Ann', 'Thank you. Goodbye.', 'ขอบคุณค่ะ สวัสดีค่ะ'],
    ],
  },
  {
    key: 'lst5-unit2-checkin',
    title: 'Unit 2: Hotel Check-In',
    emoji: '🏨',
    lines: [
      [
        'Clerk',
        'Welcome to the Grand Plaza. How may I help you this morning?',
        'ยินดีต้อนรับสู่แกรนด์ พลาซ่าค่ะ มีอะไรให้ช่วยไหมคะ',
      ],
      [
        'Ann',
        "Hello, I'm Mrs. Ann Rafferty, and I have a reservation.",
        'สวัสดีค่ะ ฉันคุณนายแอน ราเฟอร์ตี้ มีการจองไว้ค่ะ',
      ],
      [
        'Clerk',
        'Nice to have you with us, Mrs. Rafferty. One moment while I check your reservation. Yes, Mrs. Rafferty, we have room 1206 for you. Your room is facing Main Street and gives you a view of the plaza.',
        'ยินดีต้อนรับค่ะ รอสักครู่นะคะดิฉันขอเช็คการจองก่อน ค่ะคุณนายราเฟอร์ตี้ เรามีห้อง 1206 ไว้ให้คุณค่ะ ห้องหันหน้าไปทางเมนสตรีท มองเห็นวิวจัตุรัสด้วยค่ะ',
      ],
      ['Ann', 'Thank you.', 'ขอบคุณค่ะ'],
      [
        'Clerk',
        "I have here that you'll be with us until Sunday morning — is that correct?",
        'ในระบบแจ้งว่าคุณจะพักถึงเช้าวันอาทิตย์ใช่ไหมคะ',
      ],
      ['Ann', 'Yes, it is.', 'ใช่ค่ะ'],
      [
        'Clerk',
        'Good. Now, here is your registration card.',
        'ดีค่ะ นี่แบบฟอร์มลงทะเบียนค่ะ',
      ],
      [
        'Ann',
        "Susie, could you fill this out for me, please? I don't have my glasses.",
        'ซูซี่ ช่วยกรอกให้แม่หน่อยได้ไหมจ๊ะ แม่ไม่มีแว่นตา',
      ],
      [
        'Susie',
        "Sure, Mom. — Mom, what's your passport number?",
        'ได้ค่ะแม่ — แม่คะ เลขพาสปอร์ตแม่เท่าไหร่คะ',
      ],
      [
        'Ann',
        "Oh, I don't know — I didn't bring my passport with me.",
        'อ้าว ไม่รู้สิจ๊ะ แม่ไม่ได้เอาพาสปอร์ตมาด้วย',
      ],
      [
        'Susie',
        "Excuse me, sir, we don't have a passport with us.",
        'ขอโทษนะคะ เราไม่มีพาสปอร์ตติดตัวมาค่ะ',
      ],
      [
        'Clerk',
        "That's okay. Do you have any other identification?",
        'ไม่เป็นไรค่ะ มีบัตรอื่นแสดงตัวไหมคะ',
      ],
      ['Ann', "Yes, I have my driver's license.", 'มีค่ะ ฉันมีใบขับขี่'],
      [
        'Clerk',
        "You can use your driver's license instead.",
        'ใช้ใบขับขี่แทนได้เลยค่ะ',
      ],
      [
        'Ann',
        'Thank you. — M24495799... signature...',
        'ขอบคุณค่ะ — M24495799... เซ็นชื่อ...',
      ],
      [
        'Susie',
        "Okay, Mom, you need to sign this now. — Here's the registration card.",
        'โอเคแม่ เซ็นตรงนี้เลยค่ะ — นี่ค่ะแบบฟอร์มลงทะเบียน',
      ],
      [
        'Clerk',
        "Okay, Mrs. Rafferty, your room is 1206 — this is the key. Your room is on the 12th floor, you can take the elevator over there. When you get to the 12th floor, you'll need to go out of the elevator and take the corridor to your left.",
        'โอเคค่ะคุณนายราเฟอร์ตี้ ห้องคุณคือ 1206 นี่กุญแจค่ะ ห้องอยู่ชั้น 12 ขึ้นลิฟต์ตรงโน้นได้เลยค่ะ พอถึงชั้น 12 ให้ออกจากลิฟต์แล้วเดินตามทางเดินไปทางซ้ายค่ะ',
      ],
      ['Ann', 'Where are the elevators?', 'ลิฟต์อยู่ตรงไหนจ๊ะ'],
      [
        'Susie',
        "They're over there, Mom — just beyond the man in the green coat.",
        'อยู่ตรงโน้นค่ะแม่ เลยผู้ชายที่ใส่เสื้อโค้ทสีเขียวไปนิดหนึ่ง',
      ],
      ['Ann', 'Oh, I see them now.', 'อ๋อ เห็นแล้วจ้ะ'],
      [
        'Clerk',
        "This is a brochure telling you about the facilities at the Grand Plaza, and one listing the town tours that the hotel can arrange for you, if you're interested. I'll have someone help you with your bags.",
        'นี่แผ่นพับแนะนำสิ่งอำนวยความสะดวกของแกรนด์ พลาซ่า แล้วก็อีกแผ่นเป็นทัวร์ในเมืองที่ทางโรงแรมจัดให้ได้ถ้าสนใจนะคะ เดี๋ยวดิฉันจะให้คนช่วยถือกระเป๋าให้ค่ะ',
      ],
      ['Ann', 'Thank you very much.', 'ขอบคุณมากค่ะ'],
      [
        'Clerk',
        'I hope you have a pleasant stay with us at the Grand.',
        'หวังว่าจะพักอย่างมีความสุขที่แกรนด์นะคะ',
      ],
      ['Ann', 'Thank you.', 'ขอบคุณค่ะ'],
      [
        'Clerk',
        "Welcome to the Grand Plaza. I'm sorry to have kept you waiting — how may I help you this morning?",
        'ยินดีต้อนรับสู่แกรนด์ พลาซ่าค่ะ ขอโทษที่ให้รอนะคะ มีอะไรให้ช่วยไหมคะ',
      ],
      [
        'Guest',
        'Hi there. I was wondering, do you have any rooms available for this evening?',
        'สวัสดีครับ ผมอยากทราบว่ามีห้องว่างสำหรับคืนนี้ไหมครับ',
      ],
      [
        'Clerk',
        'I believe we do. How long do you plan to stay?',
        'น่าจะมีค่ะ จะพักนานแค่ไหนคะ',
      ],
      [
        'Guest',
        "Uh, we'll be here for a few days.",
        'เอ่อ เราจะอยู่ที่นี่สักสองสามวันครับ',
      ],
      [
        'Clerk',
        'Let me check. — We have several rooms. Would you prefer a room looking out on Main Street?',
        'ขอเช็คก่อนนะคะ — เรามีห้องอยู่หลายห้องค่ะ อยากได้ห้องที่มองเห็นเมนสตรีทไหมคะ',
      ],
      [
        'Guest',
        "Yes, I suppose. But I'd really like a room close to the ground. I really don't like to be up too high.",
        'ครับ น่าจะดีนะ แต่ผมอยากได้ห้องที่อยู่ต่ำๆ ใกล้พื้นดินหน่อยครับ ผมไม่ค่อยชอบอยู่สูงๆ',
      ],
      [
        'Clerk',
        'Let me check for you again. — Yes, we have two rooms available on the fourth floor for this evening, but unfortunately those rooms still need to be made up. Do you mind waiting?',
        'ขอเช็คให้อีกทีนะคะ — มีค่ะ เรามีห้องว่างสองห้องที่ชั้นสี่สำหรับคืนนี้ แต่ห้องยังไม่ได้ทำความสะอาดค่ะ รอได้ไหมคะ',
      ],
      ['Guest', 'When will the room be ready?', 'ห้องจะเสร็จตอนไหนครับ'],
      [
        'Clerk',
        'In about an hour. Excuse me one moment.',
        'อีกประมาณหนึ่งชั่วโมงค่ะ ขอตัวสักครู่นะคะ',
      ],
      [
        'Front Desk',
        'Good morning, the front desk. How may I help you?',
        'สวัสดีค่ะ แผนกต้อนรับค่ะ มีอะไรให้ช่วยไหมคะ',
      ],
      [
        'Caller',
        "I'd like to change my arrival date.",
        'ฉันอยากเปลี่ยนวันที่จะเข้าพักค่ะ',
      ],
      [
        'Front Desk',
        "I'm sorry, ma'am. You'll need to speak with someone in reservations to change your arrival date. One moment and I'll transfer you.",
        'ขอโทษด้วยค่ะ คุณต้องคุยกับแผนกจองห้องพักเพื่อเปลี่ยนวันที่นะคะ รอสักครู่ค่ะ เดี๋ยวโอนสายให้ค่ะ',
      ],
      [
        'Clerk',
        'Sorry for the interruption, sir.',
        'ขอโทษด้วยนะคะที่ต้องรับสายก่อน',
      ],
      [
        'Mr. Simmons',
        "Oh, that's fine. Uh, I was wondering, is there someplace I could leave my bags? I'd like to go get something to eat.",
        'อ๋อ ไม่เป็นไรครับ เอ่อ ผมสงสัยว่ามีที่ให้ฝากกระเป๋าไหมครับ ผมอยากไปหาอะไรกินก่อน',
      ],
      [
        'Clerk',
        "Certainly, sir. You can leave your bags here with me, and when your room is available, I'll have someone put it in your room.",
        'ได้เลยค่ะ ฝากไว้กับดิฉันได้เลยค่ะ พอห้องพร้อมแล้ว จะให้คนเอากระเป๋าไปไว้ในห้องให้นะคะ',
      ],
      ['Mr. Simmons', 'Thank you.', 'ขอบคุณครับ'],
      [
        'Clerk',
        'Here is your registration card. Would you prefer a queen size or twin beds?',
        'นี่แบบฟอร์มลงทะเบียนค่ะ อยากได้เตียงควีนไซส์หรือเตียงคู่คะ',
      ],
      ['Mr. Simmons', 'Uh, queen size, please.', 'เอ่อ ควีนไซส์ครับ'],
      [
        'Clerk',
        'Okay — you will be in room 412. How would you like to pay for your room?',
        'โอเคค่ะ ห้องของคุณคือ 412 ค่ะ จะชำระเงินยังไงดีคะ',
      ],
      ['Mr. Simmons', 'Uh, with cash.', 'เอ่อ เงินสดครับ'],
      [
        'Clerk',
        "Okay, Mr. Simmons, if you'll check back with us in about an hour, your room should be ready, and you can pay for your room when you come to pick up your key.",
        'โอเคค่ะคุณซิมมอนส์ ถ้ากลับมาเช็คอีกทีในอีกประมาณหนึ่งชั่วโมง ห้องน่าจะพร้อมแล้ว แล้วค่อยจ่ายเงินตอนมารับกุญแจนะคะ',
      ],
      ['Mr. Simmons', 'Thank you.', 'ขอบคุณครับ'],
      [
        'Clerk',
        'I hope you enjoy your stay with us at the Grand Plaza.',
        'หวังว่าจะพักอย่างมีความสุขที่แกรนด์ พลาซ่านะคะ',
      ],
      ['Mr. Simmons', 'Thanks.', 'ขอบคุณครับ'],
      ['Clerk', 'May I help you?', 'มีอะไรให้ช่วยไหมคะ'],
      [
        'Pat',
        "Yes. I'm Pat Boen, in room 823. Could you check and see if there are any messages for me?",
        'ค่ะ ฉันแพต โบเอน อยู่ห้อง 823 ค่ะ ช่วยเช็คให้หน่อยได้ไหมคะว่ามีข้อความฝากถึงฉันบ้างไหม',
      ],
      [
        'Clerk',
        "Certainly. Just a moment. — Here you go, ma'am. Will there be anything else?",
        'ได้เลยค่ะ รอสักครู่นะคะ — นี่ค่ะ มีอะไรให้ช่วยเพิ่มอีกไหมคะ',
      ],
      [
        'Pat',
        'Could you tell me where there is a phone?',
        'ช่วยบอกหน่อยได้ไหมคะว่ามีโทรศัพท์อยู่ตรงไหนบ้าง',
      ],
      [
        'Clerk',
        "Yes, there are house phones over against the wall, and there's a public phone by the coffee shop.",
        'มีค่ะ มีโทรศัพท์ภายในโรงแรมอยู่ริมกำแพงตรงนั้น แล้วก็มีตู้โทรศัพท์สาธารณะอยู่ข้างร้านกาแฟค่ะ',
      ],
      ['Pat', 'Thank you very much.', 'ขอบคุณมากค่ะ'],
      ['Clerk', 'My pleasure.', 'ยินดีค่ะ'],
      [
        'Clerk',
        'Welcome to the Grand Plaza. How may I help you this morning?',
        'ยินดีต้อนรับสู่แกรนด์ พลาซ่าค่ะ มีอะไรให้ช่วยไหมคะ',
      ],
      ['Guest', "We'd like a room.", 'เราอยากได้ห้องพักครับ'],
      [
        'Clerk',
        'How long will you be staying in Evansville?',
        'จะพักที่เอวานส์วิลล์นานแค่ไหนคะ',
      ],
      [
        'Guest',
        "We're here for some meetings till next Friday, but we might like to spend the weekend.",
        'เรามาประชุมงานถึงวันศุกร์หน้า แต่อาจจะอยู่ต่อถึงสุดสัปดาห์ด้วยครับ',
      ],
      [
        'Clerk',
        "Let me check for you. — We're quite busy tonight. For tonight, I'm afraid we only have a few rooms available, and they have twin beds.",
        'ขอเช็คให้ก่อนนะคะ — คืนนี้ห้องค่อนข้างเต็มค่ะ เกรงว่าคืนนี้จะเหลือแค่ไม่กี่ห้อง แล้วเป็นเตียงคู่ด้วยค่ะ',
      ],
      [
        'Guest',
        "Oh, we'd really prefer a double bed.",
        'โอ้ เราอยากได้เตียงใหญ่เตียงเดียวมากกว่าครับ',
      ],
      [
        'Clerk',
        'Well, for the rest of the week, I have rooms with queen-size beds available.',
        'ถ้าเป็นวันอื่นๆ ของสัปดาห์นี้ มีห้องเตียงควีนไซส์ว่างค่ะ',
      ],
      [
        'Guest',
        'Well, I guess that is okay, if that is the best you can do.',
        'ก็คงต้องเอาแบบนั้นแล้วกันครับ ถ้านี่คือเท่าที่จะจัดให้ได้',
      ],
      [
        'Clerk',
        "We could always check with somewhere else, if you'd like.",
        'เราลองเช็คที่อื่นให้ก็ได้นะคะถ้าต้องการ',
      ],
      [
        'Guest',
        "No, no, that's okay. It's only for the one night. But I do hate to move.",
        'ไม่ๆ ไม่เป็นไรครับ แค่คืนเดียวเอง แต่ผมไม่ชอบย้ายห้องเลย',
      ],
      [
        'Clerk',
        'Well, I can check and see if we have any cancellations, and if we do, I can put you in that room.',
        'งั้นดิฉันจะเช็คดูว่ามีคนยกเลิกจองไหมนะคะ ถ้ามีจะจัดห้องนั้นให้เลยค่ะ',
      ],
      ['Guest', 'Oh, that would be great. Thank you.', 'โอ้ ดีเลยครับ ขอบคุณ'],
      [
        'Clerk',
        "Here's your registration card. Your room should be available around noon time. How would you like to pay for your room?",
        'นี่แบบฟอร์มลงทะเบียนค่ะ ห้องน่าจะพร้อมประมาณเที่ยงนะคะ จะชำระเงินยังไงดีคะ',
      ],
      ['Guest', "We'll charge it.", 'เราจะรูดบัตรครับ'],
      [
        'Clerk',
        'Okay, sir. Can I have your credit card and a form of identification?',
        'โอเคค่ะ ขอบัตรเครดิตกับบัตรแสดงตัวหน่อยได้ไหมคะ',
      ],
      ['Guest', 'Here you go.', 'นี่ครับ'],
      [
        'Clerk',
        'Would you like to check into a room with twin beds now, or wait and see if we have any cancellation?',
        'อยากเช็คอินห้องเตียงคู่เลยตอนนี้ หรือรอดูก่อนว่าจะมีคนยกเลิกจองไหมคะ',
      ],
      [
        'Guest',
        "Oh, we can wait. We're just on our way to a meeting. But is there someplace we can leave our bags?",
        'โอ้ รอได้ครับ เรากำลังจะไปประชุมพอดี แต่มีที่ให้ฝากกระเป๋าไหมครับ',
      ],
      [
        'Clerk',
        "Certainly, sir. You can leave your bags here with me. Here are your cards, and we'll see you again later this evening, and I'll try to have a room with a queen-size bed for you.",
        'ได้เลยค่ะ ฝากไว้กับดิฉันได้เลยค่ะ นี่บัตรของคุณค่ะ แล้วเจอกันเย็นนี้นะคะ ดิฉันจะพยายามจัดห้องเตียงควีนไซส์ให้ค่ะ',
      ],
      [
        'Guest',
        "Thank you very much. You're being so helpful.",
        'ขอบคุณมากครับ คุณช่วยเหลือดีมากเลย',
      ],
      [
        'Clerk',
        'My pleasure. I hope you enjoy your stay with us at the Grand Plaza.',
        'ยินดีค่ะ หวังว่าจะพักอย่างมีความสุขที่แกรนด์ พลาซ่านะคะ',
      ],
    ],
  },
  {
    key: 'lst5-unit3-room-service',
    title: 'Unit 3: Ordering Room Service',
    emoji: '🛎️',
    lines: [
      ['Room Service', 'Hello, room service.', 'สวัสดีค่ะ รูมเซอร์วิสค่ะ'],
      [
        'Guest',
        "Hi. I'd like to get something to drink.",
        'สวัสดีครับ ผมอยากได้เครื่องดื่มสักอย่างครับ',
      ],
      [
        'Room Service',
        'A beverage or a cocktail, sir?',
        'เป็นเครื่องดื่มทั่วไปหรือค็อกเทลคะ',
      ],
      [
        'Guest',
        "Oh, I'm not quite sure. What do you have?",
        'อ้อ ผมยังไม่แน่ใจครับ มีอะไรบ้างครับ',
      ],
      [
        'Room Service',
        'We have a wide selection of both hot and cold drinks, as well as cocktails, wines, and beers. Have you had a chance to look at the room service menu? There should be one on your nightstand.',
        'เรามีเครื่องดื่มร้อนและเย็นให้เลือกหลากหลาย รวมถึงค็อกเทล ไวน์ และเบียร์ด้วยค่ะ ได้ดูเมนูรูมเซอร์วิสหรือยังคะ น่าจะมีวางอยู่บนโต๊ะข้างเตียงค่ะ',
      ],
      [
        'Guest',
        'Oh, uh, let me see... Oh yes, I see the menu.',
        'อ้อ เอ่อ ขอดูก่อนนะ... อ้อ ใช่ เห็นเมนูแล้วครับ',
      ],
      [
        'Room Service',
        "Give me a minute, and I'll call you back.",
        'ขอเวลาสักครู่นะคะ เดี๋ยวโทรกลับมาค่ะ',
      ],
      ['Guest', 'Okay, thank you.', 'โอเคครับ ขอบคุณ'],
      [
        'Room Service',
        'Hello, room service. How may I help you?',
        'สวัสดีค่ะ รูมเซอร์วิสค่ะ มีอะไรให้ช่วยไหมคะ',
      ],
      [
        'Guest',
        "Hi, I'd like a sandwich. Can you deliver that to the pool?",
        'สวัสดีครับ ผมอยากได้แซนด์วิชครับ ส่งไปที่สระว่ายน้ำได้ไหมครับ',
      ],
      [
        'Room Service',
        "I'm sorry, you will have to order that from the service bar at the pool. Would you like me to transfer you?",
        'ขอโทษด้วยค่ะ ต้องสั่งจากบาร์บริการที่สระว่ายน้ำโดยตรงนะคะ อยากให้โอนสายไปให้ไหมคะ',
      ],
      [
        'Guest',
        "No, I guess I'll just order it when I get down there. Thanks anyway.",
        'ไม่ล่ะครับ ผมไปสั่งเองตอนลงไปถึงแล้วกัน ขอบคุณนะครับ',
      ],
      [
        'Room Service',
        'No problem. I hope you enjoy your time at the pool.',
        'ไม่เป็นไรค่ะ ขอให้สนุกกับสระว่ายน้ำนะคะ',
      ],
      ['Guest', 'Thanks. Bye.', 'ขอบคุณครับ บาย'],
      ['Room Service', 'Hello, room service.', 'สวัสดีค่ะ รูมเซอร์วิสค่ะ'],
      [
        'Mr. Simmons',
        "Hi, I'd like a fruit plate and some yogurt.",
        'สวัสดีครับ ผมอยากได้จานผลไม้กับโยเกิร์ตครับ',
      ],
      [
        'Room Service',
        'Okay — fruit plate and yogurt. Plain or strawberry?',
        'ได้ค่ะ จานผลไม้กับโยเกิร์ต เอาแบบธรรมดาหรือสตรอว์เบอร์รี่คะ',
      ],
      [
        'Mr. Simmons',
        'Uh, what kind of fruit is on the fruit plate?',
        'เอ่อ จานผลไม้มีผลไม้อะไรบ้างครับ',
      ],
      [
        'Room Service',
        'Melon, a banana, and some berries.',
        'มีเมล่อน กล้วย แล้วก็เบอร์รี่ค่ะ',
      ],
      [
        'Mr. Simmons',
        "Oh, I'll have the plain yogurt then.",
        'อ้อ งั้นเอาโยเกิร์ตธรรมดาแล้วกันครับ',
      ],
      [
        'Room Service',
        'Okay, sir, and your room number?',
        'ได้ค่ะ ห้องหมายเลขอะไรคะ',
      ],
      ['Mr. Simmons', 'Room 412.', 'ห้อง 412 ครับ'],
      ['Room Service', 'Anything else, sir?', 'มีอะไรเพิ่มอีกไหมคะ'],
      ['Mr. Simmons', 'No, thank you.', 'ไม่ล่ะครับ ขอบคุณ'],
      ['Room Service', 'That will be 15 minutes.', 'อีกประมาณ 15 นาทีนะคะ'],
      ['Mr. Simmons', 'Thank you.', 'ขอบคุณครับ'],
      ['Room Service', 'Hello, room service.', 'สวัสดีค่ะ รูมเซอร์วิสค่ะ'],
      [
        'Guest',
        "Hi, I'm sorry, I'm whispering — my wife's in the bathroom, and I don't want her to hear.",
        'สวัสดีครับ ขอโทษนะที่ผมกระซิบพูด ภรรยาผมอยู่ในห้องน้ำ ผมไม่อยากให้เขาได้ยินครับ',
      ],
      [
        'Room Service',
        'Okay, sir, how can I help you?',
        'ได้ค่ะ มีอะไรให้ช่วยคะ',
      ],
      [
        'Guest',
        'I was wondering, could you bring some wine and flowers up to our room?',
        'ผมอยากรู้ว่าช่วยเอาไวน์กับดอกไม้มาส่งที่ห้องได้ไหมครับ',
      ],
      [
        'Room Service',
        'Mm, okay, sir, that is no problem.',
        'ค่ะ ได้เลยค่ะ ไม่มีปัญหาเลยค่ะ',
      ],
      [
        'Guest',
        "No, I mean while we're out. I wanted it to be here when we get back from shopping.",
        'ไม่ใช่ครับ ผมหมายถึงตอนที่เราออกไปข้างนอก ผมอยากให้มันมาถึงตอนที่เรากลับจากช้อปปิ้งพอดี',
      ],
      [
        'Room Service',
        "Yes, I think we can do that. Do you know what time you'll be getting back?",
        'ได้ค่ะ น่าจะจัดให้ได้ ทราบไหมคะว่าจะกลับมาประมาณกี่โมง',
      ],
      ['Guest', 'Oh, about 4:00 in the afternoon.', 'อ้อ ประมาณบ่ายสี่โมงครับ'],
      [
        'Room Service',
        'I could have the wine delivered at, say, 3:45. Would that be convenient?',
        'งั้นดิฉันจะให้ส่งไวน์ตอนประมาณบ่ายสามโมงสี่สิบห้า สะดวกไหมคะ',
      ],
      ['Guest', 'Yeah, that would be great.', 'ครับ ดีเลยครับ'],
      [
        'Room Service',
        'Okay, sir, have you made a wine selection?',
        'ได้ค่ะ เลือกไวน์ไว้แล้วหรือยังคะ',
      ],
      [
        'Guest',
        "Oh, no, I'm sorry, I don't know much about wines. My wife likes red wines — could you pick one out for us? Something not too expensive.",
        'อ้อ ยังเลยครับ ขอโทษด้วย ผมไม่ค่อยรู้เรื่องไวน์เท่าไหร่ ภรรยาผมชอบไวน์แดง ช่วยเลือกให้หน่อยได้ไหมครับ ไม่ต้องแพงมากก็ได้',
      ],
      [
        'Room Service',
        'Certainly, sir. How about a nice bottle of burgundy? It will cost about $25.',
        'ได้เลยค่ะ ไวน์เบอร์กันดี้สักขวดเป็นไงคะ ราคาประมาณ 25 ดอลลาร์ค่ะ',
      ],
      ['Guest', 'That sounds great.', 'ฟังดูดีเลยครับ'],
      [
        'Room Service',
        'And would you like some cheese and crackers with that?',
        'อยากได้ชีสกับแครกเกอร์เพิ่มด้วยไหมคะ',
      ],
      ['Guest', "That's a great idea.", 'ไอเดียดีเลยครับ'],
      [
        'Room Service',
        'So — flowers, wine, cheese, and crackers, at 3:45 this afternoon?',
        'งั้นสรุปคือ ดอกไม้ ไวน์ ชีส และแครกเกอร์ ส่งบ่ายสามโมงสี่สิบห้าใช่ไหมคะ',
      ],
      ['Guest', 'Yes.', 'ใช่ครับ'],
      ['Room Service', 'And what is your room number?', 'ห้องหมายเลขอะไรคะ'],
      [
        'Guest',
        "Oh, yes — we're in the honeymoon suite.",
        'อ้อ ใช่ เราอยู่ห้องฮันนีมูนสวีทครับ',
      ],
      [
        'Room Service',
        'Okay, sir. Thank you for calling room service.',
        'ได้ค่ะ ขอบคุณที่ใช้บริการรูมเซอร์วิสนะคะ',
      ],
      [
        'Guest',
        "Hey, thanks for your help. My wife's coming. Bye.",
        'โอเค ขอบคุณที่ช่วยเหลือนะครับ ภรรยาผมมาแล้ว บายครับ',
      ],
      ['Room Service', 'Hello, room service.', 'สวัสดีค่ะ รูมเซอร์วิสค่ะ'],
      [
        'Mr. Simmons',
        'Hi, this is Mr. Simmons, in room 412.',
        'สวัสดีครับ ผมมิสเตอร์ซิมมอนส์ ห้อง 412 ครับ',
      ],
      ['Room Service', 'Yes, Mr. Simmons.', 'ค่ะคุณซิมมอนส์'],
      [
        'Mr. Simmons',
        'I just placed an order for some fruit and yogurt. Could you send me some tea as well?',
        'ผมเพิ่งสั่งผลไม้กับโยเกิร์ตไปครับ ช่วยส่งชาเพิ่มมาด้วยได้ไหมครับ',
      ],
      [
        'Room Service',
        "Sure, Mr. Simmons, I'll add that to your order.",
        'ได้เลยค่ะคุณซิมมอนส์ ดิฉันจะเพิ่มให้ในออเดอร์เดิมนะคะ',
      ],
      ['Mr. Simmons', 'Thank you.', 'ขอบคุณครับ'],
      ['Room Service', 'Thank you. Bye.', 'ขอบคุณค่ะ บายค่ะ'],
    ],
  },
  {
    key: 'lst5-unit4-tours',
    title: 'Unit 4: Tours and City Outings',
    emoji: '🗺️',
    lines: [
      [
        'Tour Desk',
        'Good afternoon. How may I help you?',
        'สวัสดีตอนบ่ายค่ะ มีอะไรให้ช่วยไหมคะ',
      ],
      [
        'Paul',
        "Hi, I'm interested in seeing the city. Do you have any tours available?",
        'สวัสดีครับ ผมสนใจเที่ยวชมเมืองครับ มีทัวร์ให้เลือกไหมครับ',
      ],
      [
        'Tour Desk',
        'Yes, we have several. When would you like to take a tour?',
        'มีค่ะ มีหลายทัวร์เลย อยากไปทัวร์วันไหนคะ',
      ],
      [
        'Paul',
        "Saturday. I'm going to be in business meetings all during the week, and I have a free day on Saturday.",
        'วันเสาร์ครับ ผมต้องประชุมงานทั้งสัปดาห์เลย มีวันว่างแค่วันเสาร์วันเดียวครับ',
      ],
      [
        'Tour Desk',
        'Well, then we have several tours planned for this Saturday. Are you staying here at the Grand Plaza Hotel?',
        'งั้นเรามีทัวร์วันเสาร์นี้ให้เลือกหลายแบบเลยค่ะ คุณพักที่โรงแรมแกรนด์ พลาซ่านี้ใช่ไหมคะ',
      ],
      ['Paul', 'Yes.', 'ใช่ครับ'],
      [
        'Tour Desk',
        "Well, then you'll be entitled to a 10% discount on the tour price, and the tour van can be scheduled to pick you up here.",
        'งั้นคุณจะได้ส่วนลด 10% สำหรับค่าทัวร์ แล้วรถตู้ทัวร์จะมารับที่นี่ได้เลยค่ะ',
      ],
      ['Paul', 'Oh, that sounds great.', 'โอ้ ฟังดูดีเลยครับ'],
      [
        'Tour Desk',
        'Would you prefer to take a tour of the city, or are you more interested in the surrounding area — the bay and coast?',
        'อยากไปทัวร์ในเมือง หรือสนใจพื้นที่รอบนอก อ่าวกับชายฝั่งมากกว่าคะ',
      ],
      [
        'Paul',
        'Is there much to see in Evansville?',
        'มีอะไรให้ดูเยอะไหมที่เอวานส์วิลล์ครับ',
      ],
      [
        'Tour Desk',
        'We have two tours. Tour A is a morning tour, which visits some of the main historical sites of the city and ends with a cable-car ride and lunch at the top of Evans Peak.',
        'เรามีทัวร์สองแบบค่ะ ทัวร์เอเป็นทัวร์ช่วงเช้า เที่ยวชมสถานที่ประวัติศาสตร์สำคัญของเมือง แล้วจบด้วยการนั่งกระเช้าและรับประทานอาหารกลางวันบนยอดเขาอีวานส์พีคค่ะ',
      ],
      ['Paul', 'Oh, that sounds really very nice.', 'โอ้ ฟังดูดีมากเลยครับ'],
      [
        'Tour Desk',
        'Yes. And we have a whole-day tour, Tour B, which includes the sites in Tour A, plus an afternoon visit to the art gallery and zoo. In Tour B, you would arrive back at the hotel in time for dinner.',
        'ค่ะ แล้วก็มีทัวร์เต็มวัน ทัวร์บี ซึ่งรวมสถานที่ในทัวร์เอด้วย บวกกับช่วงบ่ายไปหอศิลป์กับสวนสัตว์ค่ะ ทัวร์บีจะกลับถึงโรงแรมทันมื้อเย็นพอดีค่ะ',
      ],
      [
        'Paul',
        'Okay. What about the tours outside of the city?',
        'โอเคครับ แล้วทัวร์นอกเมืองล่ะครับ',
      ],
      [
        'Tour Desk',
        'We have a tour that takes you to the harbor, and then on a boat ride around the islands and down the coast. This tour goes from 10:00 a.m. to 2:00 p.m.',
        'เรามีทัวร์ที่พาไปท่าเรือ แล้วนั่งเรือเที่ยวรอบเกาะและชายฝั่งค่ะ ทัวร์นี้อยู่ระหว่าง 10 โมงเช้าถึงบ่ายสองโมงค่ะ',
      ],
      ['Paul', 'What about lunch?', 'แล้วอาหารกลางวันล่ะครับ'],
      ['Tour Desk', 'Lunch is served on the boat.', 'เสิร์ฟบนเรือเลยค่ะ'],
      [
        'Paul',
        'Okay, well, that sounds good. And I have another question — is there any way that I can get a shuttle to the beach from here?',
        'โอเคครับ ฟังดูดีเลย แล้วผมมีคำถามอีกข้อ มีรถรับส่งไปชายหาดจากที่นี่ไหมครับ',
      ],
      [
        'Tour Desk',
        "Yes, the hotel offers a shuttle service to and from Sandy Cove. The shuttles leave at 10, 11, and 1:30 for Sandy Cove, and return at 2, 3, and 4:30 p.m. Why don't you have a look at these brochures for a moment, while I answer the phone?",
        'มีค่ะ โรงแรมมีรถรับส่งไปแซนดี้โคฟค่ะ รถจะออกตอน 10 โมง 11 โมง และบ่ายโมงครึ่งไปแซนดี้โคฟ แล้วกลับตอนบ่ายสองโมง บ่ายสามโมง และสี่โมงครึ่งค่ะ ลองดูโบรชัวร์พวกนี้ก่อนนะคะ ระหว่างที่ดิฉันรับโทรศัพท์สักครู่',
      ],
      ['Paul', 'Okay, thank you.', 'โอเคครับ ขอบคุณ'],
      [
        'Tour Desk',
        'Hello, Tours and City Outings. How may I help you?',
        'สวัสดีค่ะ แผนกทัวร์และท่องเที่ยวในเมืองค่ะ มีอะไรให้ช่วยไหมคะ',
      ],
      [
        'Don',
        "Hi, my name is Don Barker. My wife and I scheduled an all-day city tour with you this Saturday, but I'm afraid we're going to have to cancel. My business meetings have been extended.",
        'สวัสดีครับ ผมดอน บาร์เกอร์ครับ ผมกับภรรยาจองทัวร์เที่ยวเมืองเต็มวันไว้กับคุณวันเสาร์นี้ แต่คงต้องยกเลิกครับ เพราะการประชุมงานถูกขยายเวลาออกไปครับ',
      ],
      [
        'Tour Desk',
        'Okay, Mr. Barker, would you hold on one moment, please? — Yes, I see here, Don and Diane Barker, for the Saturday City Tour. Would you like to change your reservation to Sunday, perhaps?',
        'ได้ค่ะคุณบาร์เกอร์ รอสักครู่นะคะ — ค่ะ เจอแล้วค่ะ ดอนกับไดแอน บาร์เกอร์ สำหรับทัวร์เที่ยวเมืองวันเสาร์ อยากเปลี่ยนเป็นวันอาทิตย์แทนไหมคะ',
      ],
      [
        'Don',
        "No, I'm afraid we have an early flight out on Sunday.",
        'ไม่ครับ เรามีเที่ยวบินเช้าวันอาทิตย์แล้วครับ',
      ],
      [
        'Tour Desk',
        'Oh, that is a shame. I see here that you have prepaid for your tour with your Visa card.',
        'โอ้ น่าเสียดายจังค่ะ ดิฉันเห็นว่าคุณจ่ายค่าทัวร์ล่วงหน้าด้วยบัตรวีซ่าไว้แล้วนะคะ',
      ],
      [
        'Don',
        "Yes, that's right. Could you credit my account?",
        'ใช่ครับ ช่วยคืนเงินเข้าบัญชีให้หน่อยได้ไหมครับ',
      ],
      [
        'Tour Desk',
        'Yes. I will cancel your tour and have Visa reimburse your account for the tour price, minus the $50 cancellation fee.',
        'ได้ค่ะ ดิฉันจะยกเลิกทัวร์ให้ แล้วให้วีซ่าคืนเงินเข้าบัญชี หักค่าธรรมเนียมยกเลิก 50 ดอลลาร์นะคะ',
      ],
      ['Don', 'Thank you very much.', 'ขอบคุณมากครับ'],
      [
        'Tour Desk',
        "I'm sorry that you won't be able to join the tour.",
        'เสียใจด้วยนะคะที่คุณไม่ได้ไปทัวร์',
      ],
      [
        'Don',
        'Perhaps next time. I am in Evansville for business meetings again next month.',
        'ไว้คราวหน้าแล้วกันครับ เดือนหน้าผมจะมาประชุมที่เอวานส์วิลล์อีกครับ',
      ],
      [
        'Tour Desk',
        'Well, if I can be of service, please let me know.',
        'ถ้ามีอะไรให้ช่วยอีกก็บอกได้เลยนะคะ',
      ],
      ['Don', 'I will. Goodbye now.', 'ได้ครับ สวัสดีครับ'],
      ['Tour Desk', 'Goodbye.', 'สวัสดีค่ะ'],
      [
        'Tour Desk',
        "I'm sorry about that interruption — is there a tour that you're interested in?",
        'ขอโทษด้วยนะคะที่ต้องรับสายก่อน มีทัวร์ไหนที่คุณสนใจไหมคะ',
      ],
      [
        'Paul',
        'Uh, yes. I was thinking, would it be possible for me to take the city morning Tour A and still make it back to the hotel in time to catch the 1:30 shuttle to the beach?',
        'เอ่อ ครับ ผมกำลังคิดว่าจะไปทัวร์เอตอนเช้าได้ไหม แล้วยังทันกลับมาขึ้นรถรับส่งไปชายหาดตอนบ่ายโมงครึ่งได้ไหมครับ',
      ],
      [
        'Tour Desk',
        "Yes, you should get back at about 1:00, and we can reserve a place for you on the beach shuttle, so that they'll be expecting you.",
        'ได้ค่ะ คุณน่าจะกลับมาถึงประมาณบ่ายโมง เดี๋ยวดิฉันจองที่ให้ในรถรับส่งไปชายหาดด้วยเลยนะคะ',
      ],
      [
        'Paul',
        'Okay. And it says here that Tour A costs $125 — is that correct?',
        'โอเคครับ แล้วในนี้บอกว่าทัวร์เอราคา 125 ดอลลาร์ ใช่ไหมครับ',
      ],
      [
        'Tour Desk',
        'Yes, plus tax, which brings the total to $132. The hotel beach shuttle costs $7 and will be charged to your room.',
        'ใช่ค่ะ บวกภาษีแล้วรวมเป็น 132 ดอลลาร์ค่ะ ส่วนรถรับส่งไปชายหาดของโรงแรมราคา 7 ดอลลาร์ จะเก็บเข้าบิลห้องพักค่ะ',
      ],
      [
        'Paul',
        "Okay, well, I'd like to make a reservation for both the city morning tour and the 1:30 beach shuttle.",
        'โอเคครับ งั้นผมขอจองทั้งทัวร์เช้าในเมืองและรถรับส่งชายหาดบ่ายโมงครึ่งเลยครับ',
      ],
      [
        'Tour Desk',
        'Okay, then — Tour A for this Saturday. Sir, your name is—?',
        'โอเคค่ะ ทัวร์เอวันเสาร์นี้นะคะ ขอทราบชื่อด้วยค่ะ',
      ],
      ['Paul', 'Paul Simmons.', 'พอล ซิมมอนส์ครับ'],
      [
        'Tour Desk',
        'Okay, Mr. Simmons, would you fill out this information card, please?',
        'โอเคค่ะคุณซิมมอนส์ ช่วยกรอกแบบฟอร์มนี้ให้หน่อยได้ไหมคะ',
      ],
      ['Paul', 'Yes. Here you go.', 'ได้ครับ นี่ครับ'],
      [
        'Tour Desk',
        'Okay. Thank you. And Mr. Simmons, how will you be paying for this tour?',
        'โอเคค่ะ ขอบคุณค่ะ แล้วคุณซิมมอนส์จะชำระค่าทัวร์ยังไงดีคะ',
      ],
      [
        'Paul',
        "I'll pay with cash. $132, wasn't it?",
        'ผมจ่ายเงินสดครับ 132 ดอลลาร์ใช่ไหมครับ',
      ],
      ['Tour Desk', 'Yes.', 'ใช่ค่ะ'],
      ['Paul', 'Okay.', 'โอเคครับ'],
      [
        'Tour Desk',
        "And here is your receipt. I'll go ahead and call the front desk and reserve a place for you on the 1:30 beach shuttle for this Saturday.",
        'นี่ใบเสร็จค่ะ เดี๋ยวดิฉันจะโทรแจ้งแผนกต้อนรับให้จองที่ในรถรับส่งชายหาดบ่ายโมงครึ่งวันเสาร์นี้ให้นะคะ',
      ],
      [
        'Paul',
        'And where will I meet the tour?',
        'แล้วผมจะไปขึ้นทัวร์ที่ไหนครับ',
      ],
      [
        'Tour Desk',
        "You can meet here for the tour, and the 1:30 beach shuttle leaves from the hotel's main entrance. Here, take this complimentary city map and tour brochure with you.",
        'มาขึ้นทัวร์ที่นี่ได้เลยค่ะ ส่วนรถรับส่งชายหาดบ่ายโมงครึ่งออกจากทางเข้าหลักของโรงแรมค่ะ นี่แผนที่เมืองกับโบรชัวร์ทัวร์แถมให้เลยนะคะ',
      ],
      ['Paul', 'Okay, I will. Thank you.', 'โอเคครับ ขอบคุณครับ'],
      ['Tour Desk', 'Thank you.', 'ขอบคุณค่ะ'],
      [
        'Tour Desk',
        'Hello, Tours and City Outings. How may I help you?',
        'สวัสดีค่ะ แผนกทัวร์และท่องเที่ยวในเมืองค่ะ มีอะไรให้ช่วยไหมคะ',
      ],
      [
        'Caller',
        "Hi, I'd like to book an airline ticket to Portsmith for next Tuesday.",
        'สวัสดีครับ ผมอยากจองตั๋วเครื่องบินไปพอร์ตสมิธสำหรับวันอังคารหน้าครับ',
      ],
      [
        'Tour Desk',
        "I'm sorry, but we cannot make airline reservations from this office. You could try calling the airline or a travel agent.",
        'ขอโทษด้วยค่ะ แผนกนี้ไม่สามารถจองตั๋วเครื่องบินได้นะคะ ลองโทรหาสายการบินหรือเอเจนซี่ท่องเที่ยวดูได้ค่ะ',
      ],
      [
        'Caller',
        "Thank you. I'll do that. Goodbye.",
        'ขอบคุณครับ เดี๋ยวผมลองดู สวัสดีครับ',
      ],
      ['Tour Desk', 'Goodbye.', 'สวัสดีค่ะ'],
      [
        'Tour Desk',
        'Hello. How may I help you?',
        'สวัสดีค่ะ มีอะไรให้ช่วยไหมคะ',
      ],
      [
        'Ann',
        'Hi. Hello — they told us at the front desk that you might be able to help us go around town and do some shopping.',
        'สวัสดีค่ะ ทางแผนกต้อนรับบอกว่าคุณน่าจะช่วยพาเราไปเที่ยวช้อปปิ้งในเมืองได้ค่ะ',
      ],
      [
        'Tour Desk',
        "Yes, ma'am, we offer a city shopping tour on Saturdays.",
        'ใช่ค่ะ เรามีทัวร์ช้อปปิ้งในเมืองทุกวันเสาร์ค่ะ',
      ],
      ['Ann', "What's the tour like?", 'ทัวร์เป็นยังไงบ้างคะ'],
      [
        'Tour Desk',
        'Let me show you this brochure. The tour leaves the hotel at 8:30 a.m., and we have a light breakfast at a café on the main plaza.',
        'ขอโชว์โบรชัวร์นี้ให้ดูนะคะ ทัวร์ออกจากโรงแรมตอน 8:30 น. แล้วจะไปทานอาหารเช้าเบาๆ ที่คาเฟ่ตรงจัตุรัสกลางเมืองค่ะ',
      ],
      [
        'Ann',
        'That sounds like a very nice way to start the day.',
        'ฟังดูเป็นการเริ่มวันที่ดีมากเลยค่ะ',
      ],
      [
        'Tour Desk',
        "From there, a van takes you on a brief tour of the downtown shopping district and points out some of the highlights and unique shops. That lasts until about 10:00, when we stop for coffee at Café George — knowing where the different shops are could save you a lot of time and walking. After coffee, you're free to shop until 12:30, when we'll meet again for lunch at the President Park Grill.",
        'จากนั้นรถตู้จะพาชมย่านช้อปปิ้งใจกลางเมืองสั้นๆ แล้วชี้จุดเด่นและร้านค้าน่าสนใจต่างๆ ให้ดู ไปจนถึงประมาณ 10 โมง แล้วแวะดื่มกาแฟที่คาเฟ่จอร์จ พอรู้ว่าร้านต่างๆ อยู่ตรงไหนแล้วก็จะช่วยประหยัดเวลาและแรงเดินได้เยอะเลยค่ะ หลังดื่มกาแฟก็อิสระช้อปปิ้งจนถึง 12:30 น. แล้วมาเจอกันอีกทีเพื่อทานอาหารกลางวันที่ประธาน พาร์ก กริลล์ค่ะ',
      ],
      [
        'Ann',
        "Oh, the President Park Grill — I've heard of it. They're supposed to have a very nice lunch buffet.",
        'โอ้ ประธาน พาร์ก กริลล์ ฉันเคยได้ยินชื่อค่ะ ได้ยินว่าบุฟเฟต์อาหารกลางวันเขาดีมากเลย',
      ],
      [
        'Tour Desk',
        "At 2:00, we travel out to the Harbor District, where we have a brief tour of the shopping district. Then you're free to shop until 5:30, when the van returns to the hotel.",
        'ตอนบ่ายสองโมงเราจะไปที่ย่านฮาร์เบอร์ เที่ยวชมย่านช้อปปิ้งสั้นๆ แล้วก็อิสระช้อปปิ้งจนถึง 5:30 น. รถตู้ก็จะพากลับโรงแรมค่ะ',
      ],
      [
        'Ann',
        'That sounds very nice. What do you think, Susie?',
        'ฟังดูดีมากเลยนะจ๊ะ ซูซี่คิดว่าไงจ๊ะ',
      ],
      [
        'Susie',
        "Sounds great, Mom. But you talked about wanting to see a show — if we're going shopping all day, are we still going to want to see a show?",
        'ฟังดูดีค่ะแม่ แต่แม่บอกว่าอยากดูโชว์ด้วยนี่คะ ถ้าไปช้อปปิ้งทั้งวัน เรายังจะอยากดูโชว์อยู่ไหมคะ',
      ],
      [
        'Ann',
        'Miss, would we still be able to see a show?',
        'คุณคะ เรายังจะดูโชว์ได้อยู่ไหมคะ',
      ],
      [
        'Tour Desk',
        'Actually, many people reserve tickets for the Marx Theater, down in the Harbor District.',
        'จริงๆ แล้วหลายคนจองตั๋วโรงละครมาร์กซ์ในย่านฮาร์เบอร์ไว้ด้วยนะคะ',
      ],
      ['Ann', 'Oh — why is that?', 'อ๋อ ทำไมล่ะคะ'],
      [
        'Tour Desk',
        'Well, that way they can have dinner on the harbor after shopping and stay to see the show.',
        'ก็จะได้ทานมื้อเย็นที่ท่าเรือหลังช้อปปิ้งเสร็จ แล้วอยู่ดูโชว์ต่อได้เลยค่ะ',
      ],
      [
        'Ann',
        'But how do they get back to their hotel?',
        'แล้วพวกเขากลับโรงแรมยังไงคะ',
      ],
      [
        'Tour Desk',
        'You can take a taxi back to the hotel after the show.',
        'นั่งแท็กซี่กลับโรงแรมหลังโชว์จบได้เลยค่ะ',
      ],
      ['Ann', 'What do you think, Susie?', 'ซูซี่คิดว่าไงจ๊ะ'],
      [
        'Susie',
        "I don't know. I don't want to carry whatever we buy to dinner and then to the theater.",
        'หนูไม่แน่ใจค่ะ หนูไม่อยากถือของที่ซื้อไปทานมื้อเย็นแล้วก็ไปโรงละครด้วย',
      ],
      [
        'Tour Desk',
        "Oh, that's no problem — you can always send your bags back to the hotel with the shopping tour van.",
        'อ๋อ ไม่เป็นปัญหาเลยค่ะ ส่งของกลับโรงแรมไปกับรถตู้ทัวร์ช้อปปิ้งได้เลยค่ะ',
      ],
      [
        'Ann',
        'In that case, it sounds like a good idea. What show is playing at the Marx Theater right now?',
        'ถ้างั้นก็ฟังดูเป็นไอเดียที่ดีเลยค่ะ ตอนนี้โรงละครมาร์กซ์เล่นเรื่องอะไรอยู่คะ',
      ],
      ['Tour Desk', 'Cats.', 'เรื่องแคทส์ค่ะ'],
      [
        'Susie',
        "Oh, let's do it, Mom — I've been wanting to see Cats for a long time.",
        'โอ้ เอาเลยค่ะแม่ หนูอยากดูแคทส์มานานแล้ว',
      ],
      [
        'Ann',
        'Miss, how much would the shopping tour and tickets to Cats for two cost?',
        'คุณคะ ทัวร์ช้อปปิ้งบวกตั๋วแคทส์สำหรับสองคนราคาเท่าไหร่คะ',
      ],
      [
        'Tour Desk',
        'For the shopping tour, which includes both breakfast and lunch, and orchestra seats in the center section for Cats, the total price would be $325, including tax.',
        'สำหรับทัวร์ช้อปปิ้งที่รวมทั้งอาหารเช้าและกลางวัน บวกที่นั่งชั้นออร์เคสตราตรงกลางสำหรับแคทส์ ราคารวมทั้งหมด 325 ดอลลาร์รวมภาษีแล้วค่ะ',
      ],
      [
        'Ann',
        'Can I pay for that by credit card?',
        'จ่ายด้วยบัตรเครดิตได้ไหมคะ',
      ],
      [
        'Tour Desk',
        "Yes, you can. Mrs. Rafferty, if you'd sign here, please. The shopping tour will meet in the lobby, and your tour guide, Mrs. Swan, will have your tickets for Cats for you. Be sure to bring this receipt with you.",
        'ได้ค่ะ คุณนายราเฟอร์ตี้ ช่วยเซ็นตรงนี้ด้วยนะคะ ทัวร์ช้อปปิ้งนัดเจอกันที่ล็อบบี้ค่ะ แล้วไกด์ทัวร์ของคุณ คุณนายสวอน จะเตรียมตั๋วแคทส์ไว้ให้ค่ะ อย่าลืมพกใบเสร็จนี้ไปด้วยนะคะ',
      ],
      ['Ann', "Oh, I'm so excited.", 'โอ้ ตื่นเต้นจังเลยค่ะ'],
      ['Susie', 'Me too.', 'หนูก็เหมือนกันค่ะ'],
      ['Ann', 'Thank you very much.', 'ขอบคุณมากค่ะ'],
      [
        'Tour Desk',
        'Thank you. If I can be of any help, please feel free to call.',
        'ขอบคุณค่ะ ถ้ามีอะไรให้ช่วยอีกโทรมาได้เลยนะคะ',
      ],
      ['Ann', 'Goodbye.', 'สวัสดีค่ะ'],
      ['Tour Desk', 'Goodbye.', 'สวัสดีค่ะ'],
    ],
  },
  {
    key: 'lst5-unit5-restaurant',
    title: 'Unit 5: Restaurant Reservations & Dining',
    emoji: '🍽️',
    lines: [
      [
        'Host',
        'Good evening. Can I help you, sir?',
        'สวัสดีตอนเย็นครับ มีอะไรให้ช่วยไหมครับ',
      ],
      [
        'Paul',
        "Yes, thank you. My name is Paul Simmons. I'm looking for Don Barker. I was supposed to meet him here at 6:15.",
        'ครับ ขอบคุณครับ ผมพอล ซิมมอนส์ครับ กำลังตามหาดอน บาร์เกอร์อยู่ครับ ผมนัดเจอเขาที่นี่ตอน 6:15 น. ครับ',
      ],
      [
        'Host',
        'Hm, Don Barker? Let me see... ah, yes, Mr. Barker has a reservation for 2 at 7:15.',
        'อืม ดอน บาร์เกอร์เหรอครับ ขอดูก่อนนะครับ... อ๋อ ใช่ครับ คุณบาร์เกอร์จองโต๊ะไว้สำหรับสองคนตอน 7:15 น. ครับ',
      ],
      [
        'Paul',
        'Oh, right — 7:15. Would you mind if I wait for him here at the restaurant?',
        'อ้อ จริงด้วย 7:15 น. ผมขอรอเขาที่ร้านนี้ได้ไหมครับ',
      ],
      [
        'Host',
        'No problem, sir. Just follow me, please.',
        'ได้เลยครับ เชิญตามผมมาเลยครับ',
      ],
      [
        'Host',
        "Hello, Charlie's Grill. How may I help you?",
        'สวัสดีค่ะ ชาร์ลีส์ กริลล์ค่ะ มีอะไรให้ช่วยไหมคะ',
      ],
      [
        'Janet',
        "Hi, I'd like to make reservations for Sunday dinner.",
        'สวัสดีค่ะ ฉันอยากจองโต๊ะสำหรับมื้อเย็นวันอาทิตย์ค่ะ',
      ],
      [
        'Host',
        "Just a minute, please, let me get Sunday's reservation book. — Okay, your name is—?",
        'รอสักครู่นะคะ ขอหยิบสมุดจองของวันอาทิตย์ก่อนค่ะ — โอเคค่ะ ขอทราบชื่อด้วยค่ะ',
      ],
      ['Janet', 'Woodward. Janet Woodward.', 'วูดเวิร์ดค่ะ แจเน็ต วูดเวิร์ด'],
      ['Host', 'And what time will you be arriving?', 'จะมาถึงกี่โมงคะ'],
      ['Janet', 'About 6:30.', 'ประมาณหกโมงครึ่งค่ะ'],
      [
        'Host',
        'And how many people do you expect in your party?',
        'คาดว่าจะมากันกี่คนคะ',
      ],
      [
        'Janet',
        "About 7 or 8. Um, I'm not sure if my mother will be able to join us or not.",
        'ประมาณ 7 หรือ 8 คนค่ะ เอ่อ ยังไม่แน่ใจว่าคุณแม่ฉันจะมาด้วยไหม',
      ],
      [
        'Host',
        "I'll put you down for eight. — So that's Woodward, party of 8, for 6:30 Sunday.",
        'งั้นดิฉันจะจดไว้แปดที่นั่งนะคะ — สรุปคือวูดเวิร์ด แปดที่นั่ง หกโมงครึ่งวันอาทิตย์ค่ะ',
      ],
      ['Janet', 'Yes. Thank you.', 'ค่ะ ขอบคุณค่ะ'],
      [
        'Host',
        'We look forward to seeing you then. Goodbye.',
        'รอต้อนรับนะคะ สวัสดีค่ะ',
      ],
      [
        'Host',
        'Sorry to keep you waiting. Would you like a table for two?',
        'ขอโทษที่ให้รอนะครับ ต้องการโต๊ะสองที่นั่งใช่ไหมครับ',
      ],
      [
        'Dick',
        'No, four. Although I believe we have a reservation.',
        'ไม่ครับ สี่ที่นั่ง แล้วก็ผมจองโต๊ะไว้แล้วด้วยครับ',
      ],
      ['Host', 'What is the name, please?', 'ขอทราบชื่อด้วยครับ'],
      ['Dick', 'Dick Green.', 'ดิ๊ก กรีนครับ'],
      [
        'Host',
        'Dick Green... ah, yes, I see it here — Green, a table of four at 7:30. The rest of your party has not arrived yet, but your table is ready. Would you like to be seated?',
        'ดิ๊ก กรีน... อ๋อ ใช่ครับ เจอแล้วครับ กรีน โต๊ะสี่ที่นั่ง 7:30 น. คนอื่นในกลุ่มยังมาไม่ถึง แต่โต๊ะพร้อมแล้วครับ จะนั่งรอเลยไหมครับ',
      ],
      [
        'Dick',
        'Yes. Thank you. I believe the Greens will be here any moment.',
        'ครับ ขอบคุณครับ อีกไม่นานคนอื่นๆ ในครอบครัวกรีนคงมาถึงแล้วครับ',
      ],
      ['Host', 'Follow me, please.', 'เชิญตามผมมาเลยครับ'],
      [
        'Host',
        "Welcome to Charlie's. May I help you?",
        'ยินดีต้อนรับสู่ชาร์ลีส์ครับ มีอะไรให้ช่วยไหมครับ',
      ],
      [
        'Guest',
        'We have a reservation for Green — Dick Green, 7:30, party of four.',
        'เรามีจองไว้ในชื่อกรีนครับ ดิ๊ก กรีน 7:30 น. สี่ที่นั่งครับ',
      ],
      [
        'Host',
        'Yes, Mr. Green. The other members of your party have already arrived. Let me show you to your table.',
        'ครับคุณกรีน คนอื่นในกลุ่มมาถึงแล้วครับ เดี๋ยวผมพาไปที่โต๊ะเลยครับ',
      ],
      [
        'Host',
        "Welcome to Charlie's. May I help you?",
        'ยินดีต้อนรับสู่ชาร์ลีส์ครับ มีอะไรให้ช่วยไหมครับ',
      ],
      [
        'Don',
        "Hi. Is there a Mr. Paul Simmons here waiting for me? I'm Don Barker — the bartender told me to look for him here.",
        'สวัสดีครับ มีมิสเตอร์พอล ซิมมอนส์รออยู่ที่นี่ไหมครับ ผมดอน บาร์เกอร์ครับ บาร์เทนเดอร์บอกให้มาตามหาเขาที่นี่ครับ',
      ],
      [
        'Host',
        'Ah, yes, Mr. Barker, we have a reservation for you at 7:15. Mr. Simmons arrived only a few minutes ago. Let me show you to your table.',
        'อ๋อ ใช่ครับคุณบาร์เกอร์ คุณจองโต๊ะไว้ตอน 7:15 น. มิสเตอร์ซิมมอนส์เพิ่งมาถึงเมื่อสักครู่นี้เองครับ เดี๋ยวผมพาไปที่โต๊ะเลยครับ',
      ],
      ['Don', 'Thank you.', 'ขอบคุณครับ'],
      [
        'Alex',
        "Good evening, sir. My name is Alex, and I'll be your waitress this evening. Can I get you something to drink while you wait?",
        'สวัสดีตอนเย็นค่ะ ฉันชื่ออเล็กซ์ จะเป็นพนักงานเสิร์ฟของคุณคืนนี้นะคะ รับเครื่องดื่มระหว่างรอไหมคะ',
      ],
      [
        'Paul',
        "Yes, that'd be great. I'll have a ginger ale, please.",
        'ครับ ดีเลยครับ ขอจินเจอร์เอลครับ',
      ],
      [
        'Alex',
        "Okay, one ginger ale. I'll be right back. — Here you go, sir.",
        'ได้ค่ะ จินเจอร์เอลหนึ่งแก้ว เดี๋ยวมาค่ะ — นี่ค่ะ',
      ],
      ['Paul', 'Howdy, Don.', 'ไง ดอน'],
      [
        'Don',
        'Hi, Paul. Nice to see you. Although, it seems we had a bit of a mix-up.',
        'ไง พอล ดีใจที่เจอกันนะ แต่ดูเหมือนเราจะนัดกันผิดพลาดนิดหน่อยนะ',
      ],
      [
        'Paul',
        'Ah, sorry about that. I thought we were going to meet at 6:15. My mistake.',
        'อ้อ โทษทีนะ นึกว่านัดกันตอน 6:15 ผมเข้าใจผิดเอง',
      ],
      ['Don', 'No problem.', 'ไม่เป็นไรเลย'],
      [
        'Alex',
        "Here's your ginger ale, sir. — Can I get you something to drink, sir?",
        'นี่จินเจอร์เอลของคุณค่ะ — รับเครื่องดื่มอะไรไหมคะ',
      ],
      ['Don', "Sure. I'll have a Heineken.", 'เอาสิ ขอไฮเนเก้นแก้วนึงครับ'],
      [
        'Alex',
        "One Heineken. I'll be right back to take your order.",
        'ไฮเนเก้นหนึ่งแก้วค่ะ เดี๋ยวมารับออเดอร์นะคะ',
      ],
      ['Alex', 'Are you ready to place your order?', 'พร้อมสั่งอาหารหรือยังคะ'],
      [
        'Diner',
        "I think so. Can you tell me, what's the soup of the day?",
        'น่าจะพร้อมแล้วครับ ขอถามหน่อยครับ ซุปประจำวันคืออะไรครับ',
      ],
      ['Alex', 'Cream of asparagus.', 'ครีมหน่อไม้ฝรั่งค่ะ'],
      [
        'Diner',
        "Ah, okay. I'll have a cup of cream of asparagus soup, and a T-bone steak.",
        'อ้อ โอเคครับ ขอครีมหน่อไม้ฝรั่งหนึ่งถ้วย แล้วก็ทีโบนสเต๊กครับ',
      ],
      [
        'Alex',
        'Okay, sir. And how would you like your steak done?',
        'ได้ค่ะ อยากได้สเต๊กสุกแค่ไหนคะ',
      ],
      ['Diner', 'Medium rare, please.', 'มีเดียมแรร์ครับ'],
      [
        'Alex',
        'Medium rare. Would you like a baked potato or French fries?',
        'มีเดียมแรร์ค่ะ รับมันฝรั่งอบหรือเฟรนช์ฟรายส์คะ',
      ],
      ['Diner', 'Baked potato.', 'มันฝรั่งอบครับ'],
      [
        'Alex',
        'And on your salad, would you prefer French, Italian, blue cheese, or the house dressing?',
        'แล้วสลัดอยากได้น้ำสลัดฝรั่งเศส อิตาเลียน บลูชีส หรือสูตรของร้านคะ',
      ],
      ['Diner', 'French, please.', 'ฝรั่งเศสครับ'],
      [
        'Alex',
        "Okay, sir — that's one T-bone steak with a baked potato, and French dressing on your salad, and one cup of asparagus soup.",
        'ได้ค่ะ สรุปคือทีโบนสเต๊กหนึ่งจานพร้อมมันฝรั่งอบ สลัดน้ำสลัดฝรั่งเศส และซุปหน่อไม้ฝรั่งหนึ่งถ้วยนะคะ',
      ],
      ['Diner', 'Yes, thank you.', 'ใช่ครับ ขอบคุณ'],
      ['Alex', "For you, ma'am?", 'แล้วคุณล่ะคะ'],
      [
        'Diner A',
        "I'll have the chef salad. Can you tell me, what's the house dressing like?",
        'ฉันขอเชฟสลัดค่ะ น้ำสลัดสูตรร้านเป็นยังไงบ้างคะ',
      ],
      [
        'Alex',
        "Yes, ma'am, it's a fresh vinaigrette. I'd recommend it — it's quite good.",
        'เป็นน้ำสลัดวินิเกรตสดค่ะ แนะนำเลยค่ะ อร่อยมากค่ะ',
      ],
      [
        'Diner A',
        "That sounds good to me. I'll take that. Does bread come with my salad?",
        'ฟังดูดีค่ะ เอาอันนั้นแล้วกัน แล้วสลัดมีขนมปังมาด้วยไหมคะ',
      ],
      ['Alex', "Yes, ma'am.", 'มีค่ะ'],
      ['Diner A', 'Good.', 'ดีเลยค่ะ'],
      ['Alex', "And ma'am, what can I get for you?", 'แล้วคุณล่ะคะ'],
      [
        'Diner B',
        "Miss, can you tell me, what's this Indian curry?",
        'คุณคะ ช่วยบอกหน่อยได้ไหมคะว่าแกงกะหรี่อินเดียนี่คืออะไร',
      ],
      [
        'Alex',
        'This is a chicken curry, made with potatoes, carrots, and onions, and served on a bed of rice.',
        'เป็นแกงกะหรี่ไก่ ใส่มันฝรั่ง แครอท และหัวหอม เสิร์ฟบนข้าวค่ะ',
      ],
      ['Diner B', 'Is it very spicy?', 'เผ็ดมากไหมคะ'],
      [
        'Alex',
        "It's a bit spicy, but I can ask the cook to make it less spicy for you, if that's what you prefer.",
        'เผ็ดนิดหน่อยค่ะ แต่ถ้าอยากให้เผ็ดน้อยลง ดิฉันบอกเชฟให้ได้ค่ะ',
      ],
      [
        'Diner B',
        "No, that's okay, as long as it's not too spicy.",
        'ไม่เป็นไรค่ะ ขอแค่ไม่เผ็ดเกินไปก็พอ',
      ],
      [
        'Alex',
        "No, ma'am. So, one Indian curry. — And miss, what can I get for you?",
        'ได้ค่ะ งั้นแกงกะหรี่อินเดียหนึ่งที่นะคะ — แล้วคุณล่ะคะ',
      ],
      [
        'Diner C',
        "I think I'll have the Western burger and French fries.",
        'ฉันขอเวสเทิร์นเบอร์เกอร์กับเฟรนช์ฟรายส์ค่ะ',
      ],
      [
        'Alex',
        'Okay, one Western burger and fries. How do you like your burger?',
        'ได้ค่ะ เวสเทิร์นเบอร์เกอร์กับเฟรนช์ฟรายส์ อยากได้เบอร์เกอร์สุกแค่ไหนคะ',
      ],
      [
        'Diner C',
        'Well done, please. And may I have a Coke?',
        'สุกเต็มที่ค่ะ แล้วขอโค้กด้วยได้ไหมคะ',
      ],
      [
        'Alex',
        'Yes, one Coke. Is there anything else I can get for you?',
        'ได้ค่ะ โค้กหนึ่งแก้ว มีอะไรเพิ่มอีกไหมคะ',
      ],
      ['Diner C', 'No, I think that will be all.', 'ไม่ล่ะค่ะ แค่นี้พอค่ะ'],
      [
        'Alex',
        "Okay, then, I'll be right back with your Coke.",
        'ได้ค่ะ เดี๋ยวเอาโค้กมาให้นะคะ',
      ],
      [
        'Alex',
        'Here you go, sir. Are you ready to order?',
        'นี่ค่ะ พร้อมสั่งอาหารหรือยังคะ',
      ],
      [
        'Diner D',
        "Uh, yes, I believe so. Let me see. What's the catch of the day?",
        'เอ่อ ครับ น่าจะพร้อมแล้ว ขอดูก่อนนะครับ ปลาประจำวันคืออะไรครับ',
      ],
      [
        'Alex',
        "Today's catch of the day is sea bass, and the chef's special is blackened chicken.",
        'วันนี้ปลาประจำวันคือปลากะพงค่ะ ส่วนเมนูพิเศษของเชฟคือไก่แบล็กเก้นค่ะ',
      ],
      [
        'Diner D',
        "I think I'll have the sea bass. Can I have it broiled, with the lemon butter sauce?",
        'ผมขอปลากะพงแล้วกันครับ ขอแบบย่างราดซอสเนยมะนาวได้ไหมครับ',
      ],
      [
        'Alex',
        'Sea bass, broiled. Would you like mixed vegetables or the tossed salad with that?',
        'ปลากะพงย่างค่ะ รับผักรวมหรือสลัดผักคะ',
      ],
      ['Diner D', "I'll have the mixed vegetables.", 'ขอผักรวมครับ'],
      [
        'Alex',
        'That also comes with a baked potato or rice pilaf.',
        'แล้วมีมันฝรั่งอบหรือข้าวพิลาฟด้วยค่ะ',
      ],
      ['Diner D', "I'll have the rice pilaf.", 'ขอข้าวพิลาฟครับ'],
      [
        'Alex',
        "Okay, that's a broiled sea bass with rice pilaf and mixed vegetables. — And for you, sir?",
        'ได้ค่ะ ปลากะพงย่างพร้อมข้าวพิลาฟและผักรวมนะคะ — แล้วคุณล่ะคะ',
      ],
      [
        'Diner E',
        'I like the sound of that blackened chicken.',
        'ไก่แบล็กเก้นน่ากินดีนะครับ เอาอันนั้นแล้วกัน',
      ],
      [
        'Alex',
        'That also comes with the baked potato or the rice.',
        'มีมันฝรั่งอบหรือข้าวให้เลือกด้วยค่ะ',
      ],
      [
        'Diner E',
        "I'll have a baked potato and a salad.",
        'ขอมันฝรั่งอบกับสลัดครับ',
      ],
      [
        'Alex',
        'We have a choice of French, Italian, blue cheese, or the house vinaigrette for your salad.',
        'สลัดมีน้ำสลัดฝรั่งเศส อิตาเลียน บลูชีส หรือวินิเกรตสูตรร้านให้เลือกค่ะ',
      ],
      [
        'Diner E',
        'Uh, blue cheese. And do you have croutons on the salad?',
        'เอ่อ บลูชีสครับ แล้วสลัดมีครูตองไหมครับ',
      ],
      ['Alex', 'Yes, sir.', 'มีค่ะ'],
      ['Diner E', "I'll take extra of those, please.", 'ขอเพิ่มด้วยได้ไหมครับ'],
      [
        'Alex',
        "No problem, sir. That's blackened chicken with a baked potato, salad with blue cheese dressing, and extra croutons.",
        'ได้เลยค่ะ สรุปคือไก่แบล็กเก้นพร้อมมันฝรั่งอบ สลัดน้ำสลัดบลูชีส และครูตองเพิ่มนะคะ',
      ],
      [
        'Diner E',
        "Yes, thank you. And I'll have another ginger ale, too.",
        'ใช่ครับ ขอบคุณ แล้วขอจินเจอร์เอลอีกแก้วด้วยครับ',
      ],
      ['Alex', 'One ginger ale.', 'จินเจอร์เอลอีกหนึ่งแก้วค่ะ'],
      ['Alex', 'How is everything?', 'ทุกอย่างเป็นยังไงบ้างคะ'],
      [
        'Don',
        'Oh, very good, thank you. The blackened chicken was delicious.',
        'โอ้ อร่อยมากเลยครับ ขอบคุณนะ ไก่แบล็กเก้นอร่อยมากเลยครับ',
      ],
      [
        'Alex',
        "I'm glad to hear that. Is there anything else that I can get for you, Don?",
        'ดีใจที่ชอบนะคะ มีอะไรเพิ่มอีกไหมคะดอน',
      ],
      ['Paul', 'Is there anything else?', 'มีอะไรเพิ่มอีกไหม'],
      ['Don', "Yes, I'll have another beer.", 'เอาสิ ขอเบียร์อีกแก้วนึง'],
      [
        'Paul',
        "Okay, and I'll have another ginger ale with that. Would you bring the bill as well, please?",
        'โอเค แล้วผมขอจินเจอร์เอลอีกแก้วด้วยครับ ช่วยเอาบิลมาด้วยได้ไหมครับ',
      ],
      [
        'Alex',
        "One Heineken and one ginger ale. I'll be right back. — And here's your bill, sir.",
        'ไฮเนเก้นหนึ่งแก้วกับจินเจอร์เอลหนึ่งแก้วค่ะ เดี๋ยวมานะคะ — นี่บิลค่ะ',
      ],
      [
        'Don',
        "I'll take that when you're ready.",
        'เดี๋ยวผมดูให้เอง เดี๋ยวเรียกนะ',
      ],
      ['Alex', 'Just a minute, please.', 'รอสักครู่นะคะ'],
      [
        'Don',
        'Excuse me. What is this charge for here?',
        'ขอโทษนะ ค่าใช้จ่ายตรงนี้คืออะไรเหรอ',
      ],
      ['Alex', "That's for the water, sir.", 'ค่าน้ำเปล่าค่ะ'],
      [
        'Don',
        "Oh, okay. — Oh, here you go. I'll charge it.",
        'อ้อ โอเค — นี่ครับ ผมจ่ายด้วยบัตรแล้วกัน',
      ],
      ['Alex', "Okay, sir. I'll be right back.", 'ได้ค่ะ เดี๋ยวมานะคะ'],
      ['Don', 'Thank you.', 'ขอบคุณครับ'],
    ],
  },
  {
    key: 'lst5-unit6-checkout',
    title: 'Unit 6: Checking Out',
    emoji: '🧾',
    lines: [
      ['Front Desk', 'Good morning.', 'สวัสดีตอนเช้าค่ะ'],
      ['Mrs. Broen', 'Good morning.', 'สวัสดีตอนเช้าค่ะ'],
      [
        'Front Desk',
        'Good morning, Mrs. Broen. How are you this morning?',
        'สวัสดีตอนเช้าค่ะคุณนายโบรเอน วันนี้เป็นยังไงบ้างคะ',
      ],
      [
        'Mrs. Broen',
        'Not very well. I slept poorly.',
        'ไม่ค่อยดีเลยค่ะ ฉันนอนไม่ค่อยหลับ',
      ],
      ['Front Desk', "Oh, I'm sorry to hear that.", 'โอ้ เสียใจด้วยจริงๆ ค่ะ'],
      [
        'Mrs. Broen',
        'Do you have any messages for me?',
        'มีข้อความฝากถึงฉันบ้างไหมคะ',
      ],
      [
        'Front Desk',
        'Let me check. — Yes, this is for you, Mrs. Broen, it just arrived this morning.',
        'ขอเช็คก่อนนะคะ — มีค่ะ อันนี้ของคุณค่ะคุณนายโบรเอน เพิ่งมาถึงเมื่อเช้านี้เองค่ะ',
      ],
      [
        'Mrs. Broen',
        "Thank you. — Oh, this is bad news. I'm going to have to fly up to Parkersville. My husband isn't able to meet me here.",
        'ขอบคุณค่ะ — โอ้ ข่าวร้ายจังเลย ฉันต้องบินไปพาร์กเกอร์สวิลล์แล้วล่ะ สามีฉันมาพบที่นี่ไม่ได้',
      ],
      ['Front Desk', "Oh, I'm sorry to hear that.", 'โอ้ เสียใจด้วยนะคะ'],
      [
        'Mrs. Broen',
        "I'm going to go back upstairs and pack my bags. Could you send a boy up for them in half an hour?",
        'ฉันจะกลับขึ้นไปเก็บกระเป๋าก่อนนะคะ ช่วยส่งคนไปรับกระเป๋าในอีกครึ่งชั่วโมงได้ไหมคะ',
      ],
      ['Front Desk', "Certainly, ma'am.", 'ได้เลยค่ะ'],
      [
        'Mrs. Broen',
        "And could you get my bill ready? I'll want to charge it to Broen Enterprises, as usual.",
        'แล้วช่วยเตรียมบิลให้ด้วยนะคะ ฉันจะเก็บเข้าบัญชีบริษัทโบรเอน เอนเตอร์ไพรส์เหมือนเดิมค่ะ',
      ],
      ['Front Desk', 'Yes, Mrs. Broen.', 'ได้ค่ะคุณนายโบรเอน'],
      [
        'Mrs. Broen',
        "Thank you. I'll be ready in half an hour.",
        'ขอบคุณค่ะ ฉันจะพร้อมในอีกครึ่งชั่วโมงนะคะ',
      ],
      ['Colleague', 'Oh boy, she was in a rush.', 'โอ้โห รีบจริงๆ เลยนะ'],
      [
        'Front Desk',
        'Yes, Mrs. Broen is usually in a hurry.',
        'ใช่ คุณนายโบรเอนรีบตลอดแหละ',
      ],
      [
        'Front Desk',
        "Good morning, ma'am. How may I help you this morning?",
        'สวัสดีตอนเช้าค่ะ มีอะไรให้ช่วยไหมคะ',
      ],
      [
        'Ann',
        "I'm Mrs. Ann Rafferty, in room 1206, and I'd like to check out.",
        'ฉันคุณนายแอน ราเฟอร์ตี้ ห้อง 1206 ค่ะ อยากเช็คเอาท์ค่ะ',
      ],
      [
        'Front Desk',
        "Oh, okay, Mrs. Rafferty, just one minute and I'll get your bill for you. — I hope you had a pleasant stay here.",
        'โอเคค่ะคุณนายราเฟอร์ตี้ รอสักครู่นะคะ เดี๋ยวไปเอาบิลมาให้ค่ะ — หวังว่าการเข้าพักครั้งนี้จะประทับใจนะคะ',
      ],
      ['Ann', 'Yes, we have. Thank you.', 'ใช่ค่ะ ประทับใจมากเลย ขอบคุณค่ะ'],
      [
        'Front Desk',
        "In addition to the charge for the two nights, you'll see that there is a charge for a couple of local phone calls you made, as well as a call to Rapid City.",
        'นอกจากค่าห้องสองคืนแล้ว จะมีค่าโทรศัพท์ในพื้นที่สองสามครั้ง แล้วก็ค่าโทรไปแรพิดซิตี้ด้วยนะคะ',
      ],
      ['Ann', 'Yes, we made those calls.', 'ใช่ค่ะ เราโทรจริง'],
      [
        'Front Desk',
        'Okay then, if everything is in order, please sign here. Can I get you a cab?',
        'โอเคค่ะ ถ้าทุกอย่างถูกต้อง ช่วยเซ็นตรงนี้ด้วยนะคะ อยากให้เรียกแท็กซี่ให้ไหมคะ',
      ],
      [
        'Ann',
        'No, thank you. We are going to take the shuttle to the airport.',
        'ไม่ล่ะค่ะ ขอบคุณ เราจะนั่งรถรับส่งไปสนามบินค่ะ',
      ],
      [
        'Front Desk',
        'Okay. Have a nice trip, and I hope we will see you again at the Grand Plaza.',
        'ได้ค่ะ ขอให้เดินทางปลอดภัยนะคะ หวังว่าจะได้พบกันอีกที่แกรนด์ พลาซ่านะคะ',
      ],
      ['Ann', 'I think you will.', 'ฉันว่าคงได้พบกันแน่ค่ะ'],
    ],
  },
  {
    key: 'lst5-bonus-food',
    title: 'Bonus: Talking About Food Preferences',
    emoji: '🍔',
    lines: [
      ['Teacher', "What's your favorite food?", 'อาหารที่คุณชอบที่สุดคืออะไร'],
      ['Student', 'I love hamburgers.', 'ฉันชอบแฮมเบอร์เกอร์มากเลย'],
      ['Teacher', 'Do you like pizzas?', 'คุณชอบพิซซ่าไหม'],
      [
        'Student',
        "Yes, of course, I'm a big fan of pizzas. Or: No, I don't — I can't stand pizzas.",
        'ชอบสิ ฉันเป็นแฟนพิซซ่าตัวยงเลย หรืออาจตอบว่า ไม่ชอบเลย ฉันทนพิซซ่าไม่ได้',
      ],
      ['Teacher', 'What would you like to eat?', 'คุณอยากกินอะไร'],
      [
        'Student',
        "I'd like to have beef steak and salad.",
        'ฉันอยากกินสเต๊กเนื้อกับสลัด',
      ],
      [
        'Teacher',
        'Now remember — usually, when we say "food" meaning any kind of food in general, like hamburgers or pizzas, we have to use the plural form: hamburgers, pizzas. But when you go to a restaurant and order food, you don\'t have to use the plural form — you just say "beef steak" or "salad" or "pizza," and so on. It\'s only when you\'re talking about food in general that you use the plural — hamburgers, pizzas.',
        'จำไว้นะคะ ปกติเวลาพูดถึง "food" ในความหมายกว้างๆ ทั่วไป เช่น แฮมเบอร์เกอร์หรือพิซซ่า เราต้องใช้รูปพหูพจน์ คือ hamburgers, pizzas แต่พอไปร้านอาหารแล้วสั่งอาหาร ไม่ต้องใช้รูปพหูพจน์ค่ะ แค่พูดว่า beef steak หรือ salad หรือ pizza เฉยๆ ก็พอ จะใช้รูปพหูพจน์ก็ตอนที่พูดถึงอาหารแบบทั่วไปเท่านั้น คือ hamburgers, pizzas',
      ],
      [
        'Teacher',
        'Do you prefer beef or pork?',
        'คุณชอบเนื้อวัวหรือเนื้อหมูมากกว่า',
      ],
      ['Student', 'I prefer beef.', 'ฉันชอบเนื้อวัวมากกว่า'],
      ['Teacher', 'How do you like your lamb?', 'คุณชอบกินเนื้อแพะแบบไหน'],
      ['Student', 'I like it grilled.', 'ฉันชอบแบบย่าง'],
      ['Teacher', 'Do you like to eat stir-fried duck?', 'คุณชอบกินเป็ดผัดไหม'],
      [
        'Student',
        "Yes, I really love it, it's delicious. Or: No, I don't — I like it roasted.",
        'ชอบมากเลย อร่อยสุดๆ หรืออาจตอบว่า ไม่ชอบ ฉันชอบแบบอบมากกว่า',
      ],
      [
        'Teacher',
        'What do you want to have for lunch?',
        'คุณอยากกินอะไรเป็นมื้อกลางวัน',
      ],
      ['Student', 'I want to have fried chicken.', 'ฉันอยากกินไก่ทอด'],
      [
        'Teacher',
        "Okay, so that's all for today. Thanks. Goodbye. See you.",
        'โอเคค่ะ วันนี้จบเท่านี้นะคะ ขอบคุณค่ะ สวัสดีค่ะ แล้วพบกันใหม่นะคะ',
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
      displayOrder: 5,
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
    `Listening seed (Lesson 5) done: units=${unitsUpserted}, lines=${linesInserted}`,
  );
  await dataSource.destroy();
}

main().catch((err) => {
  console.error('Listening seed (Lesson 5) failed:', err);
  process.exit(1);
});
