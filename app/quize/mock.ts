import type { Question } from "./system";

function shuffle<T>(data: T[]) {
  const orig = [...data];
  const result = [];

  while (orig.length) {
    const index = Math.floor(Math.random() * orig.length);
    const el = orig.splice(index, 1)[0];

    result.push(el);
  }

  return result;
}

export const mockQuestions: Question[] = [
  {
    id: 0,
    text: "В Средние века дороги в Англии были настолько небезопасны, что человек в повозке держал в руке меч. Последствия этого видны до сих пор. Каковы же они?",
    options: null,
    correctAnswer: "Левосторонее движение",
    timerDuration: 59,
  },
  {
    id: 1,
    text: "Кадр из какого мультфильма изображен?",
    imageUrl: "/quize/assets/rabbit.png",
    options: null,
    correctAnswer: "Зверополис",
  },
  {
    id: 2,
    text: "Какой из этих романов не принадлежит Льву Толстому?",
    options: [
      "«Анна Каренина»",
      "«Воскресение»",
      "«Отцы и дети»",
      "«Война и мир»",
    ],
    correctAnswer: "«Отцы и дети»",
  },
  {
    id: 3,
    text: "Назовите группу исполняющую оригинал",
    audioUrl: "/quize/assets/moshenniki.m4a",
    options: null,
    correctAnswer: "Кумкват",
  },
  {
    id: 4,
    text: "Назовите группу? ",
    audioUrl: "/quize/assets/Premer-Ministr_-_Dva_brillianta_(SkySound.cc).mp3",
    options: null,
    correctAnswer: "Bob dilan",
  },
  {
    id: 5,
    text: "Альбатрос может спать во время полета.",
    imageUrl: "/quize/assets/albatros.jpg",
    options: ["Правда", "Неправда"],
    correctAnswer: "Правда",
  },
  {
    id: 6,
    text: "Кто исполняет оригинал? ",
    audioUrl:
      "/quize/assets/RAIGN_-_2._Knocking_on_Heavens_Door_(SkySound.cc).mp3",
    options: null,
    correctAnswer: "Bob dilan",
  },
  {
    id: 7,
    text: "Какое выражение так изобразила нейросеть?",
    options: null,
    imageUrl: "/quize/assets/sneg.png",
    correctAnswer: "Нести пургу",
  },
  {
    id: 8,
    text: "Страусы прячут голову в песок.",
    options: ["Правда", "Неправда"],
    correctAnswer: "Неправда",
  },
  {
    id: 9,
    text: "Кто из этих персонажей произнес фразу «Средства у нас есть. У нас ума не хватает!»?",
    imageUrl: "/quize/assets/sred.png",
    options: ["Карлсон", "Кот Матроскин", "Кеша", "Домовенок Кузя"],
    correctAnswer: "Кот Матроскин",
  },
  {
    id: 10,
    text: "Чего боится наша Ира?",
    options: null,
    correctAnswer: "Высота",
  },
  {
    id: 11,
    text: "Что за песня зашифрована?\n🧪🎧👋🧪🎵🎵👋🧪👯👋🥳 ",
    options: null,
    correctAnswer: "Кислотный DJ",
  },
  {
    id: 12,
    text: "Назовите 2 группы? ",
    audioUrl:
      "/quize/assets/ROCK_PRIVET_-_ZHdu_CHuda_Cover_na_25_17_Nickelback_(SkySound.cc).mp3",
    options: null,
    correctAnswer: "25_17_Nickelback",
  },
  {
    id: 13,
    text: "Кто провозгласил «Смерть Бога» и проповедовал философию «сверхчеловека»?",
    options: null,
    correctAnswer: "Ницше",
  },
  {
    id: 14,
    text: '«Если твой друг сказал, что какой-то мем — это "кринж", но при этом отправил его в чат с подписью "база", что он на самом деле имел в виду?»',
    options: [
      "Мем одновременно ужасен и гениален",
      "Он сам запутался в своих чувствах",
      "Мем плохой, но жизненный",
      "Он троллит всех, включая себя",
    ],
    correctAnswer: "Он сам запутался в своих чувствах",
  },
  {
    id: 15,
    text: "Из какого фильма цитата «Какие люди и без охраны!»?",
    options: [
      "Любовь и голуби",
      "Москва слезам не верит",
      "Кавказская пленница",
      "Покровские ворота",
    ],
    correctAnswer: "Кавказская пленница",
  },
  {
    id: 16,
    text: "Вода может закипеть при температуре около 90 градусов.",
    options: ["Правда", "Неправда"],
    correctAnswer: "Правда",
  },
  {
    id: 17,
    text: "Спутником какой планеты Солнечной системы является Титан?",
    imageUrl: "/quize/assets/titan.png",
    options: ["Меркурий", "Юпитер", "Сатурн", "Марс"],
    correctAnswer: "Сатурн",
  },
  {
    id: 18,
    text: "Из какого фильма этот диалог",
    audioUrl: "/quize/assets/show.m4a",
    options: null,
    correctAnswer: "Кумкват",
  },
  {
    id: 184,
    text: "Как называлсь мой регйбиный клуб?",
    audioUrl: "/quize/assets/show.m4a",
    options: null,
    correctAnswer: "Доверие",
  },
  {
    id: 19,
    text: "Что на фото?",
    imageUrl: "/quize/assets/kum.png",
    options: ["Гренадилла", "Чинола", "Инжир", "Кумкват"],
    correctAnswer: "Кумкват",
  },
  {
    id: 20,
    text: "У близнецов отпечатки пальцев одинаковые.",
    imageUrl: "/quize/assets/twins.jpg",
    options: ["Правда", "Неправда"],
    correctAnswer: "Неправда",
  },
  {
    id: 21,
    text: "Чего боится наша Ирочка?",
    options: null,
    correctAnswer: "Высота",
  },
  {
    id: 22,
    text: "Мы гуляли там по облакам, \nПритворились лондонским дождём. \nМоросили вместе на асфальт, \nНо утром я узнаю, утром, ты узнаешь позже ,\nЭтих слов дороже ничего и нет. ",
    options: null,
    correctAnswer: "Земфира",
  },
  {
    id: 23,
    text: "Красный цвет раздражает быков.",
    options: ["Правда", "Неправда"],
    correctAnswer: "Неправда",
  },
  {
    id: 24,
    text: "Это что за покемон?",
    imageUrl: "/quize/assets/bulba.png",
    options: ["Бульбазавр", "Сквиртл", "Джигглипуф", "Слоупок"],
    correctAnswer: "Бульбазавр",
  },
  {
    id: 25,
    text: "Назовите актрису?",
    imageUrl: "/quize/assets/scarlett.png",
    options: null,
    correctAnswer: null,
  },
  {
    id: 26,
    text: "Что принадлежит тебе, но другие используют это чаще, чем ты?",
    options: null,
    correctAnswer: "Имя",
  },
  {
    id: 27,
    text: "В греческой мифологии он был богом сновидений, а в фильме пробуждал.",
    options: null,
    correctAnswer: "Морфей",
  },
  {
    id: 28,
    text: "Назовите номер этой модели телефона.",
    imageUrl: "/quize/assets/nokia.jpg",
    options: null,
    correctAnswer: "Nokia 3110",
  },
  {
    id: 29,
    text: "Что рекламируют с помощью этих дверей?",
    imageUrl: "/quize/assets/doors.png",
    options: null,
    correctAnswer: "Что-то для похудения",
  },
];
