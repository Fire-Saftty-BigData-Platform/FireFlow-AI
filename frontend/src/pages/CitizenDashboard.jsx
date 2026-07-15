import { useState } from 'react';
import Layout from '../components/Layout.jsx';
import ResultCard from '../components/ResultCard.jsx';
import { createCitizenIncidentReport } from '../services/api.js';

const initialForm = {
  location: '',
  current_floor: '',
  has_smoke: false,
  has_flame: false,
  stairs_available: false,
  is_trapped: false,
  has_vulnerable_people: false,
  has_child_companion: false,
  hallway_smoke_visible: false,
  door_closed: false,
  door_handle_hot: false,
  report_note: '',
};

const conditionGroups = [
  {
    title: '위험 징후',
    options: [
      ['has_smoke', '연기가 있음'],
      ['hallway_smoke_visible', '복도 쪽 연기가 보임'],
      ['has_flame', '불꽃이 보임'],
    ],
  },
  {
    title: '이동 상태',
    options: [
      ['stairs_available', '계단 이용 가능'],
      ['is_trapped', '갇혀 있거나 이동이 어려움'],
    ],
  },
  {
    title: '동행자',
    options: [
      ['has_vulnerable_people', '노약자/장애인 동행'],
      ['has_child_companion', '어린아이 동행'],
    ],
  },
  {
    title: '문 상태',
    options: [
      ['door_closed', '문이 닫혀 있음'],
      ['door_handle_hot', '문 손잡이나 문 주변이 뜨거움'],
    ],
  },
];

const conditionLabels = Object.fromEntries(
  conditionGroups.flatMap((group) => group.options),
);

const scenarioPresets = [
  {
    label: '복도 연기 + 아이',
    values: {
      has_smoke: true,
      hallway_smoke_visible: true,
      has_child_companion: true,
      stairs_available: true,
      report_note: '복도 쪽에 연기가 보이고 어린아이와 함께 있습니다.',
    },
  },
  {
    label: '문 손잡이 뜨거움',
    values: {
      door_closed: true,
      door_handle_hot: true,
      stairs_available: false,
      report_note: '문 손잡이가 뜨겁고 문이 잘 열리지 않습니다.',
    },
  },
  {
    label: '고립 상황',
    values: {
      has_smoke: true,
      is_trapped: true,
      has_vulnerable_people: true,
      report_note: '연기가 들어오고 이동이 어려운 상태입니다.',
    },
  },
  {
    label: '지하층 대피',
    values: {
      hallway_smoke_visible: true,
      stairs_available: true,
      report_note: '지하층 출입구 방향에 연기가 보입니다.',
    },
  },
];

function calculateRiskLevel(form) {
  const score =
    Number(form.has_smoke) +
    Number(form.hallway_smoke_visible) +
    Number(form.has_flame) * 2 +
    Number(!form.stairs_available) +
    Number(form.is_trapped) * 2 +
    Number(form.has_vulnerable_people) +
    Number(form.has_child_companion) +
    Number(form.door_handle_hot);

  if (score >= 4) return '높음';
  if (score >= 2) return '중간';
  return '낮음';
}

function selectedConditions(form) {
  return Object.entries(conditionLabels)
    .filter(([field]) => form[field])
    .map(([, label]) => label);
}

