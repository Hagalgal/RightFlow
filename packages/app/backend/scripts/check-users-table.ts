import { query } from '../src/config/database';

async function checkUsersTable() {
  try {
    console.log('\n📋 Users table structure:\n');
    const usersCols = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    usersCols.forEach((col: any) => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    console.log('\n📋 Organizations table structure:\n');
    const orgsCols = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'organizations'
      ORDER BY ordinal_position
    `);
    orgsCols.forEach((col: any) => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    console.log('');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

checkUsersTable();
