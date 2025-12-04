import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Plus, Trash2, Music, Youtube, User, AlertCircle, Edit, X, Check } from 'lucide-react';
import { generateSetId, generateCardId, extractYouTubeId } from '../utils/storage';
import { validateYouTubeUrl, getYouTubeThumbnail } from '../utils/youtube';

const CardSetEditor = ({ onSave, cardSets }) => {
  const { setId } = useParams();
  const navigate = useNavigate();
  
  const [set, setSet] = useState({
    id: generateSetId(),
    title: '',
    description: '',
    cards: []
  });
  
  const [newCard, setNewCard] = useState({
    title: '',
    composer: '',
    youtubeUrl: '',
    hints: ['']
  });
  
  // 편집 중인 카드의 ID (null이면 수정 모드 아님)
  const [editingCardId, setEditingCardId] = useState(null);
  // 편집 중인 카드의 임시 데이터
  const [editingCardData, setEditingCardData] = useState({
    title: '',
    composer: '',
    youtubeUrl: '',
    hints: ['']
  });
  
  const [errors, setErrors] = useState({});

  // 편집 모드일 경우 기존 데이터 로드
  useEffect(() => {
    if (setId) {
      const existingSet = cardSets.find(s => s.id === setId);
      if (existingSet) {
        setSet(existingSet);
      } else {
        navigate('/create');
      }
    }
  }, [setId, cardSets, navigate]);

  const handleSetChange = (field, value) => {
    setSet(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNewCardChange = (field, value) => {
    setNewCard(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // 카드 수정 시작
  const handleEditCard = (card) => {
    setEditingCardId(card.id);
    setEditingCardData({
      title: card.title,
      composer: card.composer,
      youtubeUrl: card.youtubeId ? `https://youtu.be/${card.youtubeId}` : '',
      hints: card.hints && card.hints.length > 0 ? [...card.hints] : ['']
    });
  };

  // 카드 수정 중 입력값 변경
  const handleEditingCardChange = (field, value) => {
    setEditingCardData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 카드 수정 저장
  const handleSaveCardEdit = () => {
    if (!editingCardData.title.trim() || !editingCardData.composer.trim() || !editingCardData.youtubeUrl.trim()) {
      alert('곡명, 작곡가, YouTube URL을 모두 입력해주세요.');
      return;
    }

    if (!validateYouTubeUrl(editingCardData.youtubeUrl)) {
      alert('유효한 YouTube URL을 입력해주세요.');
      return;
    }

    const youtubeId = extractYouTubeId(editingCardData.youtubeUrl);
    const validHints = editingCardData.hints.filter(hint => hint.trim());
    
    const updatedCards = set.cards.map(card => {
      if (card.id === editingCardId) {
        return {
          ...card,
          title: editingCardData.title.trim(),
          composer: editingCardData.composer.trim(),
          youtubeId: youtubeId,
          hints: validHints.length > 0 ? validHints : ['힌트가 없습니다']
        };
      }
      return card;
    });

    setSet(prev => ({ ...prev, cards: updatedCards }));
    setEditingCardId(null);
    setEditingCardData({ title: '', composer: '', youtubeUrl: '', hints: [''] });
  };

  // 카드 수정 취소
  const handleCancelEdit = () => {
    setEditingCardId(null);
    setEditingCardData({ title: '', composer: '', youtubeUrl: '', hints: [''] });
  };

  const handleAddHint = () => {
    setNewCard(prev => ({
      ...prev,
      hints: [...prev.hints, '']
    }));
  };

  const handleEditHintChange = (index, value) => {
    const newHints = [...editingCardData.hints];
    newHints[index] = value;
    setEditingCardData(prev => ({
      ...prev,
      hints: newHints
    }));
  };

  const handleAddEditHint = () => {
    setEditingCardData(prev => ({
      ...prev,
      hints: [...prev.hints, '']
    }));
  };

  const handleRemoveEditHint = (index) => {
    if (editingCardData.hints.length > 1) {
      const newHints = editingCardData.hints.filter((_, i) => i !== index);
      setEditingCardData(prev => ({
        ...prev,
        hints: newHints
      }));
    }
  };

  const handleHintChange = (index, value) => {
    const newHints = [...newCard.hints];
    newHints[index] = value;
    setNewCard(prev => ({
      ...prev,
      hints: newHints
    }));
  };

  const handleRemoveHint = (index) => {
    if (newCard.hints.length > 1) {
      const newHints = newCard.hints.filter((_, i) => i !== index);
      setNewCard(prev => ({
        ...prev,
        hints: newHints
      }));
    }
  };

  const validateCard = () => {
    const newErrors = {};
    
    if (!newCard.title.trim()) {
      newErrors.title = '곡명을 입력해주세요';
    }
    if (!newCard.composer.trim()) {
      newErrors.composer = '작곡가를 입력해주세요';
    }
    if (!newCard.youtubeUrl.trim()) {
      newErrors.youtubeUrl = 'YouTube URL을 입력해주세요';
    } else if (!validateYouTubeUrl(newCard.youtubeUrl)) {
      newErrors.youtubeUrl = '유효한 YouTube URL이 아닙니다';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddCard = () => {
    if (!validateCard()) return;
    
    const youtubeId = extractYouTubeId(newCard.youtubeUrl);
    const validHints = newCard.hints.filter(hint => hint.trim());
    
    const card = {
      id: generateCardId(),
      title: newCard.title.trim(),
      composer: newCard.composer.trim(),
      youtubeId: youtubeId,
      hints: validHints.length > 0 ? validHints : ['힌트가 없습니다'],
      learned: false,
      correctCount: 0,
      wrongCount: 0
    };
    
    setSet(prev => ({
      ...prev,
      cards: [...prev.cards, card]
    }));
    
    setNewCard({
      title: '',
      composer: '',
      youtubeUrl: '',
      hints: ['']
    });
    
    setErrors({});
  };

  const handleRemoveCard = (cardId) => {
    if (editingCardId === cardId) {
      handleCancelEdit();
    }
    setSet(prev => ({
      ...prev,
      cards: prev.cards.filter(card => card.id !== cardId)
    }));
  };

  const handleSave = () => {
    if (!set.title.trim()) {
      alert('세트 제목을 입력해주세요');
      return;
    }
    
    if (set.cards.length === 0) {
      alert('최소 한 개의 카드를 추가해주세요');
      return;
    }
    
    const updatedSet = {
      ...set,
      updatedAt: new Date().toISOString()
    };
    
    onSave(updatedSet);
    navigate('/');
  };

  return (
    <div className="card">
      <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '30px', color: '#333' }}>
        {setId ? '세트 수정하기' : '새 학습 세트 만들기'}
      </h2>
      
      {/* 세트 정보 입력 */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#555' }}>
            세트 제목 *
          </label>
          <input
            type="text"
            value={set.title}
            onChange={(e) => handleSetChange('title', e.target.value)}
            className="input-field"
            placeholder="예: 클래식 명곡 모음"
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#555' }}>
            설명 (선택사항)
          </label>
          <textarea
            value={set.description}
            onChange={(e) => handleSetChange('description', e.target.value)}
            className="input-field"
            rows="3"
            placeholder="예: 초보자를 위한 클래식 음악 학습 세트"
          />
        </div>
      </div>
      
      {/* 새 카드 추가 폼 */}
      <div className="card" style={{ background: '#f8f9fa', marginBottom: '30px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#333' }}>
          <Plus size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          새 카드 추가
        </h3>
        
        <div className="grid grid-cols-2" style={{ gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#555' }}>
              <Music size={16} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
              곡명 *
            </label>
            <input
              type="text"
              value={newCard.title}
              onChange={(e) => handleNewCardChange('title', e.target.value)}
              className="input-field"
              placeholder="예: 월광 소나타"
              style={errors.title ? { borderColor: '#dc3545' } : {}}
            />
            {errors.title && (
              <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '5px', display: 'flex', alignItems: 'center' }}>
                <AlertCircle size={14} style={{ marginRight: '5px' }} /> {errors.title}
              </div>
            )}
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#555' }}>
              <User size={16} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
              작곡가/아티스트 *
            </label>
            <input
              type="text"
              value={newCard.composer}
              onChange={(e) => handleNewCardChange('composer', e.target.value)}
              className="input-field"
              placeholder="예: 루트비히 판 베토벤"
              style={errors.composer ? { borderColor: '#dc3545' } : {}}
            />
            {errors.composer && (
              <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '5px', display: 'flex', alignItems: 'center' }}>
                <AlertCircle size={14} style={{ marginRight: '5px' }} /> {errors.composer}
              </div>
            )}
          </div>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#555' }}>
            <Youtube size={16} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
            YouTube URL *
          </label>
          <input
            type="text"
            value={newCard.youtubeUrl}
            onChange={(e) => handleNewCardChange('youtubeUrl', e.target.value)}
            className="input-field"
            placeholder="예: https://youtu.be/dV5XcUxdM6E"
            style={errors.youtubeUrl ? { borderColor: '#dc3545' } : {}}
          />
          {errors.youtubeUrl && (
            <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '5px', display: 'flex', alignItems: 'center' }}>
              <AlertCircle size={14} style={{ marginRight: '5px' }} /> {errors.youtubeUrl}
            </div>
          )}
          <div style={{ fontSize: '14px', color: '#6c757d', marginTop: '5px' }}>
            YouTube 동영상 URL이나 동영상 ID를 입력하세요
          </div>
        </div>
        
        {/* 힌트 입력 */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#555' }}>
            힌트 (선택사항)
          </label>
          {newCard.hints.map((hint, index) => (
            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input
                type="text"
                value={hint}
                onChange={(e) => handleHintChange(index, e.target.value)}
                className="input-field"
                placeholder={`힌트 ${index + 1}`}
              />
              {newCard.hints.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveHint(index)}
                  className="btn btn-danger"
                  style={{ padding: '10px' }}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddHint}
            className="btn btn-secondary"
            style={{ padding: '8px 16px', fontSize: '14px' }}
          >
            <Plus size={14} /> 힌트 추가
          </button>
        </div>
        
        <button
          onClick={handleAddCard}
          className="btn btn-primary"
          style={{ width: '100%' }}
        >
          <Plus size={18} style={{ marginRight: '8px' }} />
          카드 추가하기
        </button>
      </div>
      
      {/* 추가된 카드 목록 */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#333' }}>
          추가된 카드 ({set.cards.length}개)
        </h3>
        
        {set.cards.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            background: '#f8f9fa', 
            borderRadius: '8px',
            color: '#6c757d'
          }}>
            <Music size={48} style={{ marginBottom: '16px', opacity: '0.3' }} />
            <p>아직 추가된 카드가 없습니다. 위 폼을 이용해 카드를 추가해주세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1">
            {set.cards.map((card, index) => (
              <div key={card.id} className="card" style={{ 
                marginBottom: '15px',
                background: editingCardId === card.id ? '#f0f7ff' : '#f8f9fa',
                border: editingCardId === card.id ? '1px solid #667eea' : '1px solid transparent'
              }}>
                {/* 수정 모드 */}
                {editingCardId === card.id ? (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                        <Edit size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                        카드 수정 중
                      </h4>
                      <span style={{ 
                        background: '#667eea', 
                        color: 'white', 
                        padding: '2px 8px', 
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        #{index + 1}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2" style={{ gap: '15px', marginBottom: '15px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#555' }}>
                          곡명 *
                        </label>
                        <input
                          type="text"
                          value={editingCardData.title}
                          onChange={(e) => handleEditingCardChange('title', e.target.value)}
                          className="input-field"
                          style={{ fontSize: '14px', padding: '8px 12px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#555' }}>
                          작곡가 *
                        </label>
                        <input
                          type="text"
                          value={editingCardData.composer}
                          onChange={(e) => handleEditingCardChange('composer', e.target.value)}
                          className="input-field"
                          style={{ fontSize: '14px', padding: '8px 12px' }}
                        />
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#555' }}>
                        YouTube URL *
                      </label>
                      <input
                        type="text"
                        value={editingCardData.youtubeUrl}
                        onChange={(e) => handleEditingCardChange('youtubeUrl', e.target.value)}
                        className="input-field"
                        style={{ fontSize: '14px', padding: '8px 12px' }}
                      />
                    </div>
                    
                    {/* 힌트 수정 */}
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#555' }}>
                        힌트 (선택사항)
                      </label>
                      {editingCardData.hints.map((hint, hintIndex) => (
                        <div key={hintIndex} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                          <input
                            type="text"
                            value={hint}
                            onChange={(e) => handleEditHintChange(hintIndex, e.target.value)}
                            className="input-field"
                            style={{ fontSize: '14px', padding: '8px 12px' }}
                            placeholder={`힌트 ${hintIndex + 1}`}
                          />
                          {editingCardData.hints.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveEditHint(hintIndex)}
                              className="btn btn-danger"
                              style={{ padding: '8px' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={handleAddEditHint}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        <Plus size={12} /> 힌트 추가
                      </button>
                    </div>
                    
                    {/* 수정 저장/취소 버튼 */}
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={handleCancelEdit}
                        className="btn btn-secondary"
                        style={{ padding: '8px 16px' }}
                      >
                        <X size={16} style={{ marginRight: '5px' }} /> 취소
                      </button>
                      <button
                        onClick={handleSaveCardEdit}
                        className="btn btn-primary"
                        style={{ padding: '8px 16px' }}
                      >
                        <Check size={16} style={{ marginRight: '5px' }} /> 저장
                      </button>
                    </div>
                  </div>
                ) : (
                  /* 읽기 모드 (기본 표시) */
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div>
                          <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '5px' }}>
                            {card.title}
                          </h4>
                          <p style={{ fontSize: '14px', color: '#666' }}>
                            {card.composer}
                          </p>
                        </div>
                        <span style={{ 
                          background: '#6c757d', 
                          color: 'white', 
                          padding: '2px 8px', 
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          #{index + 1}
                        </span>
                      </div>
                      
                      {card.youtubeId && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                          <img 
                            src={getYouTubeThumbnail(card.youtubeId)} 
                            alt="썸네일"
                            style={{ 
                              width: '80px', 
                              height: '45px', 
                              borderRadius: '4px',
                              objectFit: 'cover'
                            }}
                          />
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            YouTube ID: {card.youtubeId}
                          </div>
                        </div>
                      )}
                      
                      {card.hints && card.hints.length > 0 && card.hints[0] !== '힌트가 없습니다' && (
                        <div style={{ marginTop: '10px' }}>
                          <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '5px' }}>힌트:</div>
                          <ul style={{ paddingLeft: '20px', margin: 0 }}>
                            {card.hints.map((hint, i) => (
                              <li key={i} style={{ fontSize: '12px', color: '#666' }}>{hint}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    {/* 카드 작업 버튼들 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <button
                        onClick={() => handleEditCard(card)}
                        className="btn btn-secondary"
                        style={{ padding: '10px' }}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleRemoveCard(card.id)}
                        className="btn btn-danger"
                        style={{ padding: '10px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* 저장 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button
          onClick={() => navigate('/')}
          className="btn btn-secondary"
        >
          취소
        </button>
        <button
          onClick={handleSave}
          className="btn btn-primary"
          disabled={set.cards.length === 0}
        >
          <Save size={18} style={{ marginRight: '8px' }} />
          {setId ? '수정 완료' : '세트 저장하기'}
        </button>
      </div>
    </div>
  );
};

export default CardSetEditor;
