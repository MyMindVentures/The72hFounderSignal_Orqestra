import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { repoRoot, testHardeningRoot } from '../paths.js';



function readJson(p: string) {

  return JSON.parse(fs.readFileSync(p, 'utf-8')) as {

    dependencies?: Record<string, string>;

    devDependencies?: Record<string, string>;

  };

}



function main() {

  const backendPkg = path.join(repoRoot, 'backend', 'package.json');

  const mobilePkg = path.join(repoRoot, 'mobile', 'package.json');

  const backend = readJson(backendPkg);

  const mobile = readJson(mobilePkg);



  const unusedHints: string[] = [];

  if (backend.dependencies?.pg) {

    const srcRoot = path.join(repoRoot, 'backend', 'src');

    const grep = walk(srcRoot).some((f) => {

      const t = fs.readFileSync(f, 'utf-8');

      return t.includes("from 'pg'") || t.includes('require("pg")');

    });

    if (!grep) unusedHints.push('backend: `pg` is listed in package.json but not imported in src/');

  }



  function npmAuditJson(cwd: string) {
    const r = spawnSync('npm', ['audit', '--json'], { cwd, encoding: 'utf-8', shell: true });
    if (!r.stdout) return { cwd, exitCode: r.status, error: 'no stdout' };
    try {
      const j = JSON.parse(r.stdout) as { metadata?: { vulnerabilities?: Record<string, number> } };
      const v = j.metadata?.vulnerabilities ?? {};
      const total = Object.values(v).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0);
      return { cwd, exitCode: r.status, vulnerabilityBuckets: v, totalReported: total };
    } catch {
      return { cwd, exitCode: r.status, parseError: true };
    }
  }

  const out = {
    auditedAt: new Date().toISOString(),
    unusedHints,
    npmAudit: {
      backend: npmAuditJson(path.join(repoRoot, 'backend')),
      mobile: npmAuditJson(path.join(repoRoot, 'mobile'))
    },
    lockfiles: {
      backend: fs.existsSync(path.join(repoRoot, 'backend', 'package-lock.json')),
      mobile: fs.existsSync(path.join(repoRoot, 'mobile', 'package-lock.json'))
    }
  };



  const outDir = path.join(testHardeningRoot, 'reports', 'artifacts');

  fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(path.join(outDir, 'deps_audit.json'), JSON.stringify(out, null, 2), 'utf-8');

  console.log('Deps audit written. Hints:', unusedHints.length ? unusedHints : 'none');

}



function walk(dir: string, acc: string[] = []): string[] {

  if (!fs.existsSync(dir)) return acc;

  for (const name of fs.readdirSync(dir)) {

    const full = path.join(dir, name);

    const st = fs.statSync(full);

    if (st.isDirectory()) walk(full, acc);

    else if (full.endsWith('.ts') && !full.endsWith('.d.ts')) acc.push(full);

  }

  return acc;

}



main();


