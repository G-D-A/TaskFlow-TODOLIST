import http from './http.js';

export async function getTasks(status) {
  const { data } = await http.get('/tasks', { params: status ? { status } : {} });
  return data;
}

export async function createTask(task) {
  const { data } = await http.post('/tasks', task);
  return data;
}

export async function updateTask(id, updates) {
  const { data } = await http.patch(`/tasks/${id}`, updates);
  return data;
}

export async function deleteTask(id) {
  await http.delete(`/tasks/${id}`);
}
