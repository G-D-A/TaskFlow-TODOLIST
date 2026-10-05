import cors from 'cors';
import express from 'express';
import authRoutes from './routes/auth.routes.js';
import taskRoutes from './routes/task.routes.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ message: err.errors[0].message });
  }
  return res.status(500).json({ message: 'Internal server error.' });
});

export default app;
