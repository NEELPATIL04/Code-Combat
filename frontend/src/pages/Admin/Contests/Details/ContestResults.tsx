import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Trophy, CheckCircle2, XCircle, Code, Lightbulb, Target, Award, User, Clock } from 'lucide-react';
import { contestAPI } from '../../../../utils/api';

interface TaskResult {
  taskId: number;
  title: string;
  completed: boolean;
  submissions: number;
  aiHintsUsed: number;
  solutionUnlocked: boolean;
  testCasesPassed: number;
  totalTestCases: number;
  score: number;
  maxPoints: number;
  bestSubmissionId?: number;
}

interface ContestResultData {
  id: number;
  contestId: number;
  userId: number;
  totalScore: number;
  totalPossibleScore: number;
  percentageScore: number;
  tasksCompleted: number;
  totalTasks: number;
  completionPercentage: number;
  taskResults: TaskResult[];
  startedAt: string;
  completedAt: string;
  timeTaken: number;
}

interface UserInfo {
  id: number;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

interface Contest {
  id: number;
  title: string;
  difficulty: string;
  duration: number;
}

interface ParticipantResultsProps {
  userId: number;
  contestId: number;
}

const ParticipantResults: React.FC<ParticipantResultsProps> = ({ userId, contestId }) => {
  const [loading, setLoading] = useState(true);
  const [contest, setContest] = useState<Contest | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [results, setResults] = useState<ContestResultData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await contestAPI.getContestResultsByUser(contestId, userId);
        setContest(response.contest);
        setUserInfo(response.user);
        setResults(response.results);
      } catch (error: any) {
        console.error('Error fetching contest results:', error);
        setError(error.message || 'Failed to load contest results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [contestId, userId]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return '#22c55e';
    if (percentage >= 60) return '#f59e0b';
    if (percentage >= 40) return '#f97316';
    return '#ef4444';
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Loading results...</p>
      </div>
    );
  }

  if (error || !results || !contest || !userInfo) {
    return (
      <div style={{
        padding: 40,
        textAlign: 'center',
        background: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 12,
        border: '1px solid rgba(239, 68, 68, 0.3)'
      }}>
        <XCircle size={48} color="#ef4444" style={{ margin: '0 auto 15px' }} />
        <p style={{ color: '#ef4444', fontSize: 16, marginBottom: 8 }}>
          {error || 'Results not available'}
        </p>
        <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 14 }}>
          This user has not completed the contest yet.
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: 'rgba(255, 255, 255, 0.02)', borderRadius: 16, padding: 30, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
      {/* User Info Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 12,
        padding: 20,
        marginBottom: 30,
        display: 'flex',
        alignItems: 'center',
        gap: 20
      }}>
        <div style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <User size={30} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ color: '#fff', fontSize: 20, marginBottom: 5, fontWeight: 600 }}>
            {userInfo.firstName && userInfo.lastName
              ? `${userInfo.firstName} ${userInfo.lastName}`
              : userInfo.username}
          </h3>
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 14 }}>
            {userInfo.email} • @{userInfo.username}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12, marginBottom: 5 }}>Time Taken</p>
          <p style={{ color: '#fff', fontSize: 18, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={18} />
            {formatTime(results.timeTaken || 0)}
          </p>
        </div>
      </div>

      {/* Overall Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 20,
        marginBottom: 30
      }}>
        {/* Total Score */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: 12,
          padding: 20,
          textAlign: 'center'
        }}>
          <Award size={32} color="#3b82f6" style={{ margin: '0 auto 10px' }} />
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12, marginBottom: 5, textTransform: 'uppercase' }}>
            Total Score
          </p>
          <p style={{
            color: getScoreColor(results.percentageScore),
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 3
          }}>
            {results.totalScore}
          </p>
          <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 12 }}>
            out of {results.totalPossibleScore} ({results.percentageScore}%)
          </p>
        </div>

        {/* Tasks Completed */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: 12,
          padding: 20,
          textAlign: 'center'
        }}>
          <Target size={32} color="#22c55e" style={{ margin: '0 auto 10px' }} />
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12, marginBottom: 5, textTransform: 'uppercase' }}>
            Tasks Completed
          </p>
          <p style={{ color: '#22c55e', fontSize: 28, fontWeight: 700, marginBottom: 3 }}>
            {results.tasksCompleted}
          </p>
          <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 12 }}>
            out of {results.totalTasks} ({results.completionPercentage}%)
          </p>
        </div>

        {/* Total Submissions */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: 12,
          padding: 20,
          textAlign: 'center'
        }}>
          <Code size={32} color="#f59e0b" style={{ margin: '0 auto 10px' }} />
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12, marginBottom: 5, textTransform: 'uppercase' }}>
            Submissions
          </p>
          <p style={{ color: '#f59e0b', fontSize: 28, fontWeight: 700, marginBottom: 3 }}>
            {results.taskResults.reduce((sum, task) => sum + task.submissions, 0)}
          </p>
          <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 12 }}>
            Total attempts
          </p>
        </div>

        {/* AI Hints Used */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: 12,
          padding: 20,
          textAlign: 'center'
        }}>
          <Lightbulb size={32} color="#a855f7" style={{ margin: '0 auto 10px' }} />
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12, marginBottom: 5, textTransform: 'uppercase' }}>
            AI Hints Used
          </p>
          <p style={{ color: '#a855f7', fontSize: 28, fontWeight: 700, marginBottom: 3 }}>
            {results.taskResults.reduce((sum, task) => sum + task.aiHintsUsed, 0)}
          </p>
          <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 12 }}>
            Total hints
          </p>
        </div>
      </div>

      {/* Task-by-Task Breakdown */}
      <div>
        <h3 style={{ color: '#fff', fontSize: 18, marginBottom: 20, fontWeight: 600 }}>
          Task-by-Task Breakdown
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          {results.taskResults.map((task, index) => (
            <div
              key={task.taskId}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 10,
                padding: 18,
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {task.completed ? (
                    <CheckCircle2 size={20} color="#22c55e" />
                  ) : (
                    <XCircle size={18} color="#ef4444" />
                  )}
                  <h4 style={{ color: '#fff', fontSize: 16, fontWeight: 500 }}>
                    Task {index + 1}: {task.title}
                  </h4>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{
                    color: getScoreColor((task.score / task.maxPoints) * 100),
                    fontSize: 20,
                    fontWeight: 700
                  }}>
                    {task.score}/{task.maxPoints}
                  </p>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: 12
              }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 12, borderRadius: 6 }}>
                  <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 11, marginBottom: 3 }}>
                    Test Cases
                  </p>
                  <p style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>
                    {task.testCasesPassed}/{task.totalTestCases}
                  </p>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 12, borderRadius: 6 }}>
                  <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 11, marginBottom: 3 }}>
                    Submissions
                  </p>
                  <p style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>
                    {task.submissions}
                  </p>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 12, borderRadius: 6 }}>
                  <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 11, marginBottom: 3 }}>
                    AI Hints
                  </p>
                  <p style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>
                    {task.aiHintsUsed}
                  </p>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 12, borderRadius: 6 }}>
                  <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 11, marginBottom: 3 }}>
                    Solution Used
                  </p>
                  <p style={{ color: task.solutionUnlocked ? '#ef4444' : '#22c55e', fontSize: 16, fontWeight: 600 }}>
                    {task.solutionUnlocked ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParticipantResults;
