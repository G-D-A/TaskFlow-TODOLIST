import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

// Load local database settings before Sequelize connects.
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required. Copy server/.env.example to server/.env and configure PostgreSQL.');
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: process.env.NODE_ENV === 'production'
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {},
});

export default sequelize;
