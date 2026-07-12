import { useEffect, useState } from 'react';
import IncidentList from '../components/IncidentList.jsx';
import Layout from '../components/Layout.jsx';
import MapPlaceholder from '../components/MapPlaceholder.jsx';
import ResultCard from '../components/ResultCard.jsx';
import { createFirefighterSummary, getFirefighterBriefingForIncident, getIncidents } from '../services/api.js';

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
  const [incidents, setIncidents] = useState([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getIncidents()
      .then((data) => {
        setIncidents(data.incidents);
        if (data.incidents.length > 0) {
          setSelectedIncidentId(data.incidents[0].id);
        }
      })
      .catch(() => setError('신고 목록을 불러오지 못했습니다. 백엔드 서버 상태를 확인하세요.'));
  }, []);

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

  const loadDemoIncident = async () => {
    await loadIncidentBriefing(1, '대표 신고 현장 브리핑을 불러오지 못했습니다.');
  };

  const loadIncidentBriefing = async (id, message = '선택 신고 현장 브리핑을 불러오지 못했습니다.') => {
    setLoading(true);
    setError('');
    try {
      setSelectedIncidentId(id);
      setResult(await getFirefighterBriefingForIncident(id));
    } catch (apiError) {
      setError(message);
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
        <div className="panel form-panel">
          <div className="section-heading">
            <span className="eyebrow">INCIDENT QUEUE</span>
            <h2>신고 기반 브리핑</h2>
          </div>
          <IncidentList
            incidents={incidents}
            selectedId={selectedIncidentId}
            onSelect={(id) => loadIncidentBriefing(id)}
          />
          <button className="secondary-button" type="button" onClick={loadDemoIncident} disabled={loading}>
            대표 신고 브리핑
          </button>
          <details>
            <summary>수동 브리핑 입력</summary>
            <form className="manual-briefing-form" onSubmit={submit}>
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
            </form>
          </details>
          <button className="secondary-button" type="button" disabled>
            음성 신고 입력 기능 준비 중
          </button>
          {error && <p className="error-text">{error}</p>}
        </div>

        <div className="result-stack">
          <MapPlaceholder
            label="FIREFIGHTER MAP PLACEHOLDER"
            incidents={incidents}
            selectedIncident={incidents.find((incident) => incident.id === selectedIncidentId)}
          />
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
              {result.disclaimer && (
                <ResultCard title="브리핑 범위">
                  <p>{result.disclaimer}</p>
                </ResultCard>
              )}
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
