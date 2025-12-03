import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Home, Music, PlusCircle, BarChart, Settings } from 'lucide-react';
import CardSetList from './components/CardSetList';
import CardSetEditor from './components/CardSetEditor';
import StudyMode from './components/StudyMode';
import Statistics from './components/Statistics';
import { loadCardSets, saveCardSets } from './utils/storage';
import { sampleSets } from './data/sampleSets';

function App() {
  const [cardSets, setCardSets] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // 초기 데이터 로드
  useEffect(() => {
    const loadedSets = loadCardSets();
    if (loadedSets.length === 0) {
      // 샘플 데이터 로드
      saveCardSets(sampleSets);
      setCardSets(sampleSets);
    } else {
      setCardSets(loadedSets);
    }
    setIsInitialized(true);
  }, []);

  // 카드 세트 저장
  const handleSaveCardSet = (updatedSet) => {
    const updatedSets = cardSets.map(set => 
      set.id === updatedSet.id ? updatedSet : set
    );
    if (!cardSets.find(set => set.id === updatedSet.id)) {
      updatedSets.push(updatedSet);
    }
    setCardSets(updatedSets);
    saveCardSets(updatedSets);
  };

  const handleDeleteCardSet = (setId) => {
    const updatedSets = cardSets.filter(set => set.id !== setId);
    setCardSets(updatedSets);
    saveCardSets(updatedSets);
  };

  if (!isInitialized) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div className="loading"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-content">
            <Link to="/" className="nav-title">
              <Music size={28} style={{ marginRight: '10px' }} />
              Music Quiz Master
            </Link>
            <div style={{ display: 'flex', gap: '20px' }}>
              <Link to="/" style={{ textDecoration: 'none', color: '#333', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Home size={20} /> 홈
              </Link>
              <Link to="/create" style={{ textDecoration: 'none', color: '#333', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <PlusCircle size={20} /> 새 세트
              </Link>
              <Link to="/stats" style={{ textDecoration: 'none', color: '#333', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <BarChart size={20} /> 통계
              </Link>
            </div>
          </div>
        </nav>

        <div className="container">
          <Routes>
            <Route path="/" element={
              <CardSetList 
                cardSets={cardSets} 
                onDeleteSet={handleDeleteCardSet}
              />
            } />
            <Route path="/create" element={
              <CardSetEditor 
                onSave={handleSaveCardSet}
                cardSets={cardSets}
              />
            } />
            <Route path="/edit/:setId" element={
              <CardSetEditor 
                onSave={handleSaveCardSet}
                cardSets={cardSets}
              />
            } />
            <Route path="/study/:setId" element={
              <StudyMode cardSets={cardSets} />
            } />
            <Route path="/stats" element={
              <Statistics cardSets={cardSets} />
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
