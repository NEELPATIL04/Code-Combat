/**
 * seed-problems.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Reads merged_problems.json and inserts problems into the `problems` table.
 *
 * What it does:
 *  - Merges description + examples + constraints → description field (HTML)
 *  - Parses examples[] → testCases[] (first 2 auto-show in UI as examples)
 *  - Maps code_snippets → starterCode (only supported languages)
 *  - Leaves wrapperCode / testRunnerTemplate empty {}
 *  - Skips problems already in DB (by slug) — safe to re-run
 *
 * Usage (run on server):
 *   node seed-problems.js
 *
 * Env vars needed (same as backend .env):
 *   DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Auto-load .env from backend directory (one level up from scripts/)
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

// Path to your JSON file — looks in scripts/ folder first, then project root
const JSON_FILE_PATH = fs.existsSync(path.join(__dirname, 'merged_problems.json'))
    ? path.join(__dirname, 'merged_problems.json')
    : path.join(__dirname, '..', '..', 'merged_problems.json');

// Only seed these languages (must match your platform's SUPPORTED_LANGUAGES)
const SUPPORTED_LANGUAGES = [
    'javascript', 'typescript', 'python', 'python3',
    'java', 'cpp', 'c', 'csharp', 'golang',
    'ruby', 'kotlin', 'swift', 'rust'
];

// DB connection — reads from environment variables (same as backend .env)
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'codeCombat',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
});

// Admin user ID for createdBy field — change this to your actual admin ID
const ADMIN_USER_ID = process.env.ADMIN_USER_ID || 1;

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/**
 * Parse example_text into { input, expectedOutput }
 * Handles format:
 *   "Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: ..."
 */
function parseExample(exampleText) {
    const lines = exampleText.split('\n').map(l => l.trim()).filter(Boolean);

    let input = '';
    let expectedOutput = '';

    for (const line of lines) {
        if (line.toLowerCase().startsWith('input:')) {
            input = line.replace(/^input:\s*/i, '').trim();
        } else if (line.toLowerCase().startsWith('output:')) {
            expectedOutput = line.replace(/^output:\s*/i, '').trim();
        }
        // Skip Explanation lines
    }

    return { input, expectedOutput };
}

/**
 * Build a clean description string by merging:
 *   - Base description (with Example N / Constraints placeholders stripped)
 *   - Examples block (formatted nicely)
 *   - Constraints block
 *
 * Returns plain text (stored in DB text field, rendered via dangerouslySetInnerHTML in Task.tsx)
 */
function buildDescription(problem) {
    const { description, examples, constraints } = problem;

    // Clean the base description:
    // Remove trailing "Example 1:\nExample 2:\n..." and "Constraints:" placeholders
    let cleanDesc = description
        .replace(/Example \d+:\s*/gi, '')
        .replace(/Constraints:\s*$/i, '')
        .trim();

    let parts = [];

    // 1. Base problem statement
    if (cleanDesc) {
        parts.push(cleanDesc);
    }

    // 2. Examples block
    if (examples && examples.length > 0) {
        parts.push('');
        parts.push('---');
        parts.push('');

        examples.forEach((ex, idx) => {
            const lines = ex.example_text.split('\n').map(l => l.trim()).filter(Boolean);
            parts.push(`Example ${idx + 1}:`);
            lines.forEach(line => parts.push(line));
            parts.push('');
        });
    }

    // 3. Constraints block
    if (constraints && constraints.length > 0) {
        parts.push('Constraints:');
        constraints.forEach(c => parts.push(`• ${c}`));
    }

    return parts.join('\n').trim();
}

/**
 * Extract testCases from examples array.
 * Each example → { input, expectedOutput, isHidden: false }
 * First 2 will auto-show in the description panel (same as contest tasks).
 */
function buildTestCases(examples) {
    const testCases = [];

    for (const ex of examples) {
        const { input, expectedOutput } = parseExample(ex.example_text);

        // Only add if we could parse both input and output
        if (input && expectedOutput) {
            testCases.push({
                input,
                expectedOutput,
                isHidden: false,
                orderIndex: ex.example_num - 1
            });
        }
    }

    return testCases;
}

/**
 * Filter code_snippets to only supported languages
 */
function buildStarterCode(codeSnippets) {
    const starterCode = {};
    for (const lang of SUPPORTED_LANGUAGES) {
        if (codeSnippets[lang]) {
            starterCode[lang] = codeSnippets[lang];
        }
    }
    return starterCode;
}

/**
 * Map difficulty — ensure it matches DB enum: 'Easy' | 'Medium' | 'Hard'
 */
