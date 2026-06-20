const { spawn, execSync } = require('node:child_process');
const path = require('node:path');

const root = process.cwd();
const backendCwd = path.join(root, 'silverfox-ecommerce', 'backend');
const frontendCwd = path.join(root, 'silverfox-ecommerce', 'React');
const npmCliPath = process.env.npm_execpath;

if (!npmCliPath) {
  console.error('Unable to locate npm CLI path (npm_execpath is undefined).');
  process.exit(1);
}

function freePort(port) {
  try {
    if (process.platform === 'win32') {
      execSync(
        `powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }"`,
        { stdio: 'ignore' }
      );
    } else {
      execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`, { stdio: 'ignore', shell: true });
    }
  } catch {
    /* port already free */
  }
}

function start(name, cwd, scriptName) {
  const child = spawn(process.execPath, [npmCliPath, 'run', scriptName], {
    cwd,
    stdio: 'pipe',
  });

  child.stdout.on('data', (data) => process.stdout.write(`[${name}] ${data}`));
  child.stderr.on('data', (data) => process.stderr.write(`[${name}] ${data}`));

  child.on('exit', (code) => {
    process.stdout.write(`[${name}] exited with code ${code}\n`);
  });

  child.on('error', (err) => {
    process.stderr.write(`[${name}] failed to start: ${err.message}\n`);
  });

  return child;
}

freePort(3001);
const backend = start('backend', backendCwd, 'start');
const frontend = start('frontend', frontendCwd, 'dev');

process.stdout.write('\n========================================\n');
process.stdout.write('  SilverFox is running\n');
process.stdout.write('========================================\n');
process.stdout.write('  Storefront:  http://localhost:5173/shop\n');
process.stdout.write('  Admin:       http://localhost:5173/admin\n');
process.stdout.write('  API:         http://localhost:3001/api\n');
process.stdout.write('  Login:       admin / admin\n');
process.stdout.write('========================================\n\n');

function shutdown() {
  backend.kill();
  frontend.kill();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
