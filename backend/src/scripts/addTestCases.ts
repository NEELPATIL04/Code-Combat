import { db } from '../config/database';
import { tasks, testCases } from '../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Add sample test cases for tasks
 * This script adds test cases for the "Two Sum" problem
 */
async function addTestCases() {
  try {
    console.log('🔍 Fetching tasks from database...');

    // Get all tasks
    const allTasks = await db.select().from(tasks);

    if (allTasks.length === 0) {
      console.log('❌ No tasks found in database. Please create a task first.');
      process.exit(1);
    }

    console.log(`✅ Found ${allTasks.length} tasks:`);
    allTasks.forEach(task => {
      console.log(`   - ID: ${task.id} | Title: ${task.title}`);
    });

    // Use the first task
    const targetTask = allTasks[0];
    console.log(`\n📝 Adding test cases for task: "${targetTask.title}" (ID: ${targetTask.id})`);

    // Check if test cases already exist
    const existingTestCases = await db
      .select()
      .from(testCases)
      .where(eq(testCases.taskId, targetTask.id));

    if (existingTestCases.length > 0) {
      console.log(`⚠️  Warning: ${existingTestCases.length} test cases already exist for this task.`);
      console.log('   Skipping to avoid duplicates.');
      process.exit(0);
    }

    // Sample test cases for a typical "Two Sum" problem
    const sampleTestCases = [
      {
        taskId: targetTask.id,
        input: '2 7 11 15\n9',
        expectedOutput: '[0,1]',
        isHidden: false,
        orderIndex: 1,
      },
      {
        taskId: targetTask.id,
        input: '3 2 4\n6',
        expectedOutput: '[1,2]',
        isHidden: false,
        orderIndex: 2,
      },
      {
        taskId: targetTask.id,
        input: '3 3\n6',
        expectedOutput: '[0,1]',
        isHidden: false,
        orderIndex: 3,
      },
      {
        taskId: targetTask.id,
        input: '-1 -2 -3 -4 -5\n-8',
        expectedOutput: '[2,4]',
        isHidden: true, // Hidden test case
        orderIndex: 4,
      },
    ];

    // Insert test cases
    console.log(`\n💾 Inserting ${sampleTestCases.length} test cases...`);

    for (const testCase of sampleTestCases) {
      await db.insert(testCases).values(testCase);
      console.log(`   ✓ Test case ${testCase.orderIndex} added (${testCase.isHidden ? 'HIDDEN' : 'VISIBLE'})`);
    }

    console.log('\n✅ All test cases added successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Task ID: ${targetTask.id}`);
    console.log(`   - Task Title: ${targetTask.title}`);
    console.log(`   - Visible Test Cases: ${sampleTestCases.filter(tc => !tc.isHidden).length}`);
    console.log(`   - Hidden Test Cases: ${sampleTestCases.filter(tc => tc.isHidden).length}`);
    console.log(`   - Total Test Cases: ${sampleTestCases.length}`);

    console.log('\n🎉 Ready to test! Navigate to the task and try running code.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding test cases:', error);
    process.exit(1);
  }
}

addTestCases();
