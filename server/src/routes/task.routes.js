import { Router } from 'express';
import { Task } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const statuses = ['todo', 'in progress', 'done'];

function hasValidStatus(status) {
  return statuses.includes(status);
}

// Every task endpoint below requires a valid JWT.
router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const { status } = req.query;
    if (status && !hasValidStatus(status)) {
      return res.status(400).json({ message: 'Unknown task status.' });
    }

    const tasks = await Task.findAll({
      // Always scope tasks to the authenticated user, with an optional status filter.
      where: { userId: req.user.id, ...(status ? { status } : {}) },
      order: [['createdAt', 'DESC']],
    });
    return res.json(tasks);
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { title, description = '', status = 'todo' } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: 'Task title is required.' });
    if (!hasValidStatus(status)) return res.status(400).json({ message: 'Unknown task status.' });

    const task = await Task.create({
      title: title.trim(), description: description.trim(), status, userId: req.user.id,
    });
    return res.status(201).json(task);
  } catch (error) {
    return next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    // Including userId prevents a user from changing another user's task.
    const task = await Task.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    const { title, description, status } = req.body;
    if (title !== undefined && !title.trim()) return res.status(400).json({ message: 'Task title cannot be empty.' });
    if (status !== undefined && !hasValidStatus(status)) return res.status(400).json({ message: 'Unknown task status.' });

    await task.update({
      ...(title !== undefined ? { title: title.trim() } : {}),
      ...(description !== undefined ? { description: description.trim() } : {}),
      ...(status !== undefined ? { status } : {}),
    });
    return res.json(task);
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await Task.destroy({ where: { id: req.params.id, userId: req.user.id } });
    if (!deleted) return res.status(404).json({ message: 'Task not found.' });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

export default router;
