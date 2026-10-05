import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

const router = Router();

function createToken(user) {
  // Keep only the data needed to identify the user in protected requests.
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

router.post('/register', async (req, res, next) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;

    if (!email || !password || password.length < 6) {
      return res.status(400).json({ message: 'Provide a valid email and a password of at least 6 characters.' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(409).json({ message: 'A user with this email already exists.' });

    // Store a bcrypt hash, never the original password.
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, password: passwordHash });
    const token = createToken(user);

    return res.status(201).json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    // The database unique constraint also protects against simultaneous registrations.
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'A user with this email already exists.' });
    }
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;
    const user = await User.scope('withPassword').findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password || '', user.password))) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    const token = createToken(user);
    return res.json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    return next(error);
  }
});

export default router;
