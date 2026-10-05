import http from './http.js';

export async function register(credentials) {
  const { data } = await http.post('/auth/register', credentials);
  return data;
}

export async function login(credentials) {
  const { data } = await http.post('/auth/login', credentials);
  return data;
}
