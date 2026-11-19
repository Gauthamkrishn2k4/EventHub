import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/env.js';
import { createApp } from './app.js';

await connectDB();
const server = createApp().listen(env.PORT, () => console.log(`EventHub API listening on :${env.PORT}`));

const shutdown = (signal) => {
  console.log(`${signal} received, shutting down`);
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
};
['SIGINT', 'SIGTERM'].forEach((s) => process.on(s, () => shutdown(s)));
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  shutdown('unhandledRejection');
});
