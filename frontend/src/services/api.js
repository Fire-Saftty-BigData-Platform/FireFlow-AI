const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const payload = await response.json();

  if (!response.ok || payload.success === false) {
    throw new Error(payload.error?.message || `API request failed: ${response.status}`);
  }

  return payload.data;
}

export function createEvacuationGuide(payload) {
  return request('/citizen/evacuation-guide', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getEvacuationGuideForIncident(id) {
  return request(`/citizen/incidents/${id}/evacuation-guide`);
}

export function createFirefighterSummary(payload) {
  return request('/firefighter/summary', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getFirefighterBriefingForIncident(id) {
  return request(`/firefighter/incidents/${id}/briefing`);
}

export function getIncidents() {
  return request('/incidents');
}

export function getIncident(id) {
  return request(`/incidents/${id}`);
}

export function getControlOverview() {
  return request('/control/overview');
}
