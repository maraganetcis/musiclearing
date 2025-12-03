import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, TrendingUp, Target, Clock, Award, Music } from 'lucide-react';
import { loadUserProgress } from '../utils/storage';

const Statistics = ({ cardSets }) => {
  const [stats, setStats] = useState({
    totalSets: 0,
    totalCards: 0,
    learnedCards: 0,
    totalScore: 0,
    accuracy: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    calculateStatistics();
    loadRecentActivity();
  }, [cardSets]);

  const calculateStatistics = () => {
    let totalCards = 0;
    let learnedCards = 0;
    let totalScore = 0;
    let totalAttempts = 0;
    let correctAttempts = 0;

    cardSets.forEach(set => {
      totalCards += set.cards.length;
      set.cards.forEach(card => {
        if (card.learned) learnedCards++;
        totalScore += card.correctCount * 100;
        totalAttempts += card.correctCount + card.wrongCount;
        correctAttempts += card.correctCount;
      });
    });

    const accuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

    setStats({
      totalSets: cardSets.length,
      totalCards,
      learnedCards,
      totalScore,
      accuracy: Math.round(accuracy)
    });
  };

  const loadRecentActivity = () => {
    const progress = loadUserProgress();
    const activity = [];

    // 최근 학습한 세트 5개 찾기
    cardSets.forEach(set => {
      const cardsWithActivity = set.cards.filter(card => 
        card.correctCount > 0 || card.wrongCount > 0
      );
      
      if (cardsWithActivity.length > 0) {
        const lastActivity = new Date(set.updatedAt || set.createdAt).toLocaleDateString();
        const progress = Math.round((cardsWithActivity.filter(c => c.learned).length / set.cards.length) * 100);
        
        activity.push({
          id: set.id,
          title: set.title,
          progress,
          lastActivity,
          cardCount: cardsWithActivity.length
        });
      }
    });

    // 최근 활동순 정렬
    activity.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
    setRecentActivity(activity.slice(0, 5));
  };

  return (
    <div>
      <h1 style={{ fontSize: '32px', color: 'white', fontWeight: '700', marginBottom: '40px' }}>
        <BarChart3 size={32} style={{ marginRight: '15px', verticalAlign: 'middle' }} />
        학습 통계
      </h1>

      {/* 요약 통계 */}
      <div className="grid grid-cols-4" style={{ marginBottom: '40px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '10px' }}>총 세트</div>
          <div style={{ fontSize: '36px', fontWeight: '700', color: '#667eea' }}>{stats.totalSets}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>학습 세트</div>
        </div>
        
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '10px' }}>학습한 곡</div>
          <div style={{ fontSize: '36px', fontWeight: '700', color: '#28a745' }}>
            {stats.learnedCards}/{stats.totalCards}
          </div>
          <div style={{ fontSize: '12px', color: '#999' }}>완료율 {Math.round((stats.learnedCards/stats.totalCards)*100)}%</div>
        </div>
        
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '10px' }}>총 점수</div>
          <div style={{ fontSize: '36px', fontWeight: '700', color: '#ffc107' }}>{stats.totalScore}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>누적 점수</div>
        </div>
        
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '10px' }}>정확도</div>
          <div style={{ fontSize: '36px', fontWeight: '700', color: stats.accuracy >= 70 ? '#28a745' : '#dc3545' }}>
            {stats.accuracy}%
          </div>
          <div style={{ fontSize: '12px', color: '#999' }}>평균 정답률</div>
        </div>
      </div>

      {/* 최근 활동 */}
      <div className="card" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#333', display: 'flex', alignItems: 'center' }}>
          <Clock size={20} style={{ marginRight: '10px' }} />
          최근 학습 활동
        </h2>
        
        {recentActivity.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
            <Music size={48} style={{ marginBottom: '16px', opacity: '0.3' }} />
            <p>아직 학습 활동이 없습니다. 세트를 시작해 보세요!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1">
            {recentActivity.map(activity => (
              <div key={activity.id} style={{ 
                padding: '15px', 
                borderBottom: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#333', marginBottom: '5px' }}>
                    <Link to={`/study/${activity.id}`} style={{ textDecoration: 'none', color: '#667eea' }}>
                      {activity.title}
                    </Link>
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    {activity.cardCount}곡 학습함 • 마지막 활동: {activity.lastActivity}
                  </div>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    fontSize: '20px', 
                    fontWeight: '700', 
                    color: activity.progress === 100 ? '#28a745' : '#667eea'
                  }}>
                    {activity.progress}%
                  </div>
                  <div style={{ fontSize: '12px', color: '#999' }}>완료율</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 학습 추천 */}
      <div className="card">
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#333', display: 'flex', alignItems: 'center' }}>
          <Target size={20} style={{ marginRight: '10px' }} />
          학습 추천
        </h2>
        
        <div className="grid grid-cols-2">
          {cardSets.map(set => {
            const learnedCards = set.cards.filter(card => card.learned).length;
            const progress = Math.round((learnedCards / set.cards.length) * 100);
            
            return (
              <Link 
                key={set.id} 
                to={`/study/${set.id}`}
                style={{ textDecoration: 'none' }}
              >
                <div className="card" style={{ 
                  background: progress === 100 ? '#f8f9fa' : '#fff',
                  opacity: progress === 100 ? 0.7 : 1,
                  cursor: 'pointer'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ fontWeight: '600', color: '#333' }}>{set.title}</div>
                    {progress === 100 && (
                      <Award size={16} style={{ color: '#ffc107' }} />
                    )}
                  </div>
                  
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                    {set.description || '설명이 없습니다'}
                  </div>
                  
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                      <span>진행도</span>
                      <span>{progress}%</span>
                    </div>
                    <div style={{ 
                      height: '6px', 
                      background: '#e9ecef', 
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        width: `${progress}%`, 
                        height: '100%', 
                        background: progress === 100 ? '#28a745' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      }}></div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          }).slice(0, 4)}
        </div>
      </div>
    </div>
  );
};

export default Statistics;
