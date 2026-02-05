const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const sql = fs.readFileSync('./add_columns.sql', 'utf-8');

(async () => {
  try {
    console.log('🔄 Updating database schema...');
    await pool.query(sql);
    console.log('✅ Database updated successfully!');
    console.log('📝 Added columns:');
    console.log('   - users.first_name');
    console.log('   - users.last_name');
    console.log('   - users.company_school');
    console.log('   - users.status');
    console.log('📊 Created tables:');
    console.log('   - contests');
    console.log('   - tasks');
    console.log('   - contest_participants');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
