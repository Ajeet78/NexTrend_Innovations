// Simple runner for Puppeteer tests: starts server, runs test, then exits
const { spawn } = require('child_process');
const path = require('path');
const proc = spawn('node', [path.join(__dirname, 'dropdown-position.test.js')], { stdio: 'inherit' });
proc.on('close', code => process.exit(code));
