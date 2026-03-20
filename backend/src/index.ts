import 'dotenv/config';

import { createApp, startServer } from './app';

import { startWorkflowEngine } from './engine/workflowEngine';

import { hydrateAll } from './persistence/jsonPersistence';



const app = createApp();

const port = Number(process.env.PORT) || 4000;



hydrateAll();

startWorkflowEngine();



startServer(app, port);


