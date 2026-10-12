import { spawn } from 'child_process';

const args = process.argv.slice(2);
let port = process.env.PORT || '3000';
let host = '0.0.0.0';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--port' || args[i] === '-p') {
    port = args[i + 1] || port;
    i++;
  } else if (args[i] === '--host' || args[i] === '-H' || args[i] === '--hostname') {
    host = args[i + 1] || host;
    i++;
  }
}

const child = spawn(
  'npx',
  ['next', 'dev', '-p', port, '-H', host],
  {
    stdio: 'inherit',
    env: { ...process.env, PORT: port },
  }
);

child.on('exit', (code) => {
  process.exit(code ?? 0);
});

process.on('SIGTERM', () => child.kill('SIGTERM'));
process.on('SIGINT', () => child.kill('SIGINT'));
