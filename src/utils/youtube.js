// YouTube 유틸리티 함수

/**
 * YouTube URL 또는 ID가 유효한지 검증합니다.
 * @param {string} url - 검증할 YouTube URL 또는 동영상 ID
 * @returns {boolean} 유효성 여부
 */
export const validateYouTubeUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  // YouTube 동영상 ID 패턴 (11자리 영숫자 및 하이픈, 밑줄)
  const videoIdPattern = /^[a-zA-Z0-9_-]{11}$/;
  
  // 다양한 YouTube URL 패턴들
  const urlPatterns = [
    /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
    /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
    /^(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]+)/,
    /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/,
    /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/live\/([a-zA-Z0-9_-]+)/
  ];
  
  // 동영상 ID만 입력된 경우
  if (videoIdPattern.test(url.trim())) {
    return true;
  }
  
  // URL 패턴 검사
  for (const pattern of urlPatterns) {
    if (pattern.test(url.trim())) {
      return true;
    }
  }
  
  return false;
};

/**
 * YouTube 동영상 ID로 썸네일 URL을 생성합니다.
 * @param {string} videoId - YouTube 동영상 ID
 * @returns {string} 썸네일 URL
 */
export const getYouTubeThumbnail = (videoId) => {
  if (!videoId || typeof videoId !== 'string') {
    return 'https://via.placeholder.com/320x180?text=No+Thumbnail';
  }
  
  // 정리된 동영상 ID (URL에서 추출한 경우를 대비)
  const cleanId = videoId.trim();
  
  // 다양한 썸네일 품질 옵션
  // mqdefault: 320x180 중간 품질 (가장 일반적)
  // hqdefault: 480x360 고화질
  // sddefault: 640x480 표준화질
  // maxresdefault: 최대해상도 (가용시)
  
  return `https://img.youtube.com/vi/${cleanId}/mqdefault.jpg`;
};

/**
 * YouTube URL에서 동영상 ID를 추출합니다.
 * @param {string} url - YouTube URL
 * @returns {string} 동영상 ID (추출 실패시 빈 문자열)
 */
export const extractYouTubeId = (url) => {
  if (!url || typeof url !== 'string') return '';
  
  const trimmedUrl = url.trim();
  
  // 이미 동영상 ID인 경우 (11자리)
  const videoIdPattern = /^[a-zA-Z0-9_-]{11}$/;
  if (videoIdPattern.test(trimmedUrl)) {
    return trimmedUrl;
  }
  
  // 다양한 YouTube URL 패턴에서 ID 추출
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtube\.com\/live\/)([a-zA-Z0-9_-]+)/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]+)/,
    /youtu\.be\/([a-zA-Z0-9_-]+)/
  ];
  
  for (const pattern of patterns) {
    const match = trimmedUrl.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return ''; // 추출 실패
};
