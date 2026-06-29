import { useState } from 'react';
import Layout from '../components/Layout.jsx';
import MapPlaceholder from '../components/MapPlaceholder.jsx';
import ResultCard from '../components/ResultCard.jsx';
import { createFirefighterSummary } from '../services/api.js';

const initialForm = {
  address: '부산광역시 해운대구 A빌딩',
  report_text: '5층 사무실 구역에서 연기가 복도까지 확산되고 있습니다.',
  fire_floor: '5층',
  smoke_spread: true,
  people_trapped: true,
};

export default function FirefighterDashboard({ onBack }) {
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
      setResult(await createFirefighterSummary(form));
    } catch (apiError) {
      setError('상황 요약을 생성하지 못했습니다. 백엔드 서버 상태를 확인하세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout
      mode="COMMAND RESPONSE"
      title="Command the Incident."
      subtitle="신고 내용과 건물 정보를 결합해 현장 대응에 필요한 정보를 빠르게 요약합니다."
      onBack={onBack}
    >
      <section className="dashboard-grid container">
        <form className="panel form-panel" onSubmit={submit}>
          <label>
            건물 주소
            <input value={form.address} onChange={(event) => updateField('address', event.target.value)} />
          </label>
          <label>
            신고 내용
            <textarea rows="5" value={form.report_text} onChange={(event) => updateField('report_text', event.target.value)} />
          </label>
          <label>
            화재 발생 층
            <input value={form.fire_floor} onChange={(event) => updateField('fire_floor', event.target.value)} />
          </label>
          <div className="toggle-grid">
            <label><input type="checkbox" checked={form.smoke_spread} onChange={(event) => updateField('smoke_spread', event.target.checked)} /> 연기 확산</label>
            <label><input type="checkbox" checked={form.people_trapped} onChange={(event) => updateField('people_trapped', event.target.checked)} /> 인명 고립</label>
          </div>
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? '생성 중' : '상황 요약 생성'}
          </button>
          <button className="secondary-button" type="button" disabled>
            음성 신고 입력 기능 준비 중
          </button>
          {error && <p className="error-text">{error}</p>}
        </form>

        <div className="result-stack">
          <MapPlaceholder label="FIREFIGHTER MAP PLACEHOLDER" />
          {result ? (
            <>
              <ResultCard title="건물 정보">
                <dl className="info-list">
                  <div><dt>건물명</dt><dd>{result.building_info.name}</dd></div>
                  <div><dt>규모</dt><dd>{result.building_info.floors}</dd></div>
                  <div><dt>용도</dt><dd>{result.building_info.usage}</dd></div>
                  <div><dt>구조</dt><dd>{result.building_info.structure}</dd></div>
                  <div><dt>위험 메모</dt><dd>{result.building_info.risk_note}</dd></div>
                </dl>
              </ResultCard>
              <ResultCard title={`AI 현장 상황 요약 / 위험도 ${result.risk_level}`} tone="alert">
                <p>{result.summary}</p>
              </ResultCard>
              <ResultCard title="대응 우선순위">
                <ol className="action-list">{result.priorities.map((item) => <li key={item}>{item}</li>)}</ol>
              </ResultCard>
              <ResultCard title="현장 대응 체크리스트">
                <ul className="check-list">{result.checklist.map((item) => <li key={item}>{item}</li>)}</ul>
              </ResultCard>
            </>
          ) : (
            <ResultCard title="상황 요약 대기">
              <p>신고 정보를 입력하면 더미 현장 요약과 건물 정보가 표시됩니다.</p>
            </ResultCard>
          )}
        </div>
      </section>
    </Layout>
  );
}
