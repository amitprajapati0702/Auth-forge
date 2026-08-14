import { connectDatabase, db, disconnectDatabase } from '../src/infrastructure/database/client.js';
import { users } from '../src/infrastructure/database/schema/index.js';

async function main() {
  console.log('Testing Database Connection...');
  await connectDatabase();

  const userList = await db.select().from(users);
  console.log('✅ Users table fetched successfully. Current user count:', userList.length);

  await disconnectDatabase();
}

main().catch((err) => {
  console.error('❌ Database Test Error:', err);
  process.exit(1);
});
