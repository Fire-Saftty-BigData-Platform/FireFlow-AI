import { useState } from 'react';
import Layout from '../components/Layout.jsx';
import ResultCard from '../components/ResultCard.jsx';
import { createEvacuationGuide } from '../services/api.js';

const initialForm = {
  location: '부산광역시 해운대구 A빌딩',
  current_floor: '5층',
  has_smoke: true,
  has_flame: false,
  stairs_available: true,
  is_trapped: false,
  has_vulnerable_people: false,
};

export default function CitizenDashboard({ onBack }) {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      setResult(await createEvacuationGuide(form));
    } catch (apiError) {
      setError('대피 안내를 생성하지 못했습니다. 백엔드 서버 상태를 확인하세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout
      mode="CITIZEN EVACUATION"
      title="Survive the Immediate."
      subtitle="복잡한 기능 없이 현재 상태만 입력하고 바로 행동 지침을 확인합니다."
      onBack={onBack}
    >
      <section className="dashboard-grid container">
        <form className="panel form-panel" onSubmit={submit}>
          <label>
            현재 위치 또는 주소
            <input value={form.location} onChange={(event) => updateField('location', event.target.value)} />
          </label>
          <label>
            현재 층
            <input value={form.current_floor} onChange={(event) => updateField('current_floor', event.target.value)} />
          </label>

          <div className="toggle-grid">
            <label><input type="checkbox" checked={form.has_smoke} onChange={(event) => updateField('has_smoke', event.target.checked)} /> 연기가 많음</label>
            <label><input type="checkbox" checked={form.has_flame} onChange={(event) => updateField('has_flame', event.target.checked)} /> 불꽃이 보임</label>
            <label><input type="checkbox" checked={form.stairs_available} onChange={(event) => updateField('stairs_available', event.target.checked)} /> 계단 이용 가능</label>
            <label><input type="checkbox" checked={form.is_trapped} onChange={(event) => updateField('is_trapped', event.target.checked)} /> 갇혀 있음</label>
            <label><input type="checkbox" checked={form.has_vulnerable_people} onChange={(event) => updateField('has_vulnerable_people', event.target.checked)} /> 노약자/아이/장애인 동행</label>
          </div>

          <button className="primary-button large-button" type="submit" disabled={loading}>
            {loading ? '생성 중' : '대피 안내 생성'}
          </button>
          {error && <p className="error-text">{error}</p>}
        </form>

        <div className="result-stack">
          {result ? (
            <>
              <ResultCard title="AI 대피 안내" tone="alert">
                <p className="guide-text">{result.guide}</p>
              </ResultCard>
              <ResultCard title="우선 행동 목록">
                <ol className="action-list">
                  {result.priority_actions.map((action) => <li key={action}>{action}</li>)}
                </ol>
              </ResultCard>
              <ResultCard title="경고">
                <p>{result.warning}</p>
              </ResultCard>
            </>
          ) : (
            <ResultCard title="대피 안내 대기">
              <p>왼쪽 정보를 입력하고 버튼을 누르면 더미 AI 안내가 표시됩니다.</p>
            </ResultCard>
          )}
        </div>
      </section>
    </Layout>
  );
}
