try {
  require('./server.js');
} catch (error) {
  require('fs').writeFileSync('crash.log', error.stack || error.toString());
  console.log("CRASH CAUGHT. See crash.log");
}
