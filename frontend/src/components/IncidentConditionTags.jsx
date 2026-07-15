const conditionLabels = [
  ['has_smoke', '연기 있음'],
  ['hallway_smoke_visible', '복도 연기'],
  ['has_flame', '불꽃'],
  ['stairs_available', '계단 가능'],
  ['is_trapped', '이동 어려움'],
  ['has_vulnerable_people', '노약자/장애인'],
  ['has_child_companion', '어린아이'],
  ['door_closed', '문 닫힘'],
  ['door_handle_hot', '문 손잡이 열감'],
];

export function getIncidentConditionLabels(report = {}) {
  return conditionLabels
    .filter(([field]) => report[field])
    .map(([, label]) => label);
}

export default function IncidentConditionTags({ report, emptyText = '상세 조건 없음' }) {
  const labels = getIncidentConditionLabels(report);

  return (
    <div className="incident-tags">
      {labels.length > 0
        ? labels.map((label) => <span key={label}>{label}</span>)
        : <span>{emptyText}</span>}
    </div>
  );
}
