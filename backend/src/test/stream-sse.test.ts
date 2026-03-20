import http, { createServer } from 'http';

import { createApp } from '../app';



describe('GET /api/stream SSE', () => {

  it('emits hello event', async () => {

    const app = createApp();

    const server = createServer(app);

    await new Promise<void>((resolve) => server.listen(0, resolve));

    const addr = server.address();

    const port = typeof addr === 'object' && addr ? addr.port : 0;



    const body = await new Promise<string>((resolve, reject) => {

      const t = setTimeout(() => reject(new Error('sse timeout')), 3000);

      http.get(`http://127.0.0.1:${port}/api/stream`, (res) => {

        let buf = '';

        res.on('data', (chunk: Buffer) => {

          buf += chunk.toString();

          if (buf.includes('hello') && buf.includes('ok')) {

            clearTimeout(t);

            res.destroy();

            resolve(buf);

          }

        });

        res.on('error', (e) => {

          clearTimeout(t);

          reject(e);

        });

      }).on('error', (e) => {

        clearTimeout(t);

        reject(e);

      });

    });



    server.close();

    expect(body).toMatch(/event:\s*hello/);

    expect(body).toMatch(/"ok":\s*true/);

  });

});


