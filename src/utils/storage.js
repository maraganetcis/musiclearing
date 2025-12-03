import { nanoid } from 'nanoid';

// 로컬 스토리지 키
const STORAGE_KEY = 'music-quiz-card-sets';
const USER_PROGRESS_KEY = 'music-quiz-user-progress';

// 카드 세트 저장/로드
export const saveCardSets = (sets) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
  } catch (error) {
    console.error('카드 세트 저장 중 오류:', error);
  }
};

export const loadCardSets = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('카드 세트 로드 중 오류:', error);
    return [];
  }
};

// 사용자 진행도 저장/로드
export const saveUserProgress = (progress) => {
  try {
    localStorage.setItem(USER_PROGRESS_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('진행도 저장 중 오류:', error);
  }
};

export const loadUserProgress = () => {
  try {
    const saved = localStorage.getItem(USER_PROGRESS_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.error('진행도 로드 중 오류:', error);
    return {};
  }
};

// 카드 세트 ID 생성
export const generateSetId = () => nanoid();

// 카드 ID 생성
export const generateCardId = () => nanoid();

// YouTube URL에서 ID 추출
export const extractYouTubeId = (url) => {
  if (!url) return '';
  
  // 다양한 YouTube URL 형식 처리
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]+)/,
    /youtu\.be\/([a-zA-Z0-9_-]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return url; // 이미 ID일 경우
};
