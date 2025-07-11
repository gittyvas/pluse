// src/utils/api.js

export const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
});

export async function getUserProfile() {
  const res = await fetch('/api/user', {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error('Unauthorized');
  return await res.json();
}

export async function logoutUser() {
  localStorage.removeItem('token');
  await fetch('/api/logout', {
    method: 'POST',
    headers: getAuthHeaders(),
  });
}