function normalizeDifficulty(difficulty) {
    const map = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
    return map[difficulty.toLowerCase()] || 'Medium';
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
    console.log('🚀 Starting problem seeding...\n');

    // 1. Load JSON file
    if (!fs.existsSync(JSON_FILE_PATH)) {
        console.error(`❌ JSON file not found: ${JSON_FILE_PATH}`);
        console.error('   Copy merged_problems.json to backend/scripts/ directory');
        process.exit(1);
    }

    const raw = fs.readFileSync(JSON_FILE_PATH, 'utf8');
    const data = JSON.parse(raw);
    const problems = data.questions || data; // handle both { questions: [] } and []

    console.log(`📦 Loaded ${problems.length} problems from JSON\n`);

    // 2. Connect to DB
    try {
        await pool.query('SELECT 1');
        console.log('✅ Database connected\n');
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        process.exit(1);
    }

    // 3. Fetch existing slugs to skip duplicates
    const existingResult = await pool.query('SELECT slug FROM problems');
    const existingSlugs = new Set(existingResult.rows.map(r => r.slug));
    console.log(`ℹ️  ${existingSlugs.size} problems already in DB (will skip)\n`);

    // 4. Process each problem
    let inserted = 0;
    let skipped = 0;
    let failed = 0;

    for (let i = 0; i < problems.length; i++) {
        const problem = problems[i];
        const slug = problem.problem_slug;

        // Skip if already exists
        if (existingSlugs.has(slug)) {
            skipped++;
            continue;
        }

        try {
            // Build all fields
            const description = buildDescription(problem);
            const testCases = buildTestCases(problem.examples || []);
            const starterCode = buildStarterCode(problem.code_snippets || {});
            const difficulty = normalizeDifficulty(problem.difficulty);
            const tags = problem.topics || [];

            // Insert into problems table
            await pool.query(
                `INSERT INTO problems (
          title,
          slug,
          description,
          difficulty,
          tags,
          hints,
          starter_code,
          function_signature,
          test_cases,
          max_hints_allowed,
          hint_unlock_after_submissions,
          hint_unlock_after_seconds,
          provide_last_submission_context,
          ai_hints_enabled,
          max_submissions_allowed,
          auto_submit_on_timeout,
          total_submissions,
          accepted_submissions,
          is_active,
          is_premium,
          created_by,
          created_at,
          updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, $11, $12, $13, $14, $15, $16,
          $17, $18, $19, $20, $21,
          NOW(), NOW()
        )`,
                [
                    problem.title,                        // $1  title
                    slug,                                  // $2  slug
                    description,                           // $3  description
                    difficulty,                            // $4  difficulty
                    JSON.stringify(tags),                  // $5  tags
                    JSON.stringify([]),                    // $6  hints (empty for now)
                    JSON.stringify(starterCode),           // $7  starter_code
                    null,                                  // $8  function_signature (empty)
                    JSON.stringify(testCases),             // $9  test_cases
                    3,                                     // $10 max_hints_allowed
                    0,                                     // $11 hint_unlock_after_submissions
                    0,                                     // $12 hint_unlock_after_seconds
                    true,                                  // $13 provide_last_submission_context
                    true,                                  // $14 ai_hints_enabled
                    0,                                     // $15 max_submissions_allowed (unlimited)
                    true,                                  // $16 auto_submit_on_timeout
                    0,                                     // $17 total_submissions
                    0,                                     // $18 accepted_submissions
                    true,                                  // $19 is_active
                    false,                                 // $20 is_premium
                    ADMIN_USER_ID,                         // $21 created_by
                ]
            );

            inserted++;
            const tcCount = testCases.length;
            const langCount = Object.keys(starterCode).length;
            console.log(`✅ [${i + 1}/${problems.length}] ${problem.title} | ${difficulty} | ${tcCount} test cases | ${langCount} languages`);

        } catch (err) {
            failed++;
            console.error(`❌ [${i + 1}/${problems.length}] FAILED: ${problem.title} — ${err.message}`);
        }
    }

    // 5. Summary
    console.log('\n─────────────────────────────────────────');
    console.log(`✅ Inserted : ${inserted}`);
    console.log(`⏭️  Skipped  : ${skipped} (already existed)`);
    console.log(`❌ Failed   : ${failed}`);
    console.log('─────────────────────────────────────────');
    console.log('🎉 Done!\n');

    await pool.end();
}

main().catch(err => {
    console.error('💥 Fatal error:', err);
    process.exit(1);
});
