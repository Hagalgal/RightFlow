import { query } from '../src/config/database';

async function checkFormsTable() {
  try {
    const columns = await query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'forms'
      ORDER BY ordinal_position
    `);

    console.log('\n📋 Columns in forms table:\n');
    columns.forEach((col: any) => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
    console.log('');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

checkFormsTable();
