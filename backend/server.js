// Foodie Haven Full Restaurant API Server
// Connects to MongoDB Atlas and serves all REST API endpoints
require('dotenv').config();

try {
  // Load compiled TypeScript application with all routes and MongoDB models
  require('./dist/index.js');
} catch (err) {
  // Fallback if not compiled
  console.log('Compiling and starting server...');
  require('child_process').execSync('npm run build', { stdio: 'inherit', cwd: __dirname });
  require('./dist/index.js');
}