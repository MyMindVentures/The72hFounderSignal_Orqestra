import 'express-async-errors';

import type { Application } from 'express';
import express, { json } from 'express';
import type { Server } from 'http';
import cors from 'cors';
import helmet from 'helmet';



import { router as apiRouter } from './routes';



export function createApp() {

  const app = express();



  app.use(helmet());

  app.use(cors());

  app.use(json({ limit: '2mb' }));



  app.use('/api', apiRouter);



  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (
      typeof err === 'object' &&
      err !== null &&
      'type' in err &&
      (err as { type: string }).type === 'entity.too.large'
    ) {
      return res.status(413).json({ error: 'Payload too large' });
    }

    console.error(err);

    res.status(500).json({ error: 'Internal server error' });

  });



  return app;
}

export function startServer(app: Application, port: number): Server {
  return app.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
  });
}

