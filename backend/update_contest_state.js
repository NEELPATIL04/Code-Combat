const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function updateContestStates() {
  try {
    console.log('🔄 Updating contest states...');

    // Update all contests that don't have a contestState
    const result = await pool.query(`
      UPDATE contests
      SET contest_state = 'running'
      WHERE contest_state IS NULL
      RETURNING id, title, status, contest_state;
    `);

    console.log(`✅ Updated ${result.rowCount} contests:`);
    result.rows.forEach(row => {
      console.log(`   - Contest #${row.id}: ${row.title} (${row.status}) → contestState: ${row.contest_state}`);
    });

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating contest states:', error);
    await pool.end();
    process.exit(1);
  }
}

updateContestStates();
