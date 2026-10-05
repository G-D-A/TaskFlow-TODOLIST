import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import sequelize from './config/database.js';
import './models/index.js';

const port = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(port, () => console.log(`API running on http://localhost:${port}`));
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

start();
