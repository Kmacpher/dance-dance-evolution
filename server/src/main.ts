import 'dotenv/config';
import { connectDb } from './db';
import { createApp } from './app';

async function main() {
  await connectDb();

  const app = createApp();

  const PORT = Number(process.env.PORT ?? 3000);
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
