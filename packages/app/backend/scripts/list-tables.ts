import { query } from '../src/config/database';

async function listTables() {
  try {
    const tables = await query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    console.log(`\n📊 Tables in database:\n`);
    tables.forEach((table: any) => {
      console.log(`  - ${table.tablename}`);
    });
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

listTables();
