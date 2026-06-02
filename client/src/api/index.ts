import { Song, StepChart, HighScore } from '../types';

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
