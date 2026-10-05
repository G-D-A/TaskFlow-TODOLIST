import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createTask, deleteTask, getTasks, updateTask } from './api/tasks.js';

const statuses = [
  { value: '', label: 'All tasks' },
  { value: 'todo', label: 'To do' },
  { value: 'in progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
];

function getErrorMessage(error) {
  return error.response?.data?.message || 'Something went wrong. Please try again.';
}

function TaskEditor({ task, onSave, onCancel, isPending }) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState(task.status);

  function submit(event) {
    event.preventDefault();
    onSave({ title, description, status });
  }

  return (
    <form className="task-editor" onSubmit={submit}>
      <input aria-label="Task title" value={title} onChange={(event) => setTitle(event.target.value)} required />
      <textarea aria-label="Task description" value={description} onChange={(event) => setDescription(event.target.value)} rows="3" />
      <div className="editor-actions">
        <select aria-label="Task status" value={status} onChange={(event) => setStatus(event.target.value)}>
          {statuses.slice(1).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        <button className="text-button" type="button" onClick={onCancel}>Cancel</button>
        <button className="small-primary" type="submit" disabled={isPending}>{isPending ? 'Saving…' : 'Save'}</button>
      </div>
    </form>
  );
}

function TaskItem({ task, onUpdate, onDelete, isUpdating, isDeleting }) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <li className="task-card editing">
        <TaskEditor
          task={task}
          isPending={isUpdating}
          onCancel={() => setIsEditing(false)}
          onSave={(updates) => onUpdate({ id: task.id, updates }, () => setIsEditing(false))}
        />
      </li>
    );
  }

  return (
    <li className="task-card">
      <div className="task-content">
        <span className={`status status-${task.status.replace(' ', '-')}`}>{task.status}</span>
        <h2>{task.title}</h2>
        {task.description && <p>{task.description}</p>}
      </div>
      <div className="task-actions">
        <select aria-label={`Change status for ${task.title}`} value={task.status} onChange={(event) => onUpdate({ id: task.id, updates: { status: event.target.value } })} disabled={isUpdating}>
          {statuses.slice(1).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        <button className="text-button" type="button" onClick={() => setIsEditing(true)}>Edit</button>
        <button className="delete-button" type="button" onClick={() => onDelete(task.id)} disabled={isDeleting}>Delete</button>
      </div>
    </li>
  );
}

function TaskDashboard({ user, onLogout }) {
  const [filter, setFilter] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [newStatus, setNewStatus] = useState('todo');
  const queryClient = useQueryClient();
  // The filter is part of the cache key, so each status has its own task list.
  const queryKey = ['tasks', filter];
  const tasksQuery = useQuery({ queryKey, queryFn: () => getTasks(filter) });
  // Refresh every cached task list after a create, update, or delete operation.
  const invalidateTasks = () => queryClient.invalidateQueries({ queryKey: ['tasks'] });

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      setTitle('');
      setDescription('');
      setNewStatus('todo');
      invalidateTasks();
    },
  });
  const updateMutation = useMutation({ mutationFn: ({ id, updates }) => updateTask(id, updates), onSuccess: invalidateTasks });
  const deleteMutation = useMutation({ mutationFn: deleteTask, onSuccess: invalidateTasks });

  function submitNewTask(event) {
    event.preventDefault();
    createMutation.mutate({ title, description, status: newStatus });
  }

  function updateTaskAndClose(payload, onDone) {
    updateMutation.mutate(payload, { onSuccess: onDone });
  }

  return (
    <section className="dashboard" aria-labelledby="dashboard-title">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">TaskFlow</p>
          <h1 id="dashboard-title">My tasks</h1>
          <p className="user-email">{user.email}</p>
        </div>
        <button className="secondary-button" type="button" onClick={onLogout}>Sign out</button>
      </header>

      <form className="new-task-form" onSubmit={submitNewTask}>
        <div className="form-heading"><h2>Add a task</h2></div>
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Task title" aria-label="New task title" required />
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description (optional)" aria-label="New task description" rows="3" />
        <div className="form-actions">
          <select value={newStatus} onChange={(event) => setNewStatus(event.target.value)} aria-label="New task status">
            {statuses.slice(1).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <button className="primary-button" type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? 'Adding…' : 'Add task'}</button>
        </div>
        {createMutation.isError && <p className="form-error" role="alert">{getErrorMessage(createMutation.error)}</p>}
      </form>

      <div className="tasks-toolbar">
        <h2>Tasks</h2>
        <label>
          <span>Filter</span>
          <select value={filter} onChange={(event) => setFilter(event.target.value)}>
            {statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
      </div>

      {tasksQuery.isLoading && <p className="state-message">Loading tasks…</p>}
      {tasksQuery.isError && <p className="form-error" role="alert">{getErrorMessage(tasksQuery.error)}</p>}
      {tasksQuery.data?.length === 0 && <p className="state-message">No tasks here yet. Add your first one above.</p>}
      <ul className="task-list">
        {tasksQuery.data?.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onUpdate={updateTaskAndClose}
            onDelete={(id) => deleteMutation.mutate(id)}
            isUpdating={updateMutation.isPending}
            isDeleting={deleteMutation.isPending}
          />
        ))}
      </ul>
    </section>
  );
}

export default TaskDashboard;
