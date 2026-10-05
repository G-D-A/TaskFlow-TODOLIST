import User from './User.js';
import Task from './Task.js';

// A task always belongs to one user; removing a user also removes their tasks.
User.hasMany(Task, { foreignKey: 'userId', as: 'tasks', onDelete: 'CASCADE' });
Task.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export { User, Task };
