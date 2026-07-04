const ngrok = require('ngrok');

(async () => {
  try {
    const url = await ngrok.connect(5175);
    console.log('Ngrok tunnel URL:', url);
    console.log('\nYour weather dashboard is now accessible at:');
    console.log(url);
    console.log('\nPress Ctrl+C to stop the tunnel.');

    // Keep the process alive
    await new Promise(() => {});
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
