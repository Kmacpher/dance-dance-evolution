import { Song, StepChart, HighScore, User } from '../types';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? res.statusText);
  }
  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  signup: (email: string, username: string, password: string) =>
    request<User>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  session: () => request<User>('/auth/session'),

  // Songs
  getSongs: () => request<Song[]>('/api/songs'),
  getSong: (id: string) => request<Song>(`/api/songs/${id}`),
  getHighScores: (songId: string) => request<HighScore[]>(`/api/songs/${songId}/highScores`),
  putHighScores: (songId: string, highScores: HighScore[]) =>
    request(`/api/songs/${songId}/highScores`, {
      method: 'PUT',
      body: JSON.stringify({ highScores }),
    }),
  uploadSong: (formData: FormData) =>
    fetch('/api/songs/upload', { method: 'POST', body: formData, credentials: 'include' }),

  // Step charts
  getStepChart: (id: string) => request<StepChart>(`/api/stepCharts/${id}`),
};
