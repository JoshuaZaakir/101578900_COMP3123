import { createApp } from './app.js';

process.loadEnvFile && (() => { try { process.loadEnvFile(); } catch (error) { if (error.code !== 'ENOENT') throw error; } })();
const port = Number(process.env.PORT || 3010);
const server = createApp().listen(port, '127.0.0.1', () => {
  console.log(`StudyBoard: http://127.0.0.1:${port} (API + production build)`);
  console.log('Demo account: demo@studyboard.dev / ReduxJWT10!');
});
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
