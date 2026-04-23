const { spawn } = require('node:child_process');
const path = require('node:path');

const root = process.cwd();
const backendCwd = path.join(root, 'silverfox-ecommerce', 'backend');
const frontendCwd = path.join(root, 'silverfox-ecommerce', 'React');
const npmCliPath = process.env.npm_execpath;

if (!npmCliPath) {
  console.error('Unable to locate npm CLI path (npm_execpath is undefined).');
  process.exit(1);
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

const backend = start('backend', backendCwd, 'start');
const frontend = start('frontend', frontendCwd, 'dev');

function shutdown() {
  backend.kill();
  frontend.kill();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
