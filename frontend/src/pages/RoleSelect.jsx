import RoleCard from '../components/RoleCard.jsx';
import StatCard from '../components/StatCard.jsx';

export default function RoleSelect({ onSelectRole }) {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="logo-text">FIREFLOW.AI <span>MVP</span></div>
        <nav className="top-nav" aria-label="System status">
          <span>CITIZEN</span>
          <span>FIRE RESPONSE</span>
          <span>CONTROL</span>
        </nav>
      </header>

      <main>
        <section className="hero container">
          <span className="eyebrow">GENERAL / INTELLIGENCE</span>
          <h1>FireFlow<br />AI</h1>
          <div className="hero-copy">
            <p>
              화재 상황에서 시민 대피, 소방 현장 요약, 중앙 통제를 역할별로 분리해 지원하는
              AI 기반 소방안전 웹서비스입니다.
            </p>
          </div>
        </section>

        <section className="role-section container" aria-label="역할 선택">
          <RoleCard
            mode="MODE 01"
            label="일반 사용자"
            description="현재 위치와 위험 상황을 입력하고 즉시 대피 행동 지침을 확인합니다."
            onClick={() => onSelectRole('citizen')}
          />
          <RoleCard
            mode="MODE 02"
            label="소방관"
            description="신고 내용과 건물 정보를 바탕으로 현장 위험도와 대응 우선순위를 확인합니다."
            onClick={() => onSelectRole('firefighter')}
          />
          <RoleCard
            mode="MODE 03"
            label="중앙 통제"
            description="여러 신고와 출동 상태를 한 화면에서 정렬하고 모니터링합니다."
            onClick={() => onSelectRole('control')}
          />
        </section>

        <section className="stats-band container">
          <div>
            <span className="eyebrow">MVP / DUMMY INTELLIGENCE</span>
            <p>실제 API 키 없이 더미 데이터만으로 역할별 핵심 흐름을 시연합니다.</p>
          </div>
          <div className="stat-grid">
            <StatCard value="3" label="Role dashboards" />
            <StatCard value="0" label="External API keys" />
            <StatCard value="1" label="Docker compose command" />
          </div>
        </section>

        <section className="grid-divider">
          <div>
            <span>REAL-TIME SPATIAL MAPPING ENGINE // PLACEHOLDER</span>
            <strong>SYSTEM STABILITY: MVP READY</strong>
          </div>
        </section>
      </main>
    </div>
  );
}
