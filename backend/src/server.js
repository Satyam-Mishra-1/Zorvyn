import 'dotenv/config';
import { createApp } from './app.js';
import { connectDb } from './config/db.js';

const PORT = Number(process.env.PORT) || 4000;
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/finance_dashboard';

async function main() {
  await connectDb(uri);
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`Finance API listening on http://localhost:${PORT}`);
    console.log(`API docs: http://localhost:${PORT}/api/docs`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
