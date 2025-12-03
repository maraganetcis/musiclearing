import { generateSetId, generateCardId } from '../utils/storage';

export const sampleSets = [
  {
    id: generateSetId(),
    title: "클래식 명곡 모음",
    description: "초보자를 위한 클래식 음악 학습 세트",
    createdAt: new Date().toISOString(),
    cards: [
      {
        id: generateCardId(),
        title: "월광 소나타",
        composer: "루트비히 판 베토벤",
        youtubeId: "dV5XcUxdM6E",
        hints: [
          "이 곡은 3악장으로 구성되어 있습니다",
          "작곡가는 독일인입니다",
          "피아노 소나타입니다"
        ],
        learned: false,
        correctCount: 0,
        wrongCount: 0
      },
      {
        id: generateCardId(),
        title: "교향곡 5번 운명",
        composer: "루트비히 판 베토벤",
        youtubeId: "6E0gK0xXhZ8",
        hints: [
          "첫 부분이 '따닥 따닥 따-닥'입니다",
          "운명이 문을 두드린다는 별명이 있습니다"
        ],
        learned: false,
        correctCount: 0,
        wrongCount: 0
      },
      {
        id: generateCardId(),
        title: "사계 중 봄",
        composer: "안토니오 비발디",
        youtubeId: "GRxofEmo3HA",
        hints: [
          "바이올린 협주곡입니다",
          "사계절을 주제로 한 곡입니다"
        ],
        learned: false,
        correctCount: 0,
        wrongCount: 0
      }
    ]
  },
  {
    id: generateSetId(),
    title: "K-POP 히트곡",
    description: "대한민국 인기 팝송 모음",
    createdAt: new Date().toISOString(),
    cards: [
      {
        id: generateCardId(),
        title: "Dynamite",
        composer: "방탄소년단",
        youtubeId: "gdZLi9oWNZg",
        hints: [
          "2020년에 발매된 곡입니다",
          "영어로 된 곡입니다"
        ],
        learned: false,
        correctCount: 0,
        wrongCount: 0
      }
    ]
  }
];
