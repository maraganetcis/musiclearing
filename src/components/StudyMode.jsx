import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, SkipForward, Check, X, Volume2, RotateCcw } from 'lucide-react';
import YouTubePlayer from './YouTubePlayer';

const StudyMode = ({ cardSets }) => {
  const { setId } = useParams();
  const navigate = useNavigate();
  
  const [currentSet, setCurrentSet] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  
  const playerRef = useRef(null);

  useEffect(() => {
    const set = cardSets.find(s => s.id === setId);
    if (set) {
      setCurrentSet(set);
      // 학습하지 않은 카드만 필터링
      const unlearnedCards = set.cards.filter(card => !card.learned);
      if (unlearnedCards.length > 0) {
        setCurrentSet(prev => ({ ...prev, cards: unlearnedCards }));
      }
    } else {
      navigate('/');
    }
  }, [setId, cardSets, navigate]);

  const currentCard = currentSet?.cards[currentCardIndex];

  const checkAnswer = () => {
    if (!userAnswer.trim() || !currentCard) return;
    
    const correctTitle = currentCard.title.toLowerCase().replace(/\s+/g, '');
    const correctComposer = currentCard.composer.toLowerCase().replace(/\s+/g, '');
    const userAnswerNormalized = userAnswer.toLowerCase().replace(/\s+/g, '');
    
    const isTitleCorrect = userAnswerNormalized.includes(correctTitle) || 
                          correctTitle.includes(userAnswerNormalized);
    const isComposerCorrect = userAnswerNormalized.includes(correctComposer) || 
                             correctComposer.includes(userAnswerNormalized);
    
    const correct = isTitleCorrect || isComposerCorrect;
    
    setIsCorrect(correct);
    setShowAnswer(true);
    setAttempts(prev => prev + 1);
    
    if (correct) {
      setScore(prev => prev + 100);
      // 카드 학습 상태 업데이트
      updateCardProgress(true);
    } else {
      updateCardProgress(false);
    }
  };

  const updateCardProgress = (correct) => {
    const updatedCards = [...currentSet.cards];
    const card = updatedCards[currentCardIndex];
    
    if (correct) {
      card.correctCount = (card.correctCount || 0) + 1;
      card.learned = card.correctCount >= 3; // 3번 맞추면 학습 완료
    } else {
      card.wrongCount = (card.wrongCount || 0) + 1;
    }
    
    setCurrentSet(prev => ({ ...prev, cards: updatedCards }));
    saveProgress(updatedCards);
  };

  const saveProgress = (cards) => {
    const allSets = [...cardSets];
    const setIndex = allSets.findIndex(s => s.id === setId);
    if (setIndex !== -1) {
      // 원래 세트의 모든 카드 업데이트
      const originalCards = allSets[setIndex].cards;
      cards.forEach(updatedCard => {
        const originalIndex = originalCards.findIndex(c => c.id === updatedCard.id);
        if (originalIndex !== -1) {
          originalCards[originalIndex] = updatedCard;
        }
      });
      
      // 로컬 스토리지에 저장 (실제 구현에서는 storage.js 사용)
      localStorage.setItem('music-quiz-card-sets', JSON.stringify(allSets));
    }
  };

  const nextCard = () => {
    setUserAnswer('');
    setShowAnswer(false);
    setIsCorrect(null);
    setIsPlaying(false);
    
    if (playerRef.current) {
      playerRef.current.pauseVideo();
    }
    
    if (currentCardIndex < currentSet.cards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      finishStudy();
    }
  };

  const finishStudy = () => {
    setIsFinished(true);
    if (playerRef.current) {
      playerRef.current.pauseVideo();
    }
  };

  const restartStudy = () => {
    setCurrentCardIndex(0);
    setUserAnswer('');
    setShowAnswer(false);
    setIsCorrect(null);
    setIsPlaying(false);
    setScore(0);
    setAttempts(0);
    setIsFinished(false);
    
    if (playerRef.current) {
      playerRef.current.pauseVideo();
    }
  };

  const handlePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (!currentSet || !currentCard) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div className="loading"></div>
      </div>
    );
  }

  if (isFinished) {
    const totalCards = currentSet.cards.length;
    const correctCards = currentSet.cards.filter(c => c.correctCount > 0).length;
    const accuracy = attempts > 0 ? Math.round((score / (attempts * 100)) * 100) : 0;
    
    return (
      <div className="study-container">
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <Check size={64} style={{ color: '#28a745', marginBottom: '20px' }} />
          <h2 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '10px', color: '#333' }}>
            학습 완료!
          </h2>
          <p style={{ color: '#666', marginBottom: '30px' }}>
            {currentSet.title} 세트의 학습을 마쳤습니다
          </p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '20px', 
            marginBottom: '40px' 
          }}>
            <div className="card" style={{ background: '#f8f9fa' }}>
              <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '5px' }}>최종 점수</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#667eea' }}>{score}</div>
            </div>
            <div className="card" style={{ background: '#f8f9fa' }}>
              <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '5px' }}>정답률</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: accuracy >= 70 ? '#28a745' : '#dc3545' }}>
                {accuracy}%
              </div>
            </div>
            <div className="card" style={{ background: '#f8f9fa' }}>
              <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '5px' }}>학습한 곡</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#333' }}>
                {correctCards}/{totalCards}
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
            <button onClick={restartStudy} className="btn btn-primary">
              <RotateCcw size={18} style={{ marginRight: '8px' }} />
              다시 학습하기
            </button>
            <button onClick={() => navigate('/')} className="btn btn-secondary">
              다른 세트 학습하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progress = ((currentCardIndex + 1) / currentSet.cards.length) * 100;

  return (
    <div className="study-container">
      {/* 진행도 표시 */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '14px', color: 'white' }}>
            {currentSet.title}
          </span>
          <span style={{ fontSize: '14px', color: 'white' }}>
            {currentCardIndex + 1} / {currentSet.cards.length}
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* 점수 표시 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '30px',
        color: 'white'
      }}>
        <div>
          <div style={{ fontSize: '12px', opacity: '0.8' }}>현재 점수</div>
          <div style={{ fontSize: '24px', fontWeight: '600' }}>{score}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', opacity: '0.8' }}>남은 곡</div>
          <div style={{ fontSize: '24px', fontWeight: '600' }}>
            {currentSet.cards.length - currentCardIndex - 1}
          </div>
        </div>
      </div>

      {/* 음악 플레이어 */}
      <div className="card" style={{ marginBottom: '30px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '5px' }}>
            <Volume2 size={14} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
            지금 재생 중
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#333' }}>
            이 음악은 무엇일까요?
          </h3>
        </div>
        
        {currentCard.youtubeId && (
          <div style={{ marginBottom: '20px' }}>
            <YouTubePlayer
              ref={playerRef}
              videoId={currentCard.youtubeId}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnd={() => setIsPlaying(false)}
            />
          </div>
        )}
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <button
            onClick={handlePlayPause}
            className="btn btn-primary"
            style={{ padding: '12px 24px' }}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            {isPlaying ? '일시정지' : '재생하기'}
          </button>
          <button
            onClick={() => playerRef.current?.seekTo(0)}
            className="btn btn-secondary"
            style={{ padding: '12px 24px' }}
          >
            <RotateCcw size={20} />
            다시 듣기
          </button>
        </div>
      </div>

      {/* 답변 입력 */}
      <div className="card" style={{ marginBottom: '30px' }}>
        <label style={{ display: 'block', marginBottom: '15px', fontWeight: '500', color: '#333' }}>
          곡명이나 작곡가를 입력하세요
        </label>
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !showAnswer && checkAnswer()}
          className="input-field"
          placeholder="예: 베토벤 또는 월광 소나타"
          disabled={showAnswer}
          style={{ marginBottom: '20px' }}
        />
        
        {!showAnswer ? (
          <button
            onClick={checkAnswer}
            disabled={!userAnswer.trim()}
            className="btn btn-primary"
            style={{ width: '100%', padding: '15px' }}
          >
            <Check size={20} style={{ marginRight: '8px' }} />
            정답 확인하기
          </button>
        ) : (
          <div>
            <div style={{
              padding: '20px',
              background: isCorrect ? '#d4edda' : '#f8d7da',
              border: `1px solid ${isCorrect ? '#c3e6cb' : '#f5c6cb'}`,
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '10px',
                color: isCorrect ? '#155724' : '#721c24'
              }}>
                {isCorrect ? (
                  <Check size={20} style={{ marginRight: '10px' }} />
                ) : (
                  <X size={20} style={{ marginRight: '10px' }} />
                )}
                <span style={{ fontWeight: '600' }}>
                  {isCorrect ? '정답입니다! 🎉' : '아쉽네요! 다음에는 맞출 수 있어요!'}
                </span>
              </div>
              
              <div style={{ color: isCorrect ? '#155724' : '#721c24' }}>
                <div style={{ marginBottom: '5px' }}>
                  <strong>곡명:</strong> {currentCard.title}
                </div>
                <div>
                  <strong>작곡가:</strong> {currentCard.composer}
                </div>
              </div>
              
              {currentCard.hints && currentCard.hints[0] !== '힌트가 없습니다' && (
                <div style={{ marginTop: '15px', fontSize: '14px' }}>
                  <div style={{ fontWeight: '500', marginBottom: '5px' }}>힌트:</div>
                  <ul style={{ paddingLeft: '20px', margin: 0 }}>
                    {currentCard.hints.map((hint, index) => (
                      <li key={index}>{hint}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <button
              onClick={nextCard}
              className="btn btn-primary"
              style={{ width: '100%', padding: '15px' }}
            >
              <SkipForward size={20} style={{ marginRight: '8px' }} />
              {currentCardIndex < currentSet.cards.length - 1 ? '다음 곡으로' : '학습 완료'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyMode;
