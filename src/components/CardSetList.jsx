import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Edit, Trash2, Music, Clock, Award } from 'lucide-react';

const CardSetList = ({ cardSets, onDeleteSet }) => {
  const navigate = useNavigate();

  const handleDelete = (e, setId) => {
    e.stopPropagation();
    if (window.confirm('이 세트를 삭제하시겠습니까?')) {
      onDeleteSet(setId);
    }
  };

  const calculateProgress = (cards) => {
    const learnedCards = cards.filter(card => card.learned).length;
    return Math.round((learnedCards / cards.length) * 100);
  };

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '40px' 
      }}>
        <h1 style={{ fontSize: '32px', color: 'white', fontWeight: '700' }}>학습 세트 목록</h1>
        <Link to="/create" className="btn btn-primary">
          <Music size={20} /> 새 세트 만들기
        </Link>
      </div>

      {cardSets.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <Music size={64} style={{ marginBottom: '20px', opacity: '0.5' }} />
          <h3 style={{ marginBottom: '10px', color: '#333' }}>세트가 없습니다</h3>
          <p style={{ color: '#666', marginBottom: '30px' }}>새로운 음악 학습 세트를 만들어 보세요!</p>
          <Link to="/create" className="btn btn-primary">첫 세트 만들기</Link>
        </div>
      ) : (
        <div className="grid grid-cols-3">
          {cardSets.map(set => {
            const progress = calculateProgress(set.cards);
            
            return (
              <div key={set.id} className="card" style={{ cursor: 'pointer' }}>
                <div 
                  onClick={() => navigate(`/study/${set.id}`)}
                  style={{ marginBottom: '15px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#333' }}>{set.title}</h3>
                    <span style={{ 
                      background: progress === 100 ? '#28a745' : '#6c757d',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '14px'
                    }}>
                      {progress}%
                    </span>
                  </div>
                  
                  <p style={{ color: '#666', marginBottom: '15px', minHeight: '40px' }}>
                    {set.description || '설명이 없습니다'}
                  </p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Music size={16} style={{ color: '#667eea' }} />
                      <span style={{ fontSize: '14px', color: '#666' }}>
                        {set.cards.length}곡
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Award size={16} style={{ color: '#ffc107' }} />
                      <span style={{ fontSize: '14px', color: '#666' }}>
                        {set.cards.filter(c => c.correctCount > 0).length}곡 완료
                      </span>
                    </div>
                  </div>
                  
                  {/* 진행도 바 */}
                  <div style={{ 
                    height: '6px', 
                    background: '#e9ecef', 
                    borderRadius: '3px',
                    overflow: 'hidden',
                    marginBottom: '15px'
                  }}>
                    <div style={{ 
                      width: `${progress}%`, 
                      height: '100%', 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    }}></div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => navigate(`/study/${set.id}`)}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '10px' }}
                  >
                    <Play size={16} /> 학습하기
                  </button>
                  <button 
                    onClick={() => navigate(`/edit/${set.id}`)}
                    className="btn btn-secondary"
                    style={{ padding: '10px' }}
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={(e) => handleDelete(e, set.id)}
                    className="btn btn-danger"
                    style={{ padding: '10px' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CardSetList;
