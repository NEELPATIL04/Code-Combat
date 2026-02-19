/**
 * update-descriptions.js
 * ─────────────────────────────────────────────────────────────────────────────
 * UPDATEs all existing problems in the DB with properly structured HTML descriptions.
 *
 * What it fixes:
 *  - Description was stored as plain text → now stored as HTML
 *  - Examples were duplicated in description → now REMOVED from description
 *    (they auto-show from testCases[0,1] in the UI already)
 *  - Constraints stored as bullet text → now proper <h3> + <ul><li> HTML
 *
 * Final description structure per problem:
 *   <p>Problem statement line 1...</p>
 *   <p>Problem statement line 2...</p>
 *   <h3>Constraints:</h3>
 *   <ul>
 *     <li>2 &lt;= nums.length &lt;= 10^4</li>
 *     ...
 *   </ul>
 *
 * Safe to re-run — updates by slug match.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Auto-load .env from backend directory
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const eqIdx = trimmed.indexOf('=');
            if (eqIdx > 0) {
                const key = trimmed.substring(0, eqIdx).trim();
                const val = trimmed.substring(eqIdx + 1).trim();
                if (!process.env[key]) process.env[key] = val;
            }
        }
    });
    console.log('✅ Loaded .env from:', envPath);
}

// ─── CONFIG ──────────────────────────────────────────────────────────────────

const JSON_FILE_PATH = fs.existsSync(path.join(__dirname, 'merged_problems.json'))
    ? path.join(__dirname, 'merged_problems.json')
    : path.join(__dirname, '..', '..', 'merged_problems.json');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'codeCombat',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
});

// ─── HTML BUILDER ─────────────────────────────────────────────────────────────

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * Convert plain text problem statement into HTML paragraphs.
 * Removes any leftover "Example N:" / "Constraints:" / "Follow up:" placeholders.
 */
function buildStatementHtml(rawDescription) {
    // Remove placeholder lines the JSON has (e.g. "Example 1:\nExample 2:\nConstraints:")
    const cleaned = rawDescription
        .replace(/Example \d+:\s*/gi, '')
        .replace(/Constraints:\s*$/i, '')
        .replace(/Follow[- ]?up:.*$/gim, '')
        .trim();

    // Split into lines, group into paragraphs
    const lines = cleaned.split('\n').map(l => l.trim());
    const paragraphs = [];
    let current = [];

    for (const line of lines) {
        if (line === '') {
            if (current.length > 0) {
                paragraphs.push(current.join(' '));
                current = [];
            }
        } else {
            current.push(line);
        }
    }
    if (current.length > 0) paragraphs.push(current.join(' '));

    // Wrap each paragraph in <p>, escape HTML, wrap inline code hints
    return paragraphs
        .filter(p => p.length > 0)
        .map(p => {
            // Escape HTML entities
            let html = escapeHtml(p);
            // Wrap things like `word` in <code> if present
            html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
            return `<p>${html}</p>`;
        })
        .join('\n');
}

/**
 * Build constraints HTML block
 */
function buildConstraintsHtml(constraints) {
    if (!constraints || constraints.length === 0) return '';

    const items = constraints
        .map(c => `  <li>${escapeHtml(c)}</li>`)
        .join('\n');

    return `<h3>Constraints:</h3>\n<ul>\n${items}\n</ul>`;
}

/**
 * Build the full HTML description:
 *   - Problem statement as <p> tags
 *   - Constraints as <h3> + <ul>
 *   - NO examples (they come from testCases automatically in the UI)
 */
function buildHtmlDescription(problem) {
    const parts = [];

    // 1. Problem statement
    const statementHtml = buildStatementHtml(problem.description);
    if (statementHtml) parts.push(statementHtml);

    // 2. Constraints
    const constraintsHtml = buildConstraintsHtml(problem.constraints);
    if (constraintsHtml) {
        parts.push('<hr>');
        parts.push(constraintsHtml);
    }

    return parts.join('\n');
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
    console.log('🔄 Starting description UPDATE for all problems...\n');

    // Load JSON
    if (!fs.existsSync(JSON_FILE_PATH)) {
        console.error(`❌ JSON file not found: ${JSON_FILE_PATH}`);
        process.exit(1);
    }

    const raw = fs.readFileSync(JSON_FILE_PATH, 'utf8');
    const data = JSON.parse(raw);
    const problems = data.questions || data;
    console.log(`📦 Loaded ${problems.length} problems from JSON\n`);

    // Connect
    try {
        await pool.query('SELECT 1');
        console.log('✅ Database connected\n');
    } catch (err) {
        console.error('❌ DB connection failed:', err.message);
        process.exit(1);
    }

    // Process each problem
    let updated = 0;
    let notFound = 0;
    let failed = 0;

    for (let i = 0; i < problems.length; i++) {
        const problem = problems[i];
        const slug = problem.problem_slug;

        try {
            const htmlDescription = buildHtmlDescription(problem);

            const result = await pool.query(
                `UPDATE problems SET description = $1, updated_at = NOW() WHERE slug = $2`,
                [htmlDescription, slug]
            );

            if (result.rowCount === 0) {
                notFound++;
                // Not in DB — skip silently
            } else {
                updated++;
                if (updated % 100 === 0) {
                    console.log(`✅ Updated ${updated}/${problems.length}...`);
                }
            }
        } catch (err) {
            failed++;
            console.error(`❌ FAILED: ${problem.title} — ${err.message}`);
        }
    }

    // Summary
    console.log('\n─────────────────────────────────────────');
    console.log(`✅ Updated  : ${updated} problems`);
    console.log(`⚠️  Not found: ${notFound} (slug not in DB)`);
    console.log(`❌ Failed   : ${failed}`);
    console.log('─────────────────────────────────────────');

    // Show a sample of what was generated for Two Sum
    const sample = problems.find(p => p.problem_slug === 'two-sum');
    if (sample) {
        console.log('\n📋 SAMPLE — Two Sum description HTML:\n');
        console.log(buildHtmlDescription(sample));
    }

    console.log('\n🎉 Done!\n');
    await pool.end();
}

main().catch(err => {
    console.error('💥 Fatal error:', err);
    process.exit(1);
});
