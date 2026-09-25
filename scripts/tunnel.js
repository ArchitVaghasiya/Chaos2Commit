const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

const PORT = 3000;
const SUBDOMAIN = 'aisales-yash-gohel';
const TARGET_URL = `https://${SUBDOMAIN}.loca.lt`;
const ENV_PATH = path.join(__dirname, '..', '.env');

function updateEnv(url) {
  try {
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
  console.log(`[Tunnel] Spawning localtunnel on port ${PORT} with subdomain: ${SUBDOMAIN}...`);
  updateEnv(TARGET_URL);

  const lt = spawn('npx.cmd', ['-y', 'localtunnel', '--port', String(PORT), '--subdomain', SUBDOMAIN], {
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
    setTimeout(startTunnel, 2000);
  });

  lt.on('error', (err) => {
    console.warn(`[Tunnel Error] ${err.message}. Restarting in 3 seconds...`);
    setTimeout(startTunnel, 3000);
  });

  // Keep-alive heartbeat every 30 seconds
  const heartbeat = setInterval(() => {
    https.get(`${TARGET_URL}/api/stats`, {
      headers: { 'Bypass-Tunnel-Reminder': 'true' }
    }, (res) => {
      // Warm
    }).on('error', () => {
      // Ignore
    });
  }, 30000);

  lt.on('exit', () => clearInterval(heartbeat));
}

startTunnel();
