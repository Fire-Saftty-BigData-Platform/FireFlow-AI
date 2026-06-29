const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

export function createEvacuationGuide(payload) {
  return request('/api/evacuation-guide', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function createFirefighterSummary(payload) {
  return request('/api/firefighter-summary', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getIncidents() {
  return request('/api/incidents');
}

export function getIncident(id) {
  return request(`/api/incidents/${id}`);
}
