import { useEffect, useMemo, useState } from 'react';
import IncidentList from '../components/IncidentList.jsx';
import Layout from '../components/Layout.jsx';
import MapPlaceholder from '../components/MapPlaceholder.jsx';
import ResultCard from '../components/ResultCard.jsx';
import StatCard from '../components/StatCard.jsx';
import { getIncident, getIncidents } from '../services/api.js';

export default function ControlDashboard({ onBack }) {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getIncidents()
      .then((data) => {
        setIncidents(data.incidents);
        if (data.incidents.length > 0) {
          return getIncident(data.incidents[0].id);
        }
        return null;
      })
      .then((data) => {
        if (data) setSelectedIncident(data);
      })
      .catch(() => setError('신고 목록을 불러오지 못했습니다. 백엔드 서버 상태를 확인하세요.'));
  }, []);

  const stats = useMemo(() => {
    const highRisk = incidents.filter((incident) => incident.risk_level === '높음').length;
    const active = incidents.filter((incident) => incident.status !== '완료').length;
    return { total: incidents.length, highRisk, active };
  }, [incidents]);

  const selectIncident = async (id) => {
    setError('');
    try {
      setSelectedIncident(await getIncident(id));
    } catch (apiError) {
      setError('신고 상세 정보를 불러오지 못했습니다.');
    }
  };

  return (
    <Layout
      mode="CENTRAL CONTROL"
      title="Monitor the Grid."
      subtitle="신고를 위험도 기준으로 정렬하고 출동 상태와 상세 정보를 한 화면에서 확인합니다."
      onBack={onBack}
    >
      <section className="control-stats container">
        <StatCard value={stats.total} label="현재 접수 신고" />
        <StatCard value={stats.highRisk} label="높음 위험도" />
        <StatCard value={stats.active} label="진행 중 출동" />
      </section>

      <section className="control-grid container">
        <div className="panel">
          <div className="section-heading">
            <span className="eyebrow">INCIDENT QUEUE</span>
            <h2>접수된 신고</h2>
          </div>
          {error && <p className="error-text">{error}</p>}
          <IncidentList
            incidents={incidents}
            selectedId={selectedIncident?.id}
            onSelect={selectIncident}
          />
        </div>

        <div className="result-stack">
          <MapPlaceholder label="CONTROL MAP PLACEHOLDER" />
          {selectedIncident ? (
            <ResultCard title="신고 상세">
              <dl className="info-list">
                <div><dt>주소</dt><dd>{selectedIncident.address}</dd></div>
                <div><dt>발생 층</dt><dd>{selectedIncident.fire_floor}</dd></div>
                <div><dt>위험도</dt><dd>{selectedIncident.risk_level}</dd></div>
                <div><dt>상태</dt><dd>{selectedIncident.status}</dd></div>
                <div><dt>요약</dt><dd>{selectedIncident.summary}</dd></div>
              </dl>
            </ResultCard>
          ) : (
            <ResultCard title="신고 상세 대기">
              <p>신고 목록에서 항목을 선택하세요.</p>
            </ResultCard>
          )}
        </div>
      </section>
    </Layout>
  );
}
