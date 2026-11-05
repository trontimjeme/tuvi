/** Pull verified source commit at BUILD TIME, never per request. */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, cpSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
const root = resolve('.');
const sha = 'a600484a49255039d0725f1ba9e11ca81a948f97';
const remote = 'https://github.com/Renhuai123/ziwei-doushu.git';
const target = join(root, 'lib/ziwei');
// These upstream browser helpers depend on its separate BirthForm UI; this app uses lib/azone/chart.ts.
const uiOnlyFiles = new Set(['history.ts', 'share.ts']);
const pruneUiHelpers = () => {
  for (const name of uiOnlyFiles) rmSync(join(target, name), { force: true });
};
const marker = join(root, 'lib/.source-commit');
const current = existsSync(marker) ? readFileSync(marker, 'utf8').trim() : '';
if (current === sha && existsSync(join(target, 'algorithm.ts')) && existsSync(join(target, 'school-data.ts'))) {
  pruneUiHelpers();
  console.log('AZONE: verified source already prepared at', sha);
  process.exit(0);
}
const temp = join(root, '.source-upstream');
rmSync(temp, { recursive: true, force: true });
mkdirSync(temp, { recursive: true });
const run = (args, cwd = temp) => execFileSync('git', args, { cwd, stdio: 'inherit', timeout: 120000 });
try {
  run(['init', '-q']);
  run(['remote', 'add', 'origin', remote]);
  run(['fetch', '--depth', '1', 'origin', sha]);
  run(['checkout', '-q', 'FETCH_HEAD']);
  const actual = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: temp, encoding: 'utf8' }).trim();
  if (actual !== sha) throw new Error('Source commit mismatch; refusing unverified engine.');
  const from = join(temp, 'lib/ziwei');
  if (!existsSync(join(from, 'algorithm.ts')) || !existsSync(join(from, 'true-solar-time.ts'))) {
    throw new Error('Upstream changed unexpectedly; engine source missing.');
  }
  rmSync(target, { recursive: true, force: true });
  cpSync(from, target, { recursive: true, filter: source => !uiOnlyFiles.has(basename(source)) });
  for (const [original, renamed] of [['LICENSE','UPSTREAM-MIT-LICENSE'],['DATASET-LICENSE','UPSTREAM-DATASET-LICENSE']]) {
    if (existsSync(join(temp, original))) cpSync(join(temp,original), join(root,renamed));
  }
  writeFileSync(marker, sha + '\n');
  console.log('AZONE: imported original engine at', sha);
} catch (e) {
  console.error('Could not download upstream source. Netlify build requires GitHub access.');
  throw e;
} finally {
  rmSync(temp, { recursive: true, force: true });
}
