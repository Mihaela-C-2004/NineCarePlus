const TOKEN_KEY = '9care.token';
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));

async function request(method, url, body) {
  let response;
  try {
    const headers = {};
    if (body) headers['Content-Type'] = 'application/json';
    const t = getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
    response = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new Error('Serverul nu răspunde. Verifică dacă rulează „npm run dev”.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || 'Ceva nu a mers. Încearcă din nou.');
    error.status = response.status;
    throw error;
  }
  return data;
}

export const api = {
  register: (b) => request('POST', '/api/auth/register', b),
  login: (b) => request('POST', '/api/auth/login', b),
  logout: () => request('POST', '/api/auth/logout'),
  me: () => request('GET', '/api/me'),
  updateMe: (b) => request('PATCH', '/api/me', b),
  deleteMe: () => request('DELETE', '/api/me'),
  exportMe: () => request('GET', '/api/me/export'),
  saveCheckin: (b) => request('PUT', '/api/me/checkins/today', b),
  sendRequest: (b) => request('POST', '/api/me/requests', b),
  sendMessage: (id, text) => request('POST', `/api/me/requests/${id}/messages`, { text }),
  addLab: (b) => request('POST', '/api/me/labs', b),
  toggleLesson: (lessonId) => request('POST', '/api/me/progress', { lessonId }),
  addQuestion: (text) => request('POST', '/api/me/questions', { text }),
  deleteQuestion: (id) => request('DELETE', `/api/me/questions/${id}`),
  ask: (question) => request('POST', '/api/assistant', { question }),
  content: () => request('GET', '/api/content'),
  info: () => request('GET', '/api/info'),
  // Clinica
  overview: (code) => request('GET', `/api/clinic/${code}/overview`),
  updateClinic: (code, b) => request('PATCH', `/api/clinic/${code}`, b),
  patient: (id) => request('GET', `/api/clinic/patients/${id}`),
  updatePatient: (id, b) => request('PATCH', `/api/clinic/patients/${id}`, b),
  addAppointment: (id, b) => request('POST', `/api/clinic/patients/${id}/appointments`, b),
  setRequestStatus: (id, status) => request('PATCH', `/api/clinic/requests/${id}`, { status }),
  reply: (id, text, resolve) => request('POST', `/api/clinic/requests/${id}/messages`, { text, resolve }),
  reset: () => request('POST', '/api/reset'),
};

export function subscribe(onEvent) {
  const source = new EventSource('/api/events');
  source.onmessage = (e) => {
    try {
      onEvent(JSON.parse(e.data));
    } catch {
      /* ignorat */
    }
  };
  return () => source.close();
}
