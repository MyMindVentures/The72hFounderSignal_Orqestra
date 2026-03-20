import path from 'path';



import { fileURLToPath } from 'url';



import { defineConfig } from '@playwright/test';







const here = path.dirname(fileURLToPath(import.meta.url));



const repoRoot = path.join(here, '..', '..', '..', '..');



const backendDist = path.join(repoRoot, 'backend', 'dist', 'index.js');



const mobileRoot = path.join(repoRoot, 'mobile');







/** Backend port for this suite (default 4010; override with `E2E_PORT`). */
const e2ePort = process.env.E2E_PORT ?? '4010';



const expoWebPort = process.env.EXPO_WEB_PORT ?? '8095';



const ciStrict = ['1', 'true', 'yes'].includes(String(process.env.CI ?? '').toLowerCase());

const reuseServer = !ciStrict;



export default defineConfig({



  testDir: here,



  timeout: 120_000,



  expect: { timeout: 30_000 },



  use: {



    baseURL: `http://127.0.0.1:${expoWebPort}`,



    trace: 'on-first-retry'



  },



  webServer: [



    {



      command: `node "${backendDist}"`,



      cwd: path.join(repoRoot, 'backend'),



      env: {



        ...process.env,



        PORT: e2ePort,



        NODE_ENV: 'test',



        STATE_DIR: process.env.E2E_STATE_DIR_WEB ?? path.join(repoRoot, 'backend', '.state-e2e-web')



      },



      url: `http://127.0.0.1:${e2ePort}/api/health`,



      reuseExistingServer: reuseServer,



      timeout: 120_000



    },



    {



      command: 'npx expo start --web --localhost',



      cwd: mobileRoot,



      env: {



        ...process.env,



        CI: '1',



        EXPO_NO_TELEMETRY: '1',



        BROWSER: 'none',



        EXPO_PUBLIC_API_BASE_URL: `http://127.0.0.1:${e2ePort}`,



        RCT_METRO_PORT: expoWebPort



      },



      url: `http://127.0.0.1:${expoWebPort}/`,



      reuseExistingServer: reuseServer,



      timeout: 180_000



    }



  ]



});




