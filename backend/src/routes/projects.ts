import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Project } from '../models';

const projects = new Map<string, Project>();

export function resetProjectsMap() {
  projects.clear();
}

export const projectRouter = Router();

projectRouter.get('/', (_req, res) => {
  res.json({ projects: Array.from(projects.values()) });
});

projectRouter.post('/', (req, res) => {
  const { name, description } = req.body ?? {};
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'name is required' });
  }

  const now = new Date().toISOString();
  const project: Project = {
    id: uuidv4(),
    name,
    description,
    createdAt: now,
    updatedAt: now
  };

  projects.set(project.id, project);
  res.status(201).json({ project });
});

projectRouter.get('/:id', (req, res) => {
  const project = projects.get(req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  res.json({ project });
});

