import fs from 'fs';

import path from 'path';

import { repoRoot, testHardeningRoot } from '../paths.js';



function main() {

  const issues: string[] = [];

  const readme = path.join(repoRoot, 'README.md');

  const readmeText = fs.readFileSync(readme, 'utf-8');

  if (!readmeText.includes('backend/')) issues.push('Root README should mention backend/');

  if (!readmeText.includes('mobile/')) issues.push('Root README should mention mobile/');



  const backendReadme = path.join(repoRoot, 'backend', 'README.md');

  if (!fs.existsSync(backendReadme)) {

    issues.push('Missing backend/README.md (referenced from root README)');

  }



  const routesTs = path.join(repoRoot, 'backend', 'src', 'routes.ts');

  const routeText = fs.readFileSync(routesTs, 'utf-8');

  const expectedMounts = ['projects', 'blueprints', 'jobs', 'stream', 'admin'];

  for (const m of expectedMounts) {

    if (!routeText.includes(`'/${m}'`) && !routeText.includes(`"/${m}"`)) {

      if (!routeText.includes(m)) issues.push(`routes.ts may be missing mount for ${m}`);

    }

  }

  const buildPrompt = path.join(repoRoot, 'BuildPrompt.md');
  if (!fs.existsSync(buildPrompt)) {
    issues.push('Missing BuildPrompt.md at repository root');
  } else {
    const bp = fs.readFileSync(buildPrompt, 'utf-8');
    const must = ['blueprint', 'workflow', 'dashboard', 'orchestrat'];
    for (const w of must) {
      if (!bp.toLowerCase().includes(w.toLowerCase())) {
        issues.push(`BuildPrompt.md should mention theme related to "${w}"`);
      }
    }
  }

  const out = {

    checkedAt: new Date().toISOString(),

    pass: issues.length === 0,

    issues

  };



  const outDir = path.join(testHardeningRoot, 'reports', 'artifacts');

  fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(path.join(outDir, 'docs_consistency.json'), JSON.stringify(out, null, 2), 'utf-8');



  if (issues.length) {

    console.error('Docs consistency issues:', issues);

    process.exit(1);

  }

  console.log('Docs consistency OK');

}



main();