export default function CitizenDashboard({ onBack }) {
  const [form, setForm] = useState(initialForm);
  const [submittedForm, setSubmittedForm] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const applyScenario = (values) => {
    setForm((prev) => ({
      ...initialForm,
      location: prev.location,
      current_floor: prev.current_floor,
      ...values,
    }));
    setResult(null);
    setSubmittedForm(null);
    setError('');
  };

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await createCitizenIncidentReport(form);
      setResult(data.evacuation_guide);
      setSubmittedForm(form);
    } catch (apiError) {
      setError('시연용 신고를 생성하지 못했습니다. 백엔드 서버 상태를 확인하세요.');
    } finally {
      setLoading(false);
    }
  };

  const conditionSummary = submittedForm ? selectedConditions(submittedForm) : [];
  const riskLevel = submittedForm ? calculateRiskLevel(submittedForm) : null;

  return (
    <Layout
      mode="CITIZEN EVACUATION"
      title="시민 대피 안내"
      subtitle="현재 입력한 주소, 층수, 상황 체크, 메모를 기준으로 즉시 참고할 행동을 정리합니다."
      onBack={onBack}
    >
      <section className="dashboard-grid container">
        <form className="panel form-panel" onSubmit={submit}>
          <div className="preset-row" aria-label="시연 예시">
            {scenarioPresets.map((preset) => (
              <button
                className="preset-button"
                key={preset.label}
                type="button"
                onClick={() => applyScenario(preset.values)}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <label>
            현재 위치 또는 주소
            <input
              autoComplete="off"
              placeholder="예: 시연용 A건물"
              required
              value={form.location}
              onChange={(event) => updateField('location', event.target.value)}
            />
          </label>
          <label>
            현재 층
            <input
              autoComplete="off"
              placeholder="예: 5층, 지하 1층"
              required
              value={form.current_floor}
              onChange={(event) => updateField('current_floor', event.target.value)}
            />
          </label>
          <label>
            추가 상황 메모
            <textarea
              rows="4"
              placeholder="예: 복도 쪽에 연기가 보이고 아이가 함께 있습니다."
              value={form.report_note}
              onChange={(event) => updateField('report_note', event.target.value)}
            />
          </label>

          <div className="toggle-grid" aria-label="현재 상황 선택">
            {conditionGroups.map((group) => (
              <div className="condition-section" key={group.title}>
                <p className="condition-section-title">{group.title}</p>
                <div className="condition-grid">
                  {group.options.map(([field, label]) => (
                    <label className="condition-option" key={field}>
                      <input
                        type="checkbox"
                        checked={form[field]}
                        onChange={(event) => updateField(field, event.target.checked)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button className="primary-button large-button" type="submit" disabled={loading}>
            {loading ? '등록 중' : '시연용 신고 등록'}
          </button>
          {error && <p className="error-text">{error}</p>}
        </form>

        <div className="result-stack">
          {result ? (
            <>
              <ResultCard title="입력 요약">
                <div className="summary-strip">
                  <span className={`risk-pill risk-${riskLevel}`}>참고 위험도 {riskLevel}</span>
                  <strong>{submittedForm.location} / {submittedForm.current_floor}</strong>
                </div>
                <div className="summary-tags">
                  {conditionSummary.length > 0
                    ? conditionSummary.map((item) => <span key={item}>{item}</span>)
                    : <span>선택된 상세 조건 없음</span>}
                </div>
                {submittedForm.report_note && <p className="summary-note">{submittedForm.report_note}</p>}
              </ResultCard>
              <ResultCard title="참고용 대피 안내" tone="alert">
                <p className="guide-text">{result.guide}</p>
              </ResultCard>
              <ResultCard title="우선 행동 목록">
                <ol className="action-list priority-list">
                  {result.priority_actions.map((action, index) => (
                    <li className={index === 0 ? 'first-action' : ''} key={action}>{action}</li>
                  ))}
                </ol>
              </ResultCard>
              {result.avoid_actions?.length > 0 && (
                <ResultCard title="피해야 할 행동">
                  <ol className="action-list">
                    {result.avoid_actions.map((action) => <li key={action}>{action}</li>)}
                  </ol>
                </ResultCard>
              )}
              <ResultCard title="경고">
                <p>{result.warning}</p>
              </ResultCard>
              {result.disclaimer && (
                <ResultCard title="안내 범위">
                  <p>{result.disclaimer}</p>
                </ResultCard>
              )}
            </>
          ) : (
            <ResultCard title="대피 안내 대기">
              <p>왼쪽 정보를 입력하고 시연용 신고를 등록하면 대피 안내가 표시되고, 같은 신고가 소방관과 중앙 통제 화면에도 표시됩니다.</p>
            </ResultCard>
          )}
        </div>
      </section>
    </Layout>
  );
}
