import { query } from '../src/config/database';

async function deleteEmptyForms() {
  try {
    // Find all forms with 0 fields
    const emptyForms = await query(`
      SELECT id, title, fields
      FROM forms
      WHERE (fields IS NULL OR jsonb_array_length(fields) = 0)
        AND deleted_at IS NULL
    `);

    console.log(`\n📊 Found ${emptyForms.length} forms with 0 fields:\n`);
    emptyForms.forEach((form: any) => {
      console.log(`  - ${form.title} (ID: ${form.id})`);
    });

    if (emptyForms.length === 0) {
      console.log('✅ No empty forms to delete.');
      return;
    }

    // Soft delete them
    const result = await query(`
      UPDATE forms
      SET deleted_at = NOW()
      WHERE (fields IS NULL OR jsonb_array_length(fields) = 0)
        AND deleted_at IS NULL
      RETURNING id, title
    `);

    console.log(`\n✅ Deleted ${result.length} forms successfully!\n`);
    result.forEach((form: any) => {
      console.log(`  ✓ ${form.title} (ID: ${form.id})`);
    });
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

deleteEmptyForms();
