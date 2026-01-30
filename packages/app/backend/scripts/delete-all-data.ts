import { query } from '../src/config/database';

async function deleteAllData() {
  try {
    console.log('\n⚠️  WARNING: This will delete ALL data from the database!\n');

    // Get all table names from public schema
    const tables = await query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    console.log(`📊 Found ${tables.length} tables:\n`);
    tables.forEach((table: any) => {
      console.log(`  - ${table.tablename}`);
    });

    console.log('\n🗑️  Deleting all data...\n');

    // Disable foreign key constraints temporarily
    await query('SET session_replication_role = replica;');

    let deletedCount = 0;

    // Delete from each table
    for (const table of tables) {
      const tableName = table.tablename;

      try {
        const result = await query(`TRUNCATE TABLE "${tableName}" CASCADE`);
        console.log(`  ✓ Truncated ${tableName}`);
        deletedCount++;
      } catch (err: any) {
        console.log(`  ⚠️  Could not truncate ${tableName}: ${err.message}`);
      }
    }

    // Re-enable foreign key constraints
    await query('SET session_replication_role = DEFAULT;');

    console.log(`\n✅ Successfully deleted data from ${deletedCount}/${tables.length} tables!\n`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

deleteAllData();
