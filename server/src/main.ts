import 'dotenv/config';
import http from 'http';
import { connectDb } from './db';
import { createApp } from './app';
import { attachSocketIO } from './io';

async function main() {
  await connectDb();

  const app = createApp();
  const server = http.createServer(app);
  attachSocketIO(server);

  const PORT = Number(process.env.PORT ?? 3000);
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
