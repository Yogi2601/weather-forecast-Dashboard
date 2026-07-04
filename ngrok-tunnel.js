#!/usr/bin/env node

const { spawn } = require('child_process');
const http = require('http');

console.log('🚀 Starting ngrok tunnel...\n');

// Start ngrok process
const ngrok = spawn('ngrok', ['http', '5175', '--authtoken', '3FzZtSi0rRLDbE6BEfFW0IdZKEC_6iYwCh9M5yJM1hNcQDFEk']);

ngrok.stdout.on('data', (data) => {
  console.log(`${data}`);
});

ngrok.stderr.on('data', (data) => {
  console.error(`${data}`);
});

// Wait for ngrok to start and then get the tunnel URL
setTimeout(() => {
  getTunnelUrl();
}, 3000);

function getTunnelUrl() {
  const options = {
    hostname: 'localhost',
    port: 4040,
    path: '/api/tunnels',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        const tunnel = json.tunnels.find(t => t.proto === 'https');

        if (tunnel) {
          console.log('\n✅ Ngrok Tunnel is Active!\n');
          console.log('🌍 Public URL (share this):');
          console.log(`   ${tunnel.public_url}\n`);
          console.log('📱 Local access:');
          console.log('   http://localhost:5175\n');
          console.log('Press Ctrl+C to stop the tunnel.\n');
        }
      } catch (e) {
        console.error('Could not parse tunnel info:', e);
        setTimeout(getTunnelUrl, 2000);
      }
    });
  });

  req.on('error', (e) => {
    console.log('Waiting for ngrok to start...');
    setTimeout(getTunnelUrl, 2000);
  });

  req.end();
}

// Keep process alive
process.on('SIGINT', () => {
  console.log('\n\n👋 Stopping ngrok...');
  ngrok.kill();
  process.exit(0);
});
