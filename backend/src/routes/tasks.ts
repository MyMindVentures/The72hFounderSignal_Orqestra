import { Router } from 'express';
import { tasksStore } from '../stores/tasksStore';

export const taskRouter = Router();

taskRouter.get('/', (_req, res) => {
  res.json({ tasks: tasksStore.getAll() });
});

taskRouter.get('/:id', (req, res) => {
  const task = tasksStore.getById(req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json({ task });
});

