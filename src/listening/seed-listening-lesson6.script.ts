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

// Lesson 6 — "Easy English for Beginners — English Conversation 6"
// https://www.youtube.com/watch?v=fhv6cAz7o_o
// A continuous travel story following Martin Andrew White on a trip to
// Sydney, across 10 spoken "Unit N" segments, plus a closing vehicle
// vocabulary / pronunciation bonus taught by "Mary". Start seconds are read
// from the auto-caption transcript's own timestamps at (or immediately
// after) the point where each "Unit N" marker is spoken.

const LESSON_KEY = 'lesson-6';
const LESSON_TITLE = 'Lesson 6: English Conversation 6';
const LESSON_EMOJI = '🦘';

const VIDEO_ID = 'fhv6cAz7o_o';

const UNIT_START_SECONDS = [
  1, 245, 565, 765, 905, 1090, 1302, 1450, 1630, 1815, 1908,
];
// Approximate end of the video, after the closing vehicle-vocabulary bonus.
const VIDEO_END_SECONDS = 2280;

type SeedLine = [speaker: string, en: string, th: string];

type SeedUnit = {
  key: string;
  title: string;
  emoji: string;
  lines: SeedLine[];
};

const UNITS: SeedUnit[] = [
  {
    key: 'lst6-unit1-travel-agent',
    title: 'Unit 1: At the Travel Agent',
    emoji: '🧳',
    lines: [
      [
        'Agent',
        'Good morning, sir. How can I help you?',
        'สวัสดีตอนเช้าค่ะ มีอะไรให้ดิฉันช่วยไหมคะ',
      ],
      [
        'Martin',
        'Well, I have some time off from work next month and I was thinking of going to Australia.',
        'คือผมมีวันลาจากงานเดือนหน้าครับ เลยกำลังคิดว่าจะไปเที่ยวออสเตรเลีย',
      ],
      [
        'Agent',
        'Mhm, that sounds great. How long is your vacation?',
        'ฟังดูดีเลยค่ะ ลาไปกี่วันคะ',
      ],
      [
        'Martin',
        'Just 1 week. My last day at work is the 26th of July and I go back on the 5th of August.',
        'แค่หนึ่งอาทิตย์ครับ วันสุดท้ายที่ทำงานคือวันที่ 26 กรกฎาคม แล้วกลับไปทำงานวันที่ 5 สิงหาคม',
      ],
      [
        'Agent',
        "Okay. Here's our Sydney brochure. Have a look and see if there's a hotel that you like.",
        'ค่ะ นี่โบรชัวร์เมืองซิดนีย์ค่ะ ลองดูนะคะว่ามีโรงแรมไหนที่ถูกใจไหม',
      ],
      [
        'Martin',
        "Ah. This one is good. The Four Seasons Hotel. It's expensive, but I've been told it's very nice.",
        'อ้อ โรงแรมนี้ดูดีนะครับ โฟร์ซีซั่นส์ แพงหน่อยแต่ได้ยินมาว่าดีมากเลย',
      ],
      [
        'Agent',
        "Yes, it's a very high-class hotel. I'm sure you'll enjoy your stay there. Would you like me to make the booking now, sir?",
        'ใช่ค่ะ เป็นโรงแรมระดับหรูเลยล่ะ พักแล้วต้องชอบแน่นอนค่ะ ให้ดิฉันจองเลยไหมคะ',
      ],
      ['Martin', 'Mhm. Yes, please.', 'ครับ เอาเลยครับ'],
      [
        'Agent',
        "I just need to take some personal information. What's your full name?",
        'ขอข้อมูลส่วนตัวหน่อยนะคะ ชื่อเต็มคุณคืออะไรคะ',
      ],
      ['Martin', 'Martin Andrew White.', 'มาร์ติน แอนดรูว์ ไวท์ ครับ'],
      ['Agent', 'And your address?', 'แล้วที่อยู่ล่ะคะ'],
      [
        'Martin',
        '11 Soi Charoen Nakhon, Khlong San, Bangkok.',
        'บ้านเลขที่ 11 ซอยเจริญนคร คลองสาน กรุงเทพฯ ครับ',
      ],
      ['Agent', 'And your telephone number?', 'แล้วเบอร์โทรศัพท์คะ'],
      ['Martin', '02 624 9734.', '02 624 9734 ครับ'],
      [
        'Agent',
        'Do you have a daytime number I can call if necessary?',
        'มีเบอร์ที่ติดต่อได้ตอนกลางวันไหมคะ เผื่อจำเป็นต้องโทรหา',
      ],
      ['Martin', 'Mhm. 02 777 1212.', 'มีครับ 02 777 1212'],
      [
        'Agent',
        "That's fine. Will you be traveling alone, Mr. White?",
        'ค่ะ คุณไวท์จะเดินทางคนเดียวใช่ไหมคะ',
      ],
      ['Martin', 'Yep, just me.', 'ใช่ครับ คนเดียว'],
      [
        'Agent',
        'Okay. You finish work on Friday the 26th. So, shall I try to book your flight for the next day?',
        'ค่ะ คุณเลิกงานวันศุกร์ที่ 26 ให้ดิฉันลองจองตั๋วเครื่องบินวันถัดไปเลยไหมคะ',
      ],
      [
        'Martin',
        'Yes, please. And a return flight on Saturday, the 3rd of August.',
        'ครับ เอาเลย แล้วก็ขอตั๋วขากลับวันเสาร์ที่ 3 สิงหาคมด้วยครับ',
      ],
      [
        'Agent',
        "I'll just check the availability. There are seats available on this Qantas Airways flight, but there is a 3-hour stopover in Singapore.",
        'ขอเช็กที่นั่งว่างก่อนนะคะ มีที่นั่งว่างของสายการบินควอนตัสแอร์เวย์ค่ะ แต่ต้องแวะเปลี่ยนเครื่องที่สิงคโปร์ 3 ชั่วโมง',
      ],
      [
        'Martin',
        'Is there a direct flight that I can take?',
        'มีเที่ยวบินตรงไหมครับ',
      ],
      [
        'Agent',
        'Yes, Malaysian Airways. That flight departs at 7:00 on Saturday morning and arrives in Sydney at 6:30 p.m. local time.',
        'มีค่ะ ของสายการบินมาเลเซียนแอร์เวย์ เที่ยวบินนั้นออกเจ็ดโมงเช้าวันเสาร์ แล้วถึงซิดนีย์หกโมงครึ่งเย็นตามเวลาท้องถิ่น',
      ],
      [
        'Martin',
        "That sounds better, but it's a little longer than I thought.",
        'ฟังดูดีกว่านะครับ แต่นานกว่าที่คิดไว้นิดหน่อย',
      ],
      [
        'Agent',
        "Well, it's an 8-hour long flight. Don't forget the time difference. All the times given are local times.",
        'ก็บินนานแปดชั่วโมงค่ะ อย่าลืมเรื่องเวลาต่างกันด้วยนะคะ เวลาที่บอกทั้งหมดเป็นเวลาท้องถิ่นค่ะ',
      ],
      [
        'Martin',
        "Oh, yes, that's right. They're 3 hours ahead, aren't they? Can I have the details of the return flight?",
        'อ๋อ จริงด้วยครับ เวลาที่นั่นเร็วกว่าเรา 3 ชั่วโมงใช่ไหมครับ ขอรายละเอียดเที่ยวบินขากลับด้วยได้ไหมครับ',
      ],
      [
        'Agent',
        'Um, that flight departs at 6:00 p.m. and arrives in Bangkok at 11:15 on that same night. Shall I reserve a seat for you?',
        'เที่ยวบินนั้นออกหกโมงเย็น แล้วถึงกรุงเทพฯ ห้าทุ่มสิบห้าคืนวันเดียวกันค่ะ ให้ดิฉันจองที่นั่งให้เลยไหมคะ',
      ],
      ['Martin', 'Yes, please.', 'เอาเลยครับ'],
      [
        'Agent',
        "Now, let's reserve a room for you at the Four Seasons. Do you want a single or a double room?",
        'ทีนี้มาจองห้องพักที่โฟร์ซีซั่นส์ให้คุณกันค่ะ อยากได้ห้องเตียงเดี่ยวหรือเตียงคู่คะ',
      ],
      [
        'Martin',
        'Oh, a single room will be fine, thanks. Will it have a view of the harbor?',
        'อ้อ เอาห้องเตียงเดี่ยวก็พอครับ ขอบคุณ แล้วมองเห็นวิวอ่าวไหมครับ',
      ],
      [
        'Agent',
        'Oh, yes. All rooms have harbor views. They have a room available. Shall I make the confirmation?',
        'เห็นแน่นอนค่ะ ห้องทุกห้องมองเห็นวิวอ่าว ตอนนี้มีห้องว่างค่ะ ให้ดิฉันยืนยันการจองเลยไหมคะ',
      ],
      ['Martin', 'Yeah, go ahead.', 'ครับ จัดการเลย'],
      [
        'Agent',
        'Okay. So, now you have a room available at the Four Seasons from Saturday, the 27th of July until Saturday, the 3rd of August.',
        'ค่ะ ตอนนี้คุณมีห้องพักที่โฟร์ซีซั่นส์แล้ว ตั้งแต่วันเสาร์ที่ 27 กรกฎาคม ถึงวันเสาร์ที่ 3 สิงหาคมค่ะ',
      ],
      [
        'Martin',
        "That's great. Can I pay by credit card?",
        'เยี่ยมเลยครับ จ่ายด้วยบัตรเครดิตได้ไหมครับ',
      ],
      [
        'Agent',
        'No problem. So, it is 62,000 baht including your flight.',
        'ได้ค่ะ ไม่มีปัญหา รวมค่าตั๋วเครื่องบินด้วยแล้วทั้งหมด 62,000 บาทค่ะ',
      ],
      [
        'Martin',
        "Here's my card. When will I be able to collect my ticket?",
        'นี่บัตรผมครับ แล้วผมจะมารับตั๋วได้เมื่อไหร่ครับ',
      ],
      [
        'Agent',
        'It should be ready in a couple of days. I can call you at work if you like.',
        'น่าจะพร้อมในอีกสองสามวันค่ะ ดิฉันโทรแจ้งคุณที่ทำงานก็ได้ถ้าสะดวกค่ะ',
      ],
      ['Martin', 'Thanks very much.', 'ขอบคุณมากครับ'],
    ],
  },
  {
    key: 'lst6-unit2-airport',
    title: 'Unit 2: At the Airport',
    emoji: '🛫',
    lines: [
      [
        'Staff',
        'Good morning, sir. Can I see your ticket and passport?',
        'สวัสดีตอนเช้าค่ะ ขอดูตั๋วเครื่องบินกับพาสปอร์ตหน่อยค่ะ',
      ],
      ['Martin', 'Certainly. There you are.', 'ได้ครับ นี่ครับ'],
      [
        'Staff',
        'Thank you. Okay, and how many suitcases will you be checking in?',
        'ขอบคุณค่ะ แล้วจะเช็คอินกระเป๋ากี่ใบคะ',
      ],
      ['Martin', 'Uh, just one suitcase.', 'เอ่อ ใบเดียวครับ'],
      [
        'Staff',
        'And did you pack your bags yourself?',
        'แล้วคุณจัดกระเป๋าเองใช่ไหมคะ',
      ],
      ['Martin', 'Yes, I did.', 'ใช่ครับ ผมจัดเอง'],
      [
        'Staff',
        'Okay, and do you have any electrical goods?',
        'ค่ะ แล้วมีเครื่องใช้ไฟฟ้าอะไรไหมคะ',
      ],
      [
        'Martin',
        'I have an electric shaver in my hand luggage. Is that okay?',
        'ผมมีมีดโกนไฟฟ้าอยู่ในกระเป๋าถือครับ ได้ไหมครับ',
      ],
      [
        'Staff',
        "That's fine. So, nothing in your suitcase?",
        'ได้ค่ะ ไม่มีในกระเป๋าใหญ่ใช่ไหมคะ',
      ],
      ['Martin', 'No.', 'ไม่มีครับ'],
      [
        'Staff',
        'Okay. Would you like a window or aisle seat?',
        'ค่ะ อยากได้ที่นั่งริมหน้าต่างหรือริมทางเดินคะ',
      ],
      ['Martin', 'Uh, a window seat, please.', 'เอ่อ ขอริมหน้าต่างครับ'],
      [
        'Staff',
        'Okay. And just one moment. And this is your seat number and the departure gate. You can go straight through to the departure lounge. Enjoy your flight.',
        'ได้ค่ะ รอสักครู่นะคะ นี่คือหมายเลขที่นั่งกับประตูขึ้นเครื่องของคุณค่ะ เดินตรงไปที่ห้องพักผู้โดยสารขาออกได้เลยค่ะ ขอให้เดินทางโดยสวัสดิภาพนะคะ',
      ],
      [
        'Martin',
        'And what time will we be boarding?',
        'แล้วจะเริ่มขึ้นเครื่องกี่โมงครับ',
      ],
      [
        'Staff',
        'Uh, we begin boarding at 7:00.',
        'เอ่อ เริ่มขึ้นเครื่องเจ็ดโมงค่ะ',
      ],
      ['Martin', 'Okay, thank you.', 'โอเคครับ ขอบคุณ'],
      [
        'Attendant',
        "Would you like a newspaper to read, ma'am?",
        'รับหนังสือพิมพ์อ่านไหมคะ',
      ],
      ['Other passenger', 'No, thank you.', 'ไม่ค่ะ ขอบคุณ'],
      [
        'Attendant',
        'Would you like a newspaper to read, sir? Sir? Sir?',
        'รับหนังสือพิมพ์อ่านไหมคะ คุณคะ คุณคะ',
      ],
      ['Martin', 'Oh.', 'อ้าว'],
      [
        'Attendant',
        'Would you like a newspaper to read, sir?',
        'รับหนังสือพิมพ์อ่านไหมคะ',
      ],
      [
        'Martin',
        "I— yeah. I'll take the Daily Mail.",
        'เอ่อ เอาครับ ขอเดลี่เมล์ครับ',
      ],
      ['Attendant', 'There you go, sir.', 'นี่ค่ะ'],
      [
        'Martin',
        "Thank you. It'll help take my mind off things. I'm always a little nervous before flying.",
        'ขอบคุณครับ จะได้ช่วยให้ผมเผลอลืมความกังวลไปบ้าง ผมมักจะประหม่านิดหน่อยก่อนขึ้นบินเสมอ',
      ],
      [
        'Attendant',
        'Oh, well. Try not to worry too much. You know, air flight is the safest form of travel.',
        'อ๋อ พยายามอย่ากังวลมากไปนะคะ จริงๆ แล้วการเดินทางทางอากาศปลอดภัยที่สุดเลยนะคะ',
      ],
      [
        'Martin',
        "I know. I'm sure I'll be better after we take off.",
        'ผมรู้ครับ คิดว่าคงจะดีขึ้นหลังเครื่องขึ้นแล้ว',
      ],
      [
        'Attendant',
        "You know, we have some flight entertainment for you, too. You'll find the film guide in the pocket in front of you, our in-flight magazine.",
        'เรามีความบันเทิงบนเครื่องให้ด้วยนะคะ คุณจะเจอคู่มือหนังในช่องเก็บของด้านหน้าคุณ พร้อมกับนิตยสารบนเครื่องของเราค่ะ',
      ],
      [
        'Martin',
        'Oh, good. A nice film will help me to relax.',
        'อ้อ ดีเลยครับ ดูหนังดีๆ สักเรื่องคงช่วยให้ผมผ่อนคลายได้',
      ],
      [
        'Attendant',
        "Programs will start shortly after take off. If there's anything I can get for you, then please just call for assistance.",
        'รายการจะเริ่มไม่นานหลังเครื่องขึ้นค่ะ ถ้าต้องการอะไรก็กดเรียกได้เลยนะคะ',
      ],
      [
        'Martin',
        'When will dinner be served?',
        'แล้วจะเสิร์ฟอาหารเย็นกี่โมงครับ',
      ],
      [
        'Attendant',
        'In about an hour or so. We have a fish, steak, and the vegetarian option. Which one would you like?',
        'อีกประมาณชั่วโมงนึงค่ะ เรามีปลา สเต็ก และเมนูมังสวิรัติ คุณอยากได้แบบไหนคะ',
      ],
      ['Martin', 'Fish, please.', 'ขอปลาครับ'],
      [
        'Attendant',
        "Okay. I'll be back later. Now, please just try to relax and enjoy the flight. Sir, have you seen the catalog for our in-flight shop?",
        'ได้ค่ะ เดี๋ยวดิฉันกลับมาใหม่นะคะ ตอนนี้พยายามผ่อนคลายแล้วสนุกกับการเดินทางนะคะ คุณคะ เคยดูแคตตาล็อกร้านค้าบนเครื่องของเราหรือยังคะ',
      ],
      ['Martin', 'This one?', 'เล่มนี้เหรอครับ'],
      [
        'Attendant',
        "That's it. Would you like to order any duty-free goods?",
        'ใช่ค่ะเล่มนั้นเลย อยากสั่งสินค้าปลอดภาษีอะไรไหมคะ',
      ],
      [
        'Martin',
        'Uh, yes, please. Can I pay by credit card?',
        'เอ่อ อยากสั่งครับ จ่ายด้วยบัตรเครดิตได้ไหมครับ',
      ],
      [
        'Attendant',
        'Yes. All major credit cards are accepted, but purchases must not exceed 500 US dollars.',
        'ได้ค่ะ รับบัตรเครดิตหลักๆ ทุกใบ แต่ยอดซื้อต้องไม่เกิน 500 ดอลลาร์สหรัฐค่ะ',
      ],
      [
        'Martin',
        "Okay. Um, I'd like this bottle of Scotch whiskey, please. At $34.",
        'ครับ เอ่อ ผมขอวิสกี้สก็อตช์ขวดนี้ครับ ราคา 34 ดอลลาร์',
      ],
      [
        'Attendant',
        "Right. That will be one bottle of Johnny Walker malt whiskey. Is there anything else you'd like, sir?",
        'ได้ค่ะ วิสกี้มอลต์จอห์นนี่ วอล์กเกอร์หนึ่งขวด อยากได้อะไรเพิ่มอีกไหมคะ',
      ],
      [
        'Martin',
        "Uh, yes. I'd like these titanium sunglasses.",
        'เอ่อ อยากได้ครับ ขอแว่นกันแดดไทเทเนียมอันนี้ด้วยครับ',
      ],
      [
        'Attendant',
        'Yes. They are priced at 145 US dollars. Will that be all, sir?',
        'ได้ค่ะ ราคา 145 ดอลลาร์สหรัฐค่ะ เอาแค่นี้ใช่ไหมคะ',
      ],
      [
        'Martin',
        "Uh, yes, that's everything. Thanks.",
        'ครับ เท่านี้แหละครับ ขอบคุณ',
      ],
      [
        'Attendant',
        'The total bill comes to 179 US dollars. Can I have your credit card, please?',
        'ยอดรวมทั้งหมด 179 ดอลลาร์สหรัฐค่ะ ขอบัตรเครดิตหน่อยได้ไหมคะ',
      ],
      ['Martin', 'Uh, sure. Here you go.', 'ได้ครับ นี่ครับ'],
      [
        'Attendant',
        'Thank you. Sir, please wait while I collect your duty-free goods.',
        'ขอบคุณค่ะ รอสักครู่นะคะ เดี๋ยวดิฉันไปหยิบสินค้าปลอดภาษีมาให้',
      ],
      ['Martin', 'Thank you.', 'ขอบคุณครับ'],
      [
        'Officer',
        'Good evening, sir. May I see your passport and immigration card, please?',
        'สวัสดีตอนเย็นครับ ขอดูพาสปอร์ตกับบัตรตรวจคนเข้าเมืองหน่อยครับ',
      ],
      ['Martin', 'Sure. Here you are.', 'ได้ครับ นี่ครับ'],
      [
        'Officer',
        'Thank you. Do you have anything to declare?',
        'ขอบคุณครับ มีอะไรต้องแจ้งสำแดงไหมครับ',
      ],
      [
        'Martin',
        'No, I just have these duty-free items that I bought on the plane.',
        'ไม่มีครับ มีแค่ของปลอดภาษีที่ผมซื้อบนเครื่องพวกนี้แหละครับ',
      ],
      [
        'Officer',
        "Hm. That's okay. Welcome to Australia. Is this your first trip here?",
        'อืม ไม่มีปัญหาครับ ยินดีต้อนรับสู่ออสเตรเลียครับ นี่เป็นทริปแรกที่มาที่นี่หรือเปล่าครับ',
      ],
      [
        'Martin',
        "No, I came here on business a few years ago, but I couldn't stay long.",
        'ไม่ใช่ครับ ผมเคยมาทำงานเมื่อสองสามปีก่อน แต่อยู่ได้ไม่นาน',
      ],
      [
        'Officer',
        'Are you here on business or pleasure this time?',
        'แล้วครั้งนี้มาทำงานหรือมาเที่ยวครับ',
      ],
      ['Martin', 'Purely pleasure this time.', 'มาเที่ยวล้วนๆ เลยครับครั้งนี้'],
      [
        'Officer',
        'Good. Are you planning on traveling around during your stay?',
        'ดีครับ แล้วตั้งใจจะเที่ยวรอบๆ ระหว่างที่อยู่นี่ไหมครับ',
      ],
      [
        'Martin',
        "Well, I've only got a week, so I'm planning on staying in Sydney.",
        'ก็ผมมีเวลาแค่อาทิตย์เดียว เลยวางแผนจะอยู่แค่ในซิดนีย์ครับ',
      ],
      [
        'Officer',
        'Yes, Australia is a big place. You will need a week to see it all.',
        'ใช่ครับ ออสเตรเลียกว้างมาก ต้องใช้เวลาเป็นอาทิตย์กว่าจะเที่ยวได้ทั่ว',
      ],
      [
        'Martin',
        "Maybe next time. This time I'm going to try to see all the tourist areas of Sydney.",
        'อาจจะรอไว้คราวหน้าครับ ครั้งนี้ผมจะพยายามไปให้ทั่วแหล่งท่องเที่ยวในซิดนีย์ก่อน',
      ],
      [
        'Officer',
        'Hm. Good. I hope you enjoy your stay.',
        'ดีครับ หวังว่าจะเที่ยวให้สนุกนะครับ',
      ],
      ['Martin', 'Thank you.', 'ขอบคุณครับ'],
    ],
  },
  {
    key: 'lst6-unit3-assistance',
    title: 'Unit 3: Asking for Assistance',
    emoji: '🧳',
    lines: [
      [
        'Martin',
        "Excuse me. Um, I've just arrived here, and I've been waiting at the baggage carousel for my suitcase. I think it's lost.",
        'ขอโทษนะครับ เอ่อ ผมเพิ่งมาถึง แล้วก็รอกระเป๋าที่สายพานมานานแล้ว คิดว่ากระเป๋าผมคงหายไปแล้วครับ',
      ],
      [
        'Staff',
        "Okay, sir. Don't worry about it. I'm sure we can find it. What flight were you on?",
        'ค่ะ ไม่ต้องกังวลนะคะ ดิฉันมั่นใจว่าเราหาเจอแน่นอน คุณมากับเที่ยวบินอะไรคะ',
      ],
      [
        'Martin',
        'Flight number MA201 from Bangkok.',
        'เที่ยวบิน MA201 จากกรุงเทพฯ ครับ',
      ],
      [
        'Staff',
        'Yes, your bag should be on carousel eight.',
        'ค่ะ กระเป๋าของคุณน่าจะอยู่ที่สายพานหมายเลข 8 นะคะ',
      ],
      [
        'Martin',
        "Well, this is where I've been waiting and it's not here.",
        'ครับ ผมก็รออยู่ตรงนี้แหละ แต่ไม่เห็นเลยครับ',
      ],
      [
        'Staff',
        'What does your bag look like? Can you give me a description?',
        'กระเป๋าของคุณหน้าตาเป็นยังไงคะ ช่วยบอกลักษณะหน่อยได้ไหมคะ',
      ],
      ['Martin', "It's green.", 'เป็นสีเขียวครับ'],
      [
        'Staff',
        'Does it have your name on it?',
        'มีชื่อคุณติดอยู่บนกระเป๋าไหมคะ',
      ],
      [
        'Martin',
        "Yes, I wrote my name on the label. It's Martin Andrew White.",
        'มีครับ ผมเขียนชื่อไว้บนป้าย ชื่อมาร์ติน แอนดรูว์ ไวท์ครับ',
      ],
      [
        'Staff',
        "Hm. I'll just make a quick call to see if I can find it. — Hello, Central? Yes. Con 17. Martin Andrew White. Yes. — Sir, your bag is being held by customs. You can pick it up there.",
        'อืม เดี๋ยวดิฉันโทรถามดูสักครู่นะคะ — ฮัลโหล ศูนย์กลางใช่ไหมคะ ค่ะ คอน 17 มาร์ติน แอนดรูว์ ไวท์ ค่ะ — คุณคะ กระเป๋าของคุณถูกเก็บไว้ที่ด่านศุลกากรค่ะ ไปรับได้ที่นั่นเลยค่ะ',
      ],
      ['Martin', 'Is— is there a problem?', 'มี มีปัญหาอะไรหรือเปล่าครับ'],
      [
        'Staff',
        "I'm sure it's nothing to worry about. They will explain it to you at the customs hall. Just follow this corridor on your left.",
        'ไม่ต้องกังวลหรอกค่ะ เขาจะอธิบายให้ฟังที่ห้องศุลกากรเอง เดินตามทางเดินนี้ไปทางซ้ายได้เลยค่ะ',
      ],
      ['Martin', 'Okay. Thanks for your help.', 'ครับ ขอบคุณที่ช่วยนะครับ'],
      ['Staff', "You're welcome.", 'ยินดีค่ะ'],
      [
        'Martin',
        'Excuse me. Um, my suitcase is missing and I was told I could collect it here.',
        'ขอโทษนะครับ เอ่อ กระเป๋าผมหายแล้วมีคนบอกว่าให้มารับที่นี่ครับ',
      ],
      [
        'Officer',
        'Can you identify which bag is yours?',
        'ช่วยชี้ให้ดูหน่อยได้ไหมครับว่ากระเป๋าใบไหนเป็นของคุณ',
      ],
      [
        'Martin',
        "Yes, it's this green one here.",
        'ได้ครับ ใบสีเขียวนี้เลยครับ',
      ],
      ['Officer', 'What is your name?', 'ชื่ออะไรครับ'],
      [
        'Martin',
        'My name is Martin Andrew White.',
        'มาร์ติน แอนดรูว์ ไวท์ ครับ',
      ],
      [
        'Officer',
        'Okay. This is your bag?',
        'ครับ กระเป๋าใบนี้เป็นของคุณใช่ไหมครับ',
      ],
      [
        'Martin',
        'Yes, of course. Is— is there a problem, officer?',
        'ใช่ครับ แน่นอน มี มีปัญหาอะไรหรือเปล่าครับ',
      ],
      [
        'Officer',
        "It's just that our sniffer dog has smelt something in your bag. I'm afraid I'll have to ask you to open it for me.",
        'ก็แค่สุนัขดมกลิ่นของเราได้กลิ่นบางอย่างในกระเป๋าคุณน่ะครับ ผมเกรงว่าจะต้องขอให้คุณเปิดกระเป๋าให้ดูหน่อยครับ',
      ],
      [
        'Martin',
        "Yes, of course. You're welcome to have a look.",
        'ได้ครับ แน่นอน เชิญตรวจดูได้เลยครับ',
      ],
      [
        'Officer',
        "Thank you. Ah, this is what our sniffer dog found. I'm afraid you're carrying a packet of biscuits and the packet is split.",
        'ขอบคุณครับ อ้อ นี่คือสิ่งที่สุนัขของเราเจอครับ ดูเหมือนคุณพกบิสกิตมาห่อหนึ่ง แล้วห่อมันฉีกอยู่ครับ',
      ],
      [
        'Martin',
        'Oh. I forgot about those. They must have been broken during the flight.',
        'อ้อ ลืมไปเลยครับ คงแตกตอนเครื่องบินนั่นแหละครับ',
      ],
      [
        'Officer',
        "Well, I can't see anything else, so you're free to go.",
        'ครับ ผมไม่เห็นมีอะไรอย่างอื่นแล้ว คุณไปได้เลยครับ',
      ],
      [
        'Martin',
        'Thank you. Thank you. Goodbye.',
        'ขอบคุณครับ ขอบคุณมาก สวัสดีครับ',
      ],
      ['Officer', 'Goodbye.', 'สวัสดีครับ'],
      [
        'Martin',
        "Excuse me. I'm trying to get to the city center. Where do I catch the bus?",
        'ขอโทษนะครับ ผมกำลังจะไปตัวเมือง ขึ้นรถเมล์ได้ตรงไหนครับ',
      ],
      [
        'Staff',
        'Oh, you can catch the bus just right outside. You go through the exit doors, take a left, and the bus stop should be right in front of you.',
        'อ้อ ขึ้นได้ที่ข้างนอกเลยค่ะ เดินออกทางประตูทางออก เลี้ยวซ้าย แล้วป้ายรถเมล์จะอยู่ตรงหน้าคุณเลยค่ะ',
      ],
      ['Martin', 'Okay, thank you.', 'โอเคครับ ขอบคุณ'],
      ['Staff', 'And where are you going?', 'แล้วจะไปที่ไหนคะ'],
      [
        'Martin',
        "I'm staying at the Four Seasons Hotel.",
        'ผมพักที่โรงแรมโฟร์ซีซั่นส์ครับ',
      ],
      [
        'Staff',
        "Oh, that's near the harbor, isn't it?",
        'อ้อ อยู่ใกล้อ่าวใช่ไหมคะ',
      ],
      ['Martin', 'Yes, it is.', 'ใช่ครับ'],
      [
        'Staff',
        "Well, in that case, you want to get a number 63. It's a blue bus and it leaves from bus station number two.",
        'ถ้างั้นคุณต้องขึ้นสาย 63 ค่ะ เป็นรถสีฟ้า ออกจากสถานีขนส่งหมายเลข 2 ค่ะ',
      ],
      [
        'Martin',
        'Oh, okay. Well, thank you for your help.',
        'อ๋อ โอเคครับ ขอบคุณที่ช่วยนะครับ',
      ],
      [
        'Staff',
        "You're welcome. I hope you enjoy your visit. Good day.",
        'ยินดีค่ะ หวังว่าจะมาเที่ยวให้สนุกนะคะ สวัสดีค่ะ',
      ],
      ['Martin', 'Good day.', 'สวัสดีครับ'],
    ],
  },
  {
    key: 'lst6-unit4-hotel',
    title: 'Unit 4: At the Hotel',
    emoji: '🏨',
    lines: [
      ['Receptionist', 'Good evening, sir.', 'สวัสดีตอนเย็นครับ'],
      [
        'Martin',
        "Good evening. I'd like to check in, please.",
        'สวัสดีครับ ผมอยากเช็คอินครับ',
      ],
      [
        'Receptionist',
        'Certainly, sir. Do you have a reservation?',
        'ได้ครับ คุณจองห้องไว้แล้วใช่ไหมครับ',
      ],
      [
        'Martin',
        "Yes, it's in the name of Martin Andrew White.",
        'ใช่ครับ จองในชื่อมาร์ติน แอนดรูว์ ไวท์ครับ',
      ],
      [
        'Receptionist',
        "That's right. You've booked a room with a view of the harbor. Can you please sign your name in the registration book? Here is your key card. You are in number 1004. It's on the 30th floor. You'll have a great view of the harbor from there.",
        'ใช่ครับ คุณจองห้องที่มองเห็นวิวอ่าวไว้ ช่วยเซ็นชื่อในสมุดลงทะเบียนหน่อยได้ไหมครับ นี่คีย์การ์ดของคุณครับ ห้อง 1004 อยู่ชั้น 30 จะเห็นวิวอ่าวสวยมากจากตรงนั้นเลยครับ',
      ],
      [
        'Martin',
        'Thanks. Where can I get something to eat?',
        'ขอบคุณครับ แล้วผมจะหาอะไรทานได้ที่ไหนครับ',
      ],
      [
        'Receptionist',
        'Our restaurant is located on the third floor. Dinner is served from 7:00.',
        'ร้านอาหารของเราอยู่ชั้น 3 ครับ เริ่มเสิร์ฟอาหารเย็นตั้งแต่หนึ่งทุ่มครับ',
      ],
      [
        'Martin',
        'Great. What time is breakfast served in the morning?',
        'เยี่ยมเลยครับ แล้วอาหารเช้าเสิร์ฟกี่โมงครับ',
      ],
      [
        'Receptionist',
        'Breakfast is served between 6:00 and 10:00.',
        'อาหารเช้าเสิร์ฟตั้งแต่หกโมงถึงสิบโมงครับ',
      ],
      [
        'Martin',
        'Okay. Thank you for your help.',
        'โอเคครับ ขอบคุณที่ช่วยนะครับ',
      ],
      [
        'Receptionist',
        "You're very welcome, sir. I'll just call a bellboy to show you to your room. I hope you enjoy your stay.",
        'ยินดีครับ เดี๋ยวผมเรียกพนักงานยกกระเป๋ามาพาคุณไปที่ห้องนะครับ หวังว่าจะพักผ่อนให้สบายนะครับ',
      ],
      [
        'Martin',
        'Is there anything interesting to see nearby?',
        'แถวนี้มีที่เที่ยวน่าสนใจอะไรไหมครับ',
      ],
      [
        'Receptionist',
        "Yes, the hotel is in an area called The Rocks. It's the oldest part of the city. There are many cafes and restaurants nearby.",
        'มีครับ โรงแรมอยู่ในย่านที่เรียกว่าเดอะร็อกส์ ซึ่งเป็นย่านที่เก่าแก่ที่สุดของเมืองเลย แถวนี้มีคาเฟ่กับร้านอาหารเยอะมากครับ',
      ],
      [
        'Martin',
        'Are there any shops in the area?',
        'แถวนี้มีร้านค้าอะไรบ้างไหมครับ',
      ],
      [
        'Receptionist',
        'There are a few small craft shops and we have a morning market every Saturday and Sunday.',
        'มีร้านขายงานฝีมือเล็กๆ อยู่บ้าง แล้วก็มีตลาดนัดตอนเช้าทุกวันเสาร์-อาทิตย์ครับ',
      ],
      [
        'Martin',
        'The morning market sounds interesting. Are there many stalls?',
        'ตลาดเช้าฟังดูน่าสนใจนะครับ มีร้านเยอะไหมครับ',
      ],
      [
        'Receptionist',
        "Yes, it's very big. You can buy souvenirs, handicrafts, jewelry, clothes. It's very good.",
        'เยอะครับ ตลาดใหญ่มาก มีของที่ระลึก งานฝีมือ เครื่องประดับ เสื้อผ้า ดีเลยครับ',
      ],
      ['Martin', 'Where are the other shops?', 'แล้วร้านอื่นๆ อยู่ที่ไหนครับ'],
      [
        'Receptionist',
        "Most of the shops are up in the city center. It's a short walk away.",
        'ร้านส่วนใหญ่อยู่ในตัวเมืองครับ เดินไม่ไกลเลย',
      ],
      [
        'Martin',
        "And the harbor is nearby, too, isn't it?",
        'แล้วอ่าวก็อยู่ใกล้ๆ ด้วยใช่ไหมครับ',
      ],
      [
        'Receptionist',
        "That's right. You'll have a good view of it from your bedroom window.",
        'ใช่ครับ คุณจะเห็นวิวสวยๆ จากหน้าต่างห้องนอนเลยครับ',
      ],
    ],
  },
  {
    key: 'lst6-unit5-restaurant',
    title: 'Unit 5: At the Restaurant',
    emoji: '🍽️',
    lines: [
      [
        'Waiter',
        'Hello, sir. Are you dining alone?',
        'สวัสดีครับ มาทานคนเดียวใช่ไหมครับ',
      ],
      [
        'Martin',
        'Yes. Uh, table for one, please.',
        'ใช่ครับ เอ่อ ขอโต๊ะสำหรับหนึ่งคนครับ',
      ],
      ['Waiter', 'Smoking or non-smoking?', 'โซนสูบบุหรี่หรือปลอดบุหรี่ครับ'],
      ['Martin', 'Non-smoking, please.', 'ขอปลอดบุหรี่ครับ'],
      [
        'Waiter',
        'I have a table for you. Please follow me.',
        'มีโต๊ะให้แล้วครับ เชิญตามผมมาครับ',
      ],
      ['Martin', 'Thank you.', 'ขอบคุณครับ'],
      [
        'Waiter',
        'Would you like a drink with your meal, sir?',
        'รับเครื่องดื่มด้วยไหมครับ',
      ],
      [
        'Martin',
        'Can I see the wine list, please?',
        'ขอดูรายการไวน์หน่อยได้ไหมครับ',
      ],
      [
        'Waiter',
        "I can recommend the house red. It's a dry wine from the Hunter Valley here in New South Wales.",
        'ผมขอแนะนำไวน์แดงประจำร้านครับ เป็นไวน์รสเข้มจากฮันเตอร์วัลเลย์ในรัฐนิวเซาท์เวลส์นี่เองครับ',
      ],
      [
        'Martin',
        "Okay. I'll have a bottle of the house red, please.",
        'โอเคครับ ขอไวน์แดงประจำร้านหนึ่งขวดครับ',
      ],
      [
        'Waiter',
        "Certainly, sir. Here's tonight's menu. A waitress will be up to shortly to take your order.",
        'ได้ครับ นี่เมนูของคืนนี้ครับ เดี๋ยวพนักงานจะมารับออร์เดอร์เร็วๆ นี้ครับ',
      ],
      ['Martin', 'Okay. Thank you.', 'โอเคครับ ขอบคุณ'],
      [
        'Waiter',
        "Here's the wine that you ordered, sir. Would you like to let it breathe for a little while, or shall I pour it now?",
        'นี่ไวน์ที่คุณสั่งครับ อยากให้เปิดพักไว้สักครู่ก่อน หรือให้รินเลยครับ',
      ],
      ['Martin', "I'll have a glass now, please.", 'ขอรินเลยครับ'],
      [
        'Waiter',
        'Are you ready for me to take your order?',
        'พร้อมสั่งอาหารหรือยังครับ',
      ],
      [
        'Martin',
        "Yes. I'll have the T-bone steak, please.",
        'พร้อมแล้วครับ ขอสเต็กทีโบนครับ',
      ],
      ['Waiter', 'How would you like it cooked?', 'อยากให้สุกระดับไหนครับ'],
      ['Martin', 'Medium rare.', 'มีเดียมแรร์ครับ'],
      [
        'Waiter',
        'Okay. That is served with seasonal vegetables and your choice of jacket potato or chips.',
        'ได้ครับ เสิร์ฟพร้อมผักตามฤดูกาล และให้เลือกมันฝรั่งอบทั้งเปลือกหรือมันฝรั่งทอดครับ',
      ],
      [
        'Martin',
        "Jacket potato, please. I haven't had a jacket potato in a long time.",
        'ขอมันฝรั่งอบทั้งเปลือกครับ ไม่ได้ทานมานานแล้ว',
      ],
      [
        'Waiter',
        "Okay. That's one T-bone steak, medium rare, with seasonal vegetables and a jacket potato.",
        'ได้ครับ สรุปคือสเต็กทีโบนหนึ่งจาน สุกมีเดียมแรร์ พร้อมผักตามฤดูกาลและมันฝรั่งอบทั้งเปลือกครับ',
      ],
      ['Martin', 'Yes. Thank you.', 'ใช่ครับ ขอบคุณ'],
      ['Waiter', 'Is everything okay, sir?', 'ทุกอย่างเรียบร้อยดีไหมครับ'],
      [
        'Martin',
        'Yes, that was delicious. Thank you.',
        'ดีครับ อร่อยมากเลย ขอบคุณ',
      ],
      [
        'Waiter',
        'Would you like some dessert? We have cheese and biscuits, fresh apple pie, and chocolate eclairs.',
        'รับของหวานด้วยไหมครับ เรามีชีสกับบิสกิต พายแอปเปิลสด และเอแคลร์ช็อกโกแลตครับ',
      ],
      [
        'Martin',
        "Oh. Uh, yes, I'll have a chocolate eclair, please.",
        'อ้อ เอ่อ เอาครับ ขอเอแคลร์ช็อกโกแลตครับ',
      ],
      ['Waiter', 'Can I get you anything else?', 'รับอะไรเพิ่มอีกไหมครับ'],
      [
        'Martin',
        "Yes, I'd like a cafe latte, please.",
        'รับครับ ขอกาแฟลาเต้ครับ',
      ],
      ['Waiter', "I'll bring it to you in a moment.", 'เดี๋ยวผมนำมาเสิร์ฟครับ'],
      ['Martin', 'Could I have the bill, please?', 'ขอบิลหน่อยได้ไหมครับ'],
      [
        'Waiter',
        "Certainly. I'll get it for you. Would you like to pay now, or shall I charge it to your room?",
        'ได้ครับ เดี๋ยวผมไปเอามาให้ อยากจ่ายเลยหรือคิดเงินเข้าห้องพักดีครับ',
      ],
      ['Martin', "I'd rather pay now, please.", 'ขอจ่ายเลยดีกว่าครับ'],
      [
        'Waiter',
        'I will be back with the bill. Okay, so you had a T-bone steak, a bottle of the house red, a chocolate eclair, and a cup of coffee. That will be 36.74.',
        'เดี๋ยวผมเอาบิลมาให้นะครับ สรุปคุณสั่งสเต็กทีโบนหนึ่งจาน ไวน์แดงประจำร้านหนึ่งขวด เอแคลร์ช็อกโกแลตหนึ่งชิ้น และกาแฟหนึ่งแก้ว รวมทั้งหมด 36.74 ครับ',
      ],
      ['Martin', 'Is service included?', 'รวมค่าบริการแล้วหรือยังครับ'],
      [
        'Waiter',
        'Yes, that includes tax and 10% service charge.',
        'รวมแล้วครับ รวมภาษีและค่าบริการ 10% แล้ว',
      ],
      [
        'Martin',
        "Here's $40. You can keep the change.",
        'นี่ครับ 40 ดอลลาร์ ไม่ต้องทอนครับ',
      ],
      ['Waiter', 'Thank you very much.', 'ขอบคุณมากครับ'],
      ['Martin', 'Thank you. Goodbye.', 'ขอบคุณครับ สวัสดีครับ'],
      ['Waiter', 'Goodbye.', 'สวัสดีครับ'],
    ],
  },
  {
    key: 'lst6-unit6-bar',
    title: 'Unit 6: At the Bar',
    emoji: '🍺',
    lines: [
      [
        'Martin',
        'Excuse me. Can I order a drink, please?',
        'ขอโทษนะครับ ขอสั่งเครื่องดื่มหน่อยได้ไหมครับ',
      ],
      ['Bartender', 'Sure. What can I get for you?', 'ได้ครับ รับอะไรดีครับ'],
      [
        'Martin',
        "I'd like a beer. What locally produced beers are there?",
        'ผมอยากได้เบียร์ครับ มีเบียร์ที่ผลิตในท้องถิ่นยี่ห้ออะไรบ้างครับ',
      ],
      [
        'Bartender',
        "Well, we have VB, Victoria's Bitter, which is made in Victoria, the southern state, and we have Tooheys, which is produced here in New South Wales.",
        'ก็มี VB หรือวิกตอเรียส์บิตเตอร์ ที่ผลิตในรัฐวิกตอเรียทางใต้ กับมีทูฮีย์ส์ที่ผลิตที่นี่ในรัฐนิวเซาท์เวลส์เลยครับ',
      ],
      ['Martin', "Ooh. I'll have a Tooheys, please.", 'โอ้ ขอทูฮีย์ส์ครับ'],
      [
        'Bartender',
        'Tooheys. Would you like a glass or a midi?',
        'ทูฮีย์ส์นะครับ เอาแบบแก้วหรือแบบมิดี้ดีครับ',
      ],
      ['Martin', "What's a midi?", 'มิดี้คืออะไรครับ'],
      ['Bartender', "It's just a larger glass.", 'ก็แค่แก้วขนาดใหญ่กว่าครับ'],
      ['Martin', "I'll have a midi, then, please.", 'งั้นขอแบบมิดี้ครับ'],
      ['Bartender', 'Here you go.', 'นี่ครับ'],
      ['Martin', 'Thank you.', 'ขอบคุณครับ'],
      [
        'Tony',
        'Hi. Can I join you for a drink?',
        'สวัสดีครับ ขอมานั่งดื่มด้วยได้ไหมครับ',
      ],
      ['Martin', 'Yes. Please do.', 'ได้ครับ เชิญเลย'],
      ['Tony', "My name's Tony. And yours?", 'ผมชื่อโทนี่ครับ แล้วคุณล่ะครับ'],
      [
        'Martin',
        "I'm Martin. Pleased to meet you.",
        'ผมมาร์ตินครับ ยินดีที่ได้รู้จักครับ',
      ],
      [
        'Martin',
        'Are you here for business or for pleasure?',
        'คุณมาที่นี่มาทำงานหรือมาเที่ยวครับ',
      ],
      [
        'Tony',
        "Business. I'm here with a colleague of mine. We have a conference tomorrow.",
        'มาทำงานครับ ผมมากับเพื่อนร่วมงาน พรุ่งนี้มีประชุมกันครับ',
      ],
      [
        'Martin',
        'Will you have any time for sightseeing?',
        'แล้วจะมีเวลาไปเที่ยวชมเมืองบ้างไหมครับ',
      ],
      [
        'Tony',
        "A little. But we come here quite often, so I've seen many of the tourist attractions already.",
        'มีนิดหน่อยครับ แต่ผมมาที่นี่บ่อยอยู่แล้ว เลยเคยไปเที่ยวสถานที่ท่องเที่ยวส่วนใหญ่มาแล้วครับ',
      ],
      [
        'Martin',
        "Yeah. I've come here on business before, too. But I didn't stay very long, and I had no time for sightseeing. This time, I'm only here for a holiday.",
        'ครับ ผมก็เคยมาทำงานที่นี่เหมือนกัน แต่อยู่ไม่นาน เลยไม่มีเวลาเที่ยวเลยครับ ครั้งนี้ผมมาพักร้อนอย่างเดียวเลยครับ',
      ],
      [
        'Tony',
        'Ah, well, you should enjoy it.',
        'อ้อ งั้นก็ควรเที่ยวให้สนุกเลยครับ',
      ],
      [
        'Martin',
        'I hope so. When did you arrive?',
        'หวังว่าจะสนุกนะครับ แล้วคุณมาถึงเมื่อไหร่ครับ',
      ],
      [
        'Tony',
        'Early this afternoon, and you?',
        'มาถึงตอนบ่ายวันนี้เองครับ แล้วคุณล่ะ',
      ],
      [
        'Martin',
        "I've only just arrived myself.",
        'ผมก็เพิ่งมาถึงเหมือนกันครับ',
      ],
      ['Tony', 'Are you planning on staying long?', 'วางแผนจะอยู่นานไหมครับ'],
      [
        'Martin',
        "Oh, I'm here for a week. How about you?",
        'อ้อ ผมอยู่หนึ่งอาทิตย์ครับ แล้วคุณล่ะ',
      ],
      ['Tony', 'Just a couple of nights.', 'ผมอยู่แค่สองสามคืนเองครับ'],
      [
        'Martin',
        "Oh, that's too bad. It must be very tiring for you.",
        'โอ้ น่าเสียดายจัง คงเหนื่อยน่าดูเลยนะครับ',
      ],
      [
        'Tony',
        "A little, but I'm used to it. Are you traveling alone?",
        'เหนื่อยนิดหน่อยครับ แต่ผมชินแล้ว แล้วคุณเดินทางมาคนเดียวหรือเปล่าครับ',
      ],
      [
        'Martin',
        "Yes. Unfortunately, my girlfriend has work commitments, so she couldn't make it.",
        'ใช่ครับ แฟนผมติดงานเลยมาไม่ได้ครับ น่าเสียดายจริงๆ',
      ],
      [
        'Tony',
        'Well, just try and stay out of trouble.',
        'งั้นก็พยายามอย่าไปมีเรื่องอะไรนะครับ',
      ],
      [
        'Martin',
        'Well, that would be no fun at all.',
        'อย่างนั้นก็คงไม่สนุกเลยสิครับ',
      ],
      [
        'Tony',
        "So, do you normally go shopping while you're over here?",
        'ปกติมาที่นี่แล้วคุณไปช้อปปิ้งด้วยไหมครับ',
      ],
      [
        'Martin',
        'I try to avoid it. I do not enjoy shopping. I will have to buy some souvenirs for my kids, though.',
        'ผมพยายามเลี่ยงเลยครับ ไม่ค่อยชอบช้อปปิ้งเท่าไหร่ แต่ก็คงต้องซื้อของฝากให้ลูกๆ อยู่ดีครับ',
      ],
      [
        'Martin',
        'What are the best souvenirs to buy in Australia?',
        'มีของฝากอะไรดีๆ ที่ควรซื้อในออสเตรเลียบ้างไหมครับ',
      ],
      [
        'Tony',
        'Well, Australia is well-known for its wildlife. There are a lot of things with kangaroos and koalas on them.',
        'ออสเตรเลียขึ้นชื่อเรื่องสัตว์ป่าท้องถิ่นครับ มีของเยอะแยะเลยที่มีลายจิงโจ้กับโคอาล่า',
      ],
      ['Martin', 'Anything else?', 'มีอย่างอื่นอีกไหมครับ'],
      [
        'Tony',
        'Aboriginal art is really good. There are lots of things with Aboriginal art decorated on them.',
        'งานศิลปะของชาวอะบอริจินก็ดีมากครับ มีของหลายอย่างที่ตกแต่งด้วยลายศิลปะอะบอริจิน',
      ],
      [
        'Martin',
        "Hmm. Yeah. I'll look out for that. Then of course there is the famous didgeridoo.",
        'อืม ครับ เดี๋ยวลองหาดูนะครับ แล้วก็ยังมีดิดเจอรีดูที่ขึ้นชื่ออีกด้วยใช่ไหมครับ',
      ],
      [
        'Tony',
        'Oh, the Aboriginal musical instrument. Have you ever played it before?',
        'อ้อ เครื่องดนตรีของชาวอะบอริจินใช่ไหมครับ เคยเล่นมันมาก่อนไหมครับ',
      ],
      [
        'Martin',
        "Yes. It's harder than it looks.",
        'เคยครับ เล่นยากกว่าที่เห็นเยอะเลย',
      ],
      [
        'Tony',
        "Well, I'll have to try it while I'm here. Good luck.",
        'งั้นผมคงต้องลองเล่นดูตอนอยู่ที่นี่ โชคดีนะครับ',
      ],
      [
        'Martin',
        "Um, well, I'm afraid I have to go to bed now.",
        'เอ่อ ครับ ผมคงต้องไปนอนแล้วล่ะครับ',
      ],
      [
        'Tony',
        'I should too. I have work in the morning. Thanks for the company. Hope to see you again.',
        'ผมก็เหมือนกันครับ พรุ่งนี้เช้าต้องทำงานด้วย ขอบคุณที่ชวนคุยเป็นเพื่อนนะครับ หวังว่าจะได้เจอกันอีก',
      ],
      ['Martin', 'Maybe.', 'อาจจะนะครับ'],
      [
        'Tony',
        "Have a good night's sleep and enjoy your sightseeing tomorrow.",
        'ราตรีสวัสดิ์ครับ แล้วก็ขอให้พรุ่งนี้เที่ยวให้สนุกนะครับ',
      ],
      [
        'Martin',
        'Thank you. I will. Good night.',
        'ขอบคุณครับ จะพยายามครับ ราตรีสวัสดิ์ครับ',
      ],
      ['Tony', 'Good night.', 'ราตรีสวัสดิ์ครับ'],
    ],
  },
  {
    key: 'lst6-unit7-services',
    title: 'Unit 7: Using Different Kinds of Services',
    emoji: '🛎️',
    lines: [
      [
        'Staff',
        'Good morning, room service. How can I help you?',
        'สวัสดีตอนเช้าค่ะ รูมเซอร์วิสค่ะ มีอะไรให้ช่วยคะ',
      ],
      [
        'Martin',
        "Good morning. I'd like to order some breakfast, please.",
        'สวัสดีครับ ผมอยากสั่งอาหารเช้าครับ',
      ],
      ['Staff', 'Certainly. What would you like, sir?', 'ได้ค่ะ อยากได้อะไรคะ'],
      ['Martin', 'What cereals do you have?', 'มีซีเรียลอะไรบ้างครับ'],
      [
        'Staff',
        'Well, we have corn flakes, we have muesli, Weet-Bix, and All-Bran.',
        'มีคอร์นเฟลก มูสลี วีทบิกซ์ และออลบรานค่ะ',
      ],
      [
        'Martin',
        "I'll have a bowl of corn flakes, please.",
        'ขอคอร์นเฟลกหนึ่งชามครับ',
      ],
      ['Staff', 'Would you like anything else, sir?', 'รับอะไรเพิ่มไหมคะ'],
      [
        'Martin',
        "Yes, I'd like two poached eggs on toast, please.",
        'รับครับ ขอไข่ลวกสองฟองวางบนขนมปังปิ้งด้วยครับ',
      ],
      [
        'Staff',
        "Okay. That's one bowl of corn flakes and two poached eggs on toast. Would you like a drink with your breakfast?",
        'ได้ค่ะ สรุปคือคอร์นเฟลกหนึ่งชาม กับไข่ลวกสองฟองบนขนมปังปิ้ง รับเครื่องดื่มด้วยไหมคะ',
      ],
      [
        'Martin',
        'Yes. Can I have a cup of coffee and some orange juice, please?',
        'รับครับ ขอกาแฟหนึ่งแก้วกับน้ำส้มด้วยครับ',
      ],
      [
        'Staff',
        'Sure. It will be sent to you in 15 minutes. The bill will be charged to your room.',
        'ได้ค่ะ จะส่งไปให้ภายใน 15 นาที คิดเงินเข้าห้องพักนะคะ',
      ],
      ['Martin', 'Thank you. Goodbye.', 'ขอบคุณครับ สวัสดีครับ'],
      ['Staff', 'Bye-bye.', 'สวัสดีค่ะ'],
      [
        'Staff',
        'Good morning, sir. How can I help you?',
        'สวัสดีตอนเช้าค่ะ มีอะไรให้ช่วยคะ',
      ],
      [
        'Martin',
        "I'd like to exchange some currency. Is there a bank nearby?",
        'ผมอยากแลกเงินครับ แถวนี้มีธนาคารไหมครับ',
      ],
      [
        'Staff',
        "I'm afraid they're all closed on Sundays.",
        'เกรงว่าวันนี้วันอาทิตย์ธนาคารปิดหมดเลยค่ะ',
      ],
      [
        'Martin',
        "Oh, yes. I forgot that it's Sunday.",
        'อ้อ จริงด้วยครับ ลืมไปเลยว่าวันนี้วันอาทิตย์',
      ],
      [
        'Staff',
        'We do have a cashier service available here, though. What currency would you like to change?',
        'แต่เรามีบริการแลกเงินที่นี่ค่ะ อยากแลกเงินสกุลไหนคะ',
      ],
      [
        'Martin',
        "I'd like to change Thai baht into Australian dollars.",
        'ผมอยากแลกเงินบาทไทยเป็นดอลลาร์ออสเตรเลียครับ',
      ],
      [
        'Staff',
        'Sure. Our exchange rate is 22.62 baht to the dollar. And our commission fee is 2%.',
        'ได้ค่ะ อัตราแลกเปลี่ยนของเราคือ 22.62 บาทต่อดอลลาร์ และคิดค่าธรรมเนียม 2% ค่ะ',
      ],
      [
        'Martin',
        "Okay. Uh, I'd like to change 10,000 baht, please.",
        'ครับ เอ่อ ผมขอแลก 10,000 บาทครับ',
      ],
      [
        'Staff',
        "Fine. That's $442.08 minus $8.84 commission.",
        'ได้ค่ะ เท่ากับ 442.08 ดอลลาร์ หักค่าธรรมเนียม 8.84 ดอลลาร์ค่ะ',
      ],
      ['Martin', 'Okay.', 'โอเคครับ'],
    ],
  },
  {
    key: 'lst6-unit8-concierge',
    title: 'Unit 8: Concierge',
    emoji: '🗺️',
    lines: [
      [
        'Martin',
        'Hi. I wonder if you can help me.',
        'สวัสดีครับ ไม่ทราบว่าจะช่วยผมได้ไหมครับ',
      ],
      [
        'Concierge',
        'I will certainly try. What can I do for you?',
        'ได้แน่นอนค่ะ มีอะไรให้ดิฉันช่วยคะ',
      ],
      [
        'Martin',
        "Well, it's my first day here in Sydney and I would like some advice on the local tourist spots.",
        'คือวันนี้เป็นวันแรกที่ผมมาซิดนีย์ครับ อยากขอคำแนะนำเรื่องสถานที่ท่องเที่ยวในท้องถิ่นหน่อยครับ',
      ],
      [
        'Concierge',
        "We offer a wide range of tours. Have a look at these leaflets and uh, see if there's anything you like.",
        'เรามีทัวร์หลากหลายให้เลือกค่ะ ลองดูใบปลิวพวกนี้ดูสิคะ ว่ามีอันไหนที่คุณสนใจไหม',
      ],
      [
        'Martin',
        "What's the wildlife park like?",
        'สวนสัตว์ป่าเป็นยังไงบ้างครับ',
      ],
      [
        'Concierge',
        "Oh, it's very good. If you don't have time to go and see the wildlife in its natural habitat, you should try it.",
        'โอ้ ดีมากเลยค่ะ ถ้าคุณไม่มีเวลาไปดูสัตว์ป่าในถิ่นที่อยู่ตามธรรมชาติ ก็ควรลองไปที่นี่ดูค่ะ',
      ],
      ['Martin', 'What animals do they have there?', 'มีสัตว์อะไรบ้างครับ'],
      [
        'Concierge',
        "Oh, let's see now. They have kangaroos, koalas, possums, wombats, and emus. There's a lot.",
        'อ้อ ขอดูก่อนนะคะ มีจิงโจ้ โคอาล่า พอสซัม วอมแบต และนกอีมู เยอะเลยค่ะ',
      ],
      [
        'Martin',
        "I like wildlife. So, that's one place that I should visit.",
        'ผมชอบสัตว์ป่าครับ งั้นนี่คือที่หนึ่งที่ผมควรไปเยี่ยมชมเลย',
      ],
      [
        'Concierge',
        'The leaflet says that that place is a koala sanctuary, too.',
        'ใบปลิวบอกว่าที่นั่นเป็นศูนย์อนุรักษ์โคอาล่าด้วยนะคะ',
      ],
      [
        'Concierge',
        'Yes, New South Wales has a lot of bushfires in the summer.',
        'ใช่ค่ะ ที่รัฐนิวเซาท์เวลส์มีไฟป่าเยอะมากในช่วงหน้าร้อน',
      ],
      [
        'Martin',
        'Yes, I remember reading about one in the newspaper not very long ago.',
        'ครับ ผมจำได้ว่าเคยอ่านข่าวเรื่องนี้ในหนังสือพิมพ์เมื่อไม่นานมานี้',
      ],
      [
        'Concierge',
        'Mhm. A lot of koalas are made homeless when the forests are burned down. The sanctuary re-homes them.',
        'ค่ะ โคอาล่าหลายตัวไร้ที่อยู่เวลาป่าถูกไฟไหม้ ศูนย์อนุรักษ์แห่งนี้ก็จะหาที่อยู่ใหม่ให้พวกมันค่ะ',
      ],
      [
        'Martin',
        "Well, it's nice to know that the money goes to a good cause.",
        'ดีจังที่รู้ว่าเงินที่จ่ายไปช่วยเหลือเรื่องดีๆ แบบนี้ด้วยครับ',
      ],
      [
        'Concierge',
        "Obviously, it's not just koalas. A lot of other animals are either killed or injured, too, in the fires.",
        'แน่นอนค่ะ ไม่ใช่แค่โคอาล่าเท่านั้น สัตว์อื่นๆ อีกมากมายก็ตายหรือบาดเจ็บจากไฟป่าด้วยเหมือนกันค่ะ',
      ],
      [
        'Martin',
        'Okay. This is another place on my list of places to visit. There is a bus that goes there every morning at 9:00 a.m.',
        'โอเคครับ นี่ก็เป็นอีกที่ในลิสต์ที่ผมอยากไปเที่ยว มีรถบัสไปที่นั่นทุกเช้าเก้าโมงด้วยสินะครับ',
      ],
      [
        'Concierge',
        'Would you like me to book a place for you?',
        'ให้ดิฉันจองที่ให้เลยไหมคะ',
      ],
      [
        'Martin',
        "Yes, I'll go tomorrow. Will the bus pick me up from the hotel?",
        'ครับ ผมจะไปพรุ่งนี้เลย แล้วรถบัสจะมารับผมจากโรงแรมไหมครับ',
      ],
      [
        'Concierge',
        'Yes, just wait at reception and they will call you.',
        'ค่ะ แค่รอที่แผนกต้อนรับ แล้วเขาจะเรียกคุณเองค่ะ',
      ],
      [
        'Martin',
        'Are there many things to see closer to the hotel?',
        'แถวใกล้ๆ โรงแรมมีที่เที่ยวเยอะไหมครับ',
      ],
      [
        'Concierge',
        'Yes, here is a map of the area. It is yours to keep.',
        'มีค่ะ นี่แผนที่บริเวณนี้ เก็บไว้ได้เลยค่ะ',
      ],
      [
        'Martin',
        "Thank you. I'd like to take a walk around. Uh, where should I start?",
        'ขอบคุณครับ ผมอยากเดินเที่ยวรอบๆ ดู เอ่อ ควรเริ่มจากตรงไหนดีครับ',
      ],
      [
        'Concierge',
        'Well, the hotel is located here, right near the boat key. Right around the corner is the weekend market. It is open right now. You could start there.',
        'อ่อ โรงแรมอยู่ตรงนี้ค่ะ ใกล้กับท่าเรือเลย เดินอ้อมมุมไปหน่อยก็จะเจอตลาดนัดสุดสัปดาห์ ตอนนี้เปิดอยู่ด้วยค่ะ เริ่มจากตรงนั้นก็ได้ค่ะ',
      ],
      [
        'Martin',
        'Oh, yes. Thank you, I will. And after that?',
        'อ้อ ครับ ขอบคุณ เดี๋ยวไปดูนะครับ แล้วหลังจากนั้นล่ะครับ',
      ],
      [
        'Concierge',
        'Right across from the boat key is the opera house. You could take a tour of the complex.',
        'ตรงข้ามท่าเรือเลยก็คือโรงอุปรากรค่ะ เข้าไปชมภายในได้ด้วยค่ะ',
      ],
      [
        'Martin',
        'Mhm. That sounds good, too. What shows are on at the moment?',
        'อืม ฟังดูดีเหมือนกันครับ ตอนนี้มีการแสดงอะไรบ้างครับ',
      ],
      [
        'Concierge',
        "Well, here is a leaflet of all the performances this month. You can check for availability of seats at the booking office whilst you're there.",
        'นี่ค่ะใบปลิวรวมการแสดงทั้งหมดของเดือนนี้ คุณเช็คที่นั่งว่างได้ที่เคาน์เตอร์จองบัตรตอนไปถึงที่นั่นเลยค่ะ',
      ],
      [
        'Martin',
        'Thank you very much for all your help. I better go now before the market closes.',
        'ขอบคุณมากครับที่ช่วยเหลือทุกอย่าง ผมต้องรีบไปก่อนตลาดปิดแล้วล่ะครับ',
      ],
      [
        'Concierge',
        "No problem, sir. I'm at this desk every day should you need any other advice. Goodbye and have a great day.",
        'ไม่เป็นไรค่ะ ดิฉันอยู่ที่เคาน์เตอร์นี้ทุกวัน ถ้าต้องการคำแนะนำอะไรอีกก็มาถามได้เลยค่ะ สวัสดีค่ะ ขอให้เป็นวันที่ดีนะคะ',
      ],
    ],
  },
  {
    key: 'lst6-unit9-sightseeing',
    title: 'Unit 9: Sightseeing',
    emoji: '📸',
    lines: [
      [
        'Martin',
        'How much are these t-shirts?',
        'เสื้อยืดพวกนี้ราคาเท่าไหร่ครับ',
      ],
      [
        'Shop clerk',
        "The adult sizes are $10 each and the children's sizes are $6.",
        'ไซส์ผู้ใหญ่ตัวละ 10 ดอลลาร์ค่ะ ส่วนไซส์เด็กตัวละ 6 ดอลลาร์ค่ะ',
      ],
      [
        'Martin',
        'Hm. I could buy some for my niece and nephews.',
        'อืม ผมน่าจะซื้อให้หลานสาวกับหลานชายได้นะครับ',
      ],
      [
        'Shop clerk',
        'I can give you a discount. Three shirts for $15, okay?',
        'ลดราคาให้ได้ค่ะ สามตัว 15 ดอลลาร์ เอาไหมคะ',
      ],
      [
        'Martin',
        'Okay, that sounds like a good bargain.',
        'โอเคครับ ฟังดูคุ้มดี',
      ],
      ['Shop clerk', 'What sizes do you want?', 'อยากได้ไซส์ไหนคะ'],
      [
        'Martin',
        'Well, my niece is 8 years old and the twins are five.',
        'หลานสาวผมอายุ 8 ขวบครับ ส่วนฝาแฝดอายุ 5 ขวบ',
      ],
      ['Shop clerk', 'What designs do you want?', 'อยากได้ลายอะไรคะ'],
      [
        'Martin',
        "Hm. Well, my niece would love this koala t-shirt, but I'm not sure about the boys. Yeah, maybe the kangaroos.",
        'อืม หลานสาวผมน่าจะชอบเสื้อลายโคอาล่าตัวนี้ แต่ไม่แน่ใจว่าเด็กผู้ชายจะชอบอะไร เอาลายจิงโจ้ก็แล้วกันครับ',
      ],
      ['Shop clerk', 'What colors would you like?', 'อยากได้สีอะไรคะ'],
      [
        'Martin',
        "Hm. Okay, I'll have an orange koala t-shirt and a blue and a red kangaroo t-shirt.",
        'อืม โอเค ขอเสื้อลายโคอาล่าสีส้มหนึ่งตัว กับลายจิงโจ้สีฟ้ากับสีแดงอย่างละตัวครับ',
      ],
      ['Shop clerk', 'That will be $15.', 'รวมทั้งหมด 15 ดอลลาร์ค่ะ'],
      ['Martin', '$15? Here you are.', '15 ดอลลาร์เหรอครับ นี่ครับ'],
      ['Shop clerk', 'Thank you.', 'ขอบคุณค่ะ'],
      ['Martin', 'Thank you.', 'ขอบคุณครับ'],
      [
        'Martin',
        "Hey. I'm interested in seeing a ballet performance.",
        'สวัสดีครับ ผมสนใจดูการแสดงบัลเลต์ครับ',
      ],
      [
        'Box office clerk',
        "Oh, well, we have Mirror Mirror showing at the moment. It's a performance based on the story of Snow White.",
        'อ้อ ตอนนี้เรามีการแสดงเรื่อง Mirror Mirror ค่ะ เป็นเรื่องราวที่ดัดแปลงมาจากสโนว์ไวท์ค่ะ',
      ],
      [
        'Martin',
        'That sounds good. Can you tell me the showtimes?',
        'ฟังดูดีนะครับ บอกรอบการแสดงหน่อยได้ไหมครับ',
      ],
      [
        'Box office clerk',
        "Yes, um, let's see, we have evening performances at 7:00 during the week and on weekends we have a matinee that begins at 4:00.",
        'ได้ค่ะ เอ่อ ขอดูก่อนนะคะ วันธรรมดามีรอบเย็นหนึ่งทุ่ม ส่วนวันหยุดมีรอบบ่ายเริ่มสี่โมงเย็นค่ะ',
      ],
      [
        'Martin',
        'Do you have any seats available for an evening this week?',
        'มีที่นั่งว่างสำหรับรอบเย็นอาทิตย์นี้ไหมครับ',
      ],
      [
        'Box office clerk',
        'This week, let me check. Yes, what day would you like?',
        'อาทิตย์นี้นะคะ ขอเช็กก่อนนะคะ มีค่ะ อยากได้วันไหนคะ',
      ],
      ['Martin', 'Um, Tuesday, please.', 'เอ่อ ขอวันอังคารครับ'],
      [
        'Box office clerk',
        'Okay, and would you like to sit in the stalls or the balcony?',
        'ได้ค่ะ แล้วอยากนั่งชั้นล่างหรือชั้นระเบียงคะ',
      ],
      ['Martin', 'The balcony, please.', 'ขอชั้นระเบียงครับ'],
      [
        'Box office clerk',
        "Okay, that's one ticket for Tuesday's performance of Mirror Mirror. You have a seat in the balcony and I'll see if I can get you as close to the front as possible. Okay, and that's $78.",
        'ได้ค่ะ บัตรหนึ่งใบสำหรับการแสดง Mirror Mirror รอบวันอังคาร นั่งชั้นระเบียง ดิฉันจะพยายามจัดที่นั่งใกล้ด้านหน้าที่สุดให้นะคะ ราคาทั้งหมด 78 ดอลลาร์ค่ะ',
      ],
      ['Martin', 'Okay, there you go.', 'โอเคครับ นี่ครับ'],
      [
        'Box office clerk',
        "Okay. And here's your ticket. I hope you enjoy the show.",
        'ค่ะ นี่บัตรของคุณค่ะ หวังว่าจะสนุกกับการแสดงนะคะ',
      ],
      [
        'Martin',
        'Um, thanks. Oh, um, can you tell me the way to the art museum?',
        'เอ่อ ขอบคุณครับ อ้อ เอ่อ บอกทางไปพิพิธภัณฑ์ศิลปะหน่อยได้ไหมครับ',
      ],
      [
        'Box office clerk',
        'Yes, just go out the door, take a right, go around the botanical gardens, and you should see the art museum right in front of you.',
        'ได้ค่ะ แค่เดินออกประตูไป เลี้ยวขวา อ้อมสวนพฤกษศาสตร์ไป แล้วคุณจะเห็นพิพิธภัณฑ์ศิลปะอยู่ตรงหน้าเลยค่ะ',
      ],
      [
        'Martin',
        "Okay. Thanks. I hope I don't get lost.",
        'โอเคครับ ขอบคุณ หวังว่าจะไม่หลงทางนะครับ',
      ],
      [
        'Box office clerk',
        "Don't worry, there are signs along the way.",
        'ไม่ต้องกังวลค่ะ มีป้ายบอกทางตลอดทางเลยค่ะ',
      ],
      [
        'Martin',
        "Good, I'll probably need them. Thanks, bye.",
        'ดีครับ คงต้องพึ่งป้ายพวกนั้นแหละ ขอบคุณครับ สวัสดีครับ',
      ],
      ['Box office clerk', 'Bye.', 'สวัสดีค่ะ'],
    ],
  },
  {
    key: 'lst6-unit10-passerby',
    title: 'Unit 10: Stopping a Passerby',
    emoji: '🧭',
    lines: [
      [
        'Martin',
        "Excuse me. I think I'm lost. Can you help me?",
        'ขอโทษนะครับ ผมคิดว่าผมหลงทางแล้วครับ ช่วยผมได้ไหมครับ',
      ],
      [
        'Passerby',
        'Sure. Where do you want to go?',
        'ได้ครับ อยากไปที่ไหนครับ',
      ],
      [
        'Martin',
        "Well, I'm trying to get back to my hotel. I'm staying at the Four Seasons. Do you know it?",
        'คือผมพยายามจะกลับโรงแรมครับ ผมพักที่โฟร์ซีซั่นส์ รู้จักไหมครับ',
      ],
      [
        'Passerby',
        "Yes, I do. You're quite a long way away.",
        'รู้จักครับ แต่คุณเดินมาไกลจากที่นั่นมากเลยนะครับ',
      ],
      ['Martin', 'I thought I might be.', 'ผมก็คิดว่าคงจะไกลอยู่แล้วล่ะครับ'],
      [
        'Passerby',
        "You'll have to walk back to the center of the city. I could direct you, but it's complicated.",
        'คุณต้องเดินกลับไปที่ใจกลางเมืองครับ ผมบอกทางให้ได้นะครับ แต่มันค่อนข้างซับซ้อน',
      ],
      [
        'Martin',
        'Maybe I better catch a taxi.',
        'งั้นผมน่าจะเรียกแท็กซี่ดีกว่าครับ',
      ],
      [
        'Passerby',
        'I think that might be a good idea. You can get one at the end of the road.',
        'ผมว่าเป็นความคิดที่ดีเลยครับ เรียกได้ที่ปลายถนนนี้เลยครับ',
      ],
      [
        'Martin',
        'Okay. Thanks for your help. Goodbye.',
        'โอเคครับ ขอบคุณที่ช่วยนะครับ สวัสดีครับ',
      ],
      ['Passerby', 'Goodbye.', 'สวัสดีครับ'],
      [
        'Staff',
        'Good evening, sir. Welcome back.',
        'สวัสดีตอนเย็นครับ ยินดีต้อนรับกลับมาครับ',
      ],
      ['Martin', 'Thank you.', 'ขอบคุณครับ'],
      [
        'Staff',
        'Did you have a good day?',
        'วันนี้เป็นยังไงบ้างครับ สนุกไหมครับ',
      ],
      [
        'Martin',
        'Yes, thank you. I went to the market, the opera house, and the art museum. I did get lost on my way back, though.',
        'สนุกครับ ขอบคุณ ผมไปตลาด โรงอุปรากร แล้วก็พิพิธภัณฑ์ศิลปะมาครับ แต่ตอนกลับก็หลงทางไปหน่อยครับ',
      ],
      [
        'Staff',
        "Oh, dear. I'm sure you'll soon find your bearings.",
        'โอ้ ไม่เป็นไรครับ เดี๋ยวก็คุ้นทางเองครับ',
      ],
      [
        'Martin',
        "Well, I think that's enough for one day. I'm going to go have some dinner and go to my room.",
        'ครับ ผมว่าวันนี้พอแค่นี้ก่อนดีกว่า ผมจะไปทานมื้อเย็นแล้วเข้าห้องพักครับ',
      ],
      ['Staff', "Okay. Have a good night's sleep.", 'ครับ ราตรีสวัสดิ์ครับ'],
      [
        'Martin',
        'Thank you. I plan to. I have a lot more to see tomorrow.',
        'ขอบคุณครับ ตั้งใจไว้อย่างนั้นเลย พรุ่งนี้ยังมีที่ต้องไปเที่ยวอีกเยอะเลยครับ',
      ],
    ],
  },
  {
    key: 'lst6-bonus-vehicles',
    title: 'Bonus: Vehicle Vocabulary & the "s"/"z" Sounds',
    emoji: '🚗',
    lines: [
      [
        'Mary',
        "Hi there. This is Mary from VIPs TV. Today, we're going to study about means of transport. And today, we're going to study about private transportation. Okay? Now, there are five cars today I want to introduce to you.",
        'สวัสดีค่ะ นี่แมรี่จากช่อง VIPs TV ค่ะ วันนี้เราจะมาเรียนเรื่องยานพาหนะกันค่ะ และวันนี้เราจะเรียนเรื่องยานพาหนะส่วนตัวโดยเฉพาะค่ะ โอเคนะคะ วันนี้ดิฉันจะแนะนำยานพาหนะห้าชนิดให้รู้จักกันค่ะ',
      ],
      [
        'Mary',
        'The first one is car. This one is car, right? The second one, truck or lorry. This is the truck or lorry.',
        'อันแรกคือ car (รถยนต์) นี่คือ car ใช่ไหมคะ อันที่สอง truck หรือ lorry (รถบรรทุก) นี่คือ truck หรือ lorry ค่ะ',
      ],
      [
        'Mary',
        'Number three, we have motorbike or motorcycle. And number four, we have bike or bicycle. And the last one is scooter or motor scooter, okay? This one is very, very, very popular in Vietnam.',
        'อันที่สาม motorbike หรือ motorcycle (มอเตอร์ไซค์) ค่ะ และอันที่สี่ bike หรือ bicycle (จักรยาน) ค่ะ และอันสุดท้ายคือ scooter หรือ motor scooter (สกู๊ตเตอร์) ค่ะ อันนี้ได้รับความนิยมมากๆ ในเวียดนามเลยค่ะ',
      ],
      [
        'Mary',
        'Uh, now let\'s get started. Number one, car. Car, this is long R, okay? Don\'t pronounce "ca." That is car, okay? Car.',
        'เอาล่ะค่ะ เริ่มกันเลย คำแรก car ค่ะ ตัว R ตรงนี้ต้องออกเสียงยาวนะคะ อย่าออกเสียงแค่ "ค่า" นะคะ ต้องเป็น car ค่ะ',
      ],
      [
        'Mary',
        'Number two, this is truck. Truck, remember to pronounce "tr" together, okay? Your lip shapes are rounded, tr. Truck. Don\'t pronounce "juck," okay? Truck for American English.',
        'คำที่สอง truck ค่ะ อย่าลืมออกเสียง tr ติดกันนะคะ ปากทำรูปกลมๆ tr...truck อย่าออกเสียงเป็น "จัค" นะคะ truck นี้เป็นแบบอเมริกันค่ะ',
      ],
      [
        'Mary',
        'In British English, people prefer saying lorry. Remember, American English, truck. And if you go to England, you have to use lorry.',
        'ส่วนภาษาอังกฤษแบบอังกฤษ คนจะนิยมพูดว่า lorry ค่ะ จำไว้นะคะ ภาษาอังกฤษแบบอเมริกันใช้ truck แต่ถ้าไปอังกฤษต้องใช้ lorry ค่ะ',
      ],
      [
        'Mary',
        'The tip of your tongue, here. Put the tip of your tongue behind your gum ridge, okay? This is your tongue. And this is your gum ridge, right behind your upper teeth, okay? Put the tip of your tongue behind your gum ridge. And then make an air flow through the passage along the center of the tongue. You will feel a regular air flow come through your tongue and then through the gaps between your two teeth here.',
        'ปลายลิ้นอยู่ตรงนี้นะคะ วางปลายลิ้นไว้หลังปุ่มเหงือกค่ะ นี่คือลิ้นของเรา และนี่คือปุ่มเหงือก อยู่หลังฟันบนเลยค่ะ วางปลายลิ้นไว้หลังปุ่มเหงือก แล้วปล่อยลมออกผ่านกลางลิ้น คุณจะรู้สึกว่าลมไหลผ่านลิ้นแล้วออกทางช่องว่างระหว่างฟันสองซี่นี้ค่ะ',
      ],
      [
        'Mary',
        'Remember, tip of your tongue and gum ridge. Understand? No vibration. So, this is salad. This one, soup. This one, lobster. Sausage. Else.',
        'จำไว้นะคะ ปลายลิ้นตรงนี้กับปุ่มเหงือก เข้าใจไหมคะ ไม่ต้องสั่นเสียงนะคะ เสียงนี้อยู่ในคำว่า salad, soup, lobster, sausage, else ค่ะ',
      ],
      [
        'Mary',
        'Now with this one, z. The same, okay? But with vibration. Remember the tip of your tongue behind your gum ridge. Like this, okay? Remember to flatten your tongue out. Not "sh." Just like this. And make an air flow, regular air flow through the passage along the center of your tongue through your teeth. Remember that. And with vibration.',
        'ทีนี้มาที่เสียง z ค่ะ ตำแหน่งลิ้นเหมือนเดิม แต่ต้องมีการสั่นเสียงด้วยนะคะ จำไว้ว่าปลายลิ้นอยู่หลังปุ่มเหงือก แบบนี้ค่ะ อย่าลืมทำลิ้นให้แบนราบนะคะ ไม่ใช่เสียง "ช" นะคะ ต้องแบบนี้ค่ะ แล้วปล่อยลมออกทางกลางลิ้นผ่านฟัน พร้อมกับสั่นเสียงด้วยค่ะ',
      ],
      [
        'Mary',
        'Ah, okay. Uh, some of my students, they say this is "you" or "yebra." Sorry, no, this is zoo. Zoo, zebra, music, lazy, jazz, because. Because — you can pronounce this one as "because," but usually when we speak English, we say this one as "because."',
        'อ้อ ค่ะ นักเรียนบางคนออกเสียงคำนี้เป็น "ยู" หรือ "เยบรา" นะคะ ไม่ใช่นะคะ คำนี้คือ zoo ค่ะ zoo, zebra, music, lazy, jazz, because ค่ะ คำว่า because นี้ออกเสียงได้สองแบบ แต่ปกติเวลาพูดภาษาอังกฤษเราจะออกเสียงแบบที่มีเสียง z นี้ค่ะ',
      ],
      [
        'Mary',
        'Okay, very quick. Because. Zoo, zebra, music, lazy, jazz, because.',
        'โอเคค่ะ เร็วๆ นะคะ zoo, zebra, music, lazy, jazz, because ค่ะ',
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
      displayOrder: 6,
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
    `Listening seed (Lesson 6) done: units=${unitsUpserted}, lines=${linesInserted}`,
  );
  await dataSource.destroy();
}

main().catch((err) => {
  console.error('Listening seed (Lesson 6) failed:', err);
  process.exit(1);
});
