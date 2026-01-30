import { query } from '../src/config/database';

async function deleteFormsAndResponses() {
  try {
    console.log('\n⚠️  WARNING: This will delete ALL forms and responses!\n');

    // Count current records
    const formsCount = await query('SELECT COUNT(*) as count FROM forms');
    const responsesCount = await query('SELECT COUNT(*) as count FROM responses');

    console.log(`📊 Current data:\n`);
    console.log(`  - Forms: ${formsCount[0].count}`);
    console.log(`  - Responses: ${responsesCount[0].count}\n`);

    if (formsCount[0].count === '0' && responsesCount[0].count === '0') {
      console.log('✅ No data to delete.\n');
      return;
    }

    console.log('🗑️  Deleting all data...\n');

    // Delete all responses
    await query('TRUNCATE TABLE responses CASCADE');
    console.log('  ✓ Deleted all responses');

    // Delete all forms
    await query('TRUNCATE TABLE forms CASCADE');
    console.log('  ✓ Deleted all forms');

    console.log('\n✅ Successfully deleted all forms and responses!\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

deleteFormsAndResponses();
