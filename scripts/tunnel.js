const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

const PORT = 3000;
const ENV_PATH = path.join(__dirname, '..', '.env');
let activeUrl = null;
let heartbeatTimer = null;

function updateEnv(url) {
  try {
    activeUrl = url;
    let content = fs.readFileSync(ENV_PATH, 'utf8');
    const regex = /PUBLIC_WEBHOOK_URL="[^"]*"/;
    if (regex.test(content)) {
      content = content.replace(regex, `PUBLIC_WEBHOOK_URL="${url}"`);
    } else {
      content += `\nPUBLIC_WEBHOOK_URL="${url}"\n`;
    }
    fs.writeFileSync(ENV_PATH, content, 'utf8');
    process.env.PUBLIC_WEBHOOK_URL = url;
    console.log(`[Tunnel] .env updated with: PUBLIC_WEBHOOK_URL="${url}"`);
  } catch (err) {
    console.warn('[Tunnel] Could not update .env:', err.message);
  }
}

function startTunnel() {
  console.log(`[Tunnel] Spawning localtunnel on port ${PORT}...`);
  if (heartbeatTimer) clearInterval(heartbeatTimer);

  const lt = spawn('npx.cmd', ['-y', 'localtunnel', '--port', String(PORT)], {
    shell: true,
  });

  lt.stdout.on('data', (data) => {
    const out = data.toString().trim();
    console.log(`[Tunnel] ${out}`);
    if (out.includes('your url is:')) {
      const match = out.match(/https:\/\/[^\s]+/);
      if (match) {
        updateEnv(match[0]);
      }
    }
  });

  lt.stderr.on('data', (data) => {
    console.warn(`[Tunnel Error] ${data.toString().trim()}`);
  });

  lt.on('close', (code) => {
    console.warn(`[Tunnel] Process exited with code ${code}. Restarting in 2 seconds...`);
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    setTimeout(startTunnel, 2000);
  });

  lt.on('error', (err) => {
    console.warn(`[Tunnel Error] ${err.message}. Restarting in 3 seconds...`);
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    setTimeout(startTunnel, 3000);
  });

  // Keep-alive heartbeat every 15 seconds
  heartbeatTimer = setInterval(() => {
    if (!activeUrl) return;
    https.get(`${activeUrl}/api/stats`, {
      headers: { 'Bypass-Tunnel-Reminder': 'true' }
    }, () => {}).on('error', () => {});
  }, 15000);
}

startTunnel();
