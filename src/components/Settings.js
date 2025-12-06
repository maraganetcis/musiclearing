import React, { useState } from 'react';
import { Download, Upload, Database, AlertCircle, Check } from 'lucide-react';
import { loadCardSets, saveCardSets } from '../utils/storage';

const Settings = ({ cardSets, onDataImported }) => {
  const [importStatus, setImportStatus] = useState({ type: '', message: '' });

  // 1. 데이터를 JSON 파일로 내보내기 (다운로드)
  const handleExportData = () => {
    try {
      const dataStr = JSON.stringify(cardSets, null, 2); // 들여쓰기로 가독성 좋게
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      // 다운로드 링크 생성
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `music-quiz-sets-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setImportStatus({ 
        type: 'success', 
        message: '세트 데이터가 성공적으로 내보내졌습니다!' 
      });
    } catch (error) {
      setImportStatus({ 
        type: 'error', 
        message: `내보내기 실패: ${error.message}` 
      });
    }
  };

  // 2. JSON 파일에서 데이터 가져오기 (업로드)
  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const fileContent = e.target.result;
        const importedSets = JSON.parse(fileContent);
        
        // 기본적인 데이터 형식 검증
        if (!Array.isArray(importedSets)) {
          throw new Error('잘못된 데이터 형식입니다.');
        }
        
        // 기존 데이터에 새 데이터 병합 (중복 ID 제외)
        const existingSets = loadCardSets();
        const existingIds = new Set(existingSets.map(set => set.id));
        
        const newSets = importedSets.filter(set => !existingIds.has(set.id));
        const mergedSets = [...existingSets, ...newSets];
        
        // 저장
        saveCardSets(mergedSets);
        
        // 부모 컴포넌트에 데이터 새로고침 요청
        onDataImported();
        
        setImportStatus({ 
          type: 'success', 
          message: `성공! ${newSets.length}개의 새 세트가 추가되었습니다.` 
        });
        
        // 파일 입력 초기화
        event.target.value = '';
      } catch (error) {
        setImportStatus({ 
          type: 'error', 
          message: `파일 읽기 실패: ${error.message}` 
        });
        event.target.value = '';
      }
    };
    
    reader.readAsText(file);
  };

  // 3. 현재 데이터 통계 계산
  const totalSets = cardSets.length;
  const totalCards = cardSets.reduce((sum, set) => sum + set.cards.length, 0);
  const learnedCards = cardSets.reduce((sum, set) => 
    sum + set.cards.filter(card => card.learned).length, 0
  );

  return (
    <div className="card">
      <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '30px', color: '#333', display: 'flex', alignItems: 'center' }}>
        <Database size={28} style={{ marginRight: '12px' }} />
        데이터 관리
      </h2>

      {/* 현재 데이터 통계 */}
      <div className="card" style={{ background: '#f8f9fa', marginBottom: '30px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#333' }}>
          현재 데이터 현황
        </h3>
        <div className="grid grid-cols-3" style={{ gap: '15px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#667eea' }}>{totalSets}</div>
            <div style={{ fontSize: '14px', color: '#666' }}>세트 수</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#28a745' }}>{totalCards}</div>
            <div style={{ fontSize: '14px', color: '#666' }}>총 카드</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#ffc107' }}>{learnedCards}</div>
            <div style={{ fontSize: '14px', color: '#666' }}>학습한 카드</div>
          </div>
        </div>
      </div>

      {/* 내보내기 섹션 */}
      <div className="card" style={{ background: '#e8f5e9', marginBottom: '30px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '15px', color: '#2e7d32', display: 'flex', alignItems: 'center' }}>
          <Download size={20} style={{ marginRight: '10px' }} />
          데이터 내보내기
        </h3>
        <p style={{ color: '#555', marginBottom: '20px' }}>
          현재 모든 학습 세트를 JSON 파일로 내보냅니다. 이 파일을 다른 기기에서 가져오거나 백업으로 보관할 수 있습니다.
        </p>
        <button
          onClick={handleExportData}
          className="btn btn-success"
          style={{ width: '100%' }}
        >
          <Download size={18} style={{ marginRight: '8px' }} />
          JSON 파일로 내보내기
        </button>
      </div>

      {/* 가져오기 섹션 */}
      <div className="card" style={{ background: '#e3f2fd', marginBottom: '30px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '15px', color: '#1565c0', display: 'flex', alignItems: 'center' }}>
          <Upload size={20} style={{ marginRight: '10px' }} />
          데이터 가져오기
        </h3>
        <p style={{ color: '#555', marginBottom: '20px' }}>
          다른 기기에서 내보낸 JSON 파일을 업로드하여 세트 데이터를 추가합니다. 기존 데이터는 유지됩니다.
        </p>
        
        <div style={{ marginBottom: '20px' }}>
          <input
            type="file"
            id="import-file"
            accept=".json"
            onChange={handleImportData}
            style={{ display: 'none' }}
          />
          <label htmlFor="import-file">
            <div className="btn btn-primary" style={{ width: '100%', cursor: 'pointer' }}>
              <Upload size={18} style={{ marginRight: '8px' }} />
              JSON 파일 선택 및 가져오기
            </div>
          </label>
        </div>
        
        <div style={{ fontSize: '14px', color: '#666' }}>
          <strong>참고:</strong> 
          <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
            <li>중복된 세트(ID 기준)는 자동으로 제외됩니다</li>
            <li>파일은 반드시 이 사이트에서 내보낸 JSON 형식이어야 합니다</li>
            <li>가져오기 후 페이지를 새로고침해야 할 수 있습니다</li>
          </ul>
        </div>
      </div>

      {/* 상태 메시지 표시 */}
      {importStatus.message && (
        <div className="card" style={{ 
          background: importStatus.type === 'success' ? '#d4edda' : '#f8d7da',
          border: `1px solid ${importStatus.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
          color: importStatus.type === 'success' ? '#155724' : '#721c24'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {importStatus.type === 'success' ? (
              <Check size={20} style={{ marginRight: '10px' }} />
            ) : (
              <AlertCircle size={20} style={{ marginRight: '10px' }} />
            )}
            <span>{importStatus.message}</span>
          </div>
        </div>
      )}

      {/* 데이터 관리 팁 */}
      <div className="card" style={{ background: '#fff3cd', marginTop: '30px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px', color: '#856404', display: 'flex', alignItems: 'center' }}>
          <AlertCircle size={18} style={{ marginRight: '8px' }} />
          데이터 관리 팁
        </h3>
        <ul style={{ paddingLeft: '20px', color: '#856404', fontSize: '14px', margin: 0 }}>
          <li>정기적으로 데이터를 백업하세요</li>
          <li>다른 기기에서 작업 시, 최신 데이터 파일을 사용하세요</li>
          <li>브라우저 데이터를 삭제하면 모든 로컬 저장 데이터가 사라집니다</li>
        </ul>
      </div>
    </div>
  );
};

export default Settings;
