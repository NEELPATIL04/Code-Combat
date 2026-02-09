import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, CheckCircle2, XCircle, Clock, Code, Lightbulb, Target, TrendingUp, Award, Home } from 'lucide-react';
import { contestAPI } from '../../utils/api';
import { useToast } from '../../components/Toast/ToastProvider';

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

interface Contest {
  id: number;
  title: string;
  difficulty: string;
  duration: number;
}

const ContestResults: React.FC = () => {
  const { contestId } = useParams<{ contestId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [contest, setContest] = useState<Contest | null>(null);
  const [results, setResults] = useState<ContestResultData | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!contestId) {
        showToast('Invalid contest ID', 'error');
        navigate('/participant/dashboard');
        return;
      }

      try {
        const response = await contestAPI.getById(parseInt(contestId));
        const resultsResponse = await fetch(`/api/contests/${contestId}/results`, {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
          },
        });

        if (!resultsResponse.ok) {
          throw new Error('Failed to fetch results');
        }

        const data = await resultsResponse.json();
        setContest(data.contest);
        setResults(data.results);
      } catch (error) {
        console.error('Error fetching contest results:', error);
        showToast('Failed to load contest results', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [contestId, navigate, showToast]);

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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return '#22c55e';
      case 'medium':
        return '#f59e0b';
      case 'hard':
        return '#ef4444';
      default:
        return '#6b7280';
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
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{
            width: 60,
            height: 60,
            border: '4px solid rgba(255, 255, 255, 0.1)',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ fontSize: 18, opacity: 0.8 }}>Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!results || !contest) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: 40,
          borderRadius: 16,
          textAlign: 'center',
          maxWidth: 500
        }}>
          <XCircle size={60} color="#ef4444" style={{ margin: '0 auto 20px' }} />
          <h2 style={{ color: '#fff', marginBottom: 10 }}>Results Not Found</h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: 30 }}>
            Contest results are not available yet. Please complete the contest first.
          </p>
          <button
            onClick={() => navigate('/participant/dashboard')}
            style={{
              padding: '12px 24px',
              background: '#3b82f6',
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              fontSize: 16,
              cursor: 'pointer'
            }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: 20,
          padding: 40,
          marginBottom: 30,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center'
        }}>
          <Trophy size={80} color="#fbbf24" style={{ margin: '0 auto 20px' }} />
          <h1 style={{ color: '#fff', fontSize: 42, marginBottom: 10, fontWeight: 700 }}>
            Contest Completed!
          </h1>
          <h2 style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 28, marginBottom: 20, fontWeight: 500 }}>
            {contest.title}
          </h2>
          <div style={{ display: 'flex', gap: 15, justifyContent: 'center', flexWrap: 'wrap' }}>
            <span style={{
              padding: '8px 16px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 20,
              color: getDifficultyColor(contest.difficulty),
              fontSize: 14,
              fontWeight: 600
            }}>
              {contest.difficulty}
            </span>
            <span style={{
              padding: '8px 16px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 20,
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <Clock size={16} />
              {formatTime(results.timeTaken || 0)}
            </span>
          </div>
        </div>

        {/* Overall Statistics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 20,
          marginBottom: 30
        }}>
          {/* Total Score */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: 16,
            padding: 30,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center'
          }}>
            <Award size={40} color="#3b82f6" style={{ margin: '0 auto 15px' }} />
            <h3 style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
              Total Score
            </h3>
            <p style={{
              color: getScoreColor(results.percentageScore),
              fontSize: 36,
              fontWeight: 700,
              marginBottom: 5
            }}>
              {results.totalScore}
            </p>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 14 }}>
              out of {results.totalPossibleScore} ({results.percentageScore}%)
            </p>
          </div>

          {/* Tasks Completed */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: 16,
            padding: 30,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center'
          }}>
            <Target size={40} color="#22c55e" style={{ margin: '0 auto 15px' }} />
            <h3 style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
              Tasks Completed
            </h3>
            <p style={{ color: '#22c55e', fontSize: 36, fontWeight: 700, marginBottom: 5 }}>
              {results.tasksCompleted}
            </p>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 14 }}>
              out of {results.totalTasks} ({results.completionPercentage}%)
            </p>
          </div>

          {/* Total Submissions */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: 16,
            padding: 30,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center'
          }}>
            <Code size={40} color="#f59e0b" style={{ margin: '0 auto 15px' }} />
            <h3 style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
              Total Submissions
            </h3>
            <p style={{ color: '#f59e0b', fontSize: 36, fontWeight: 700, marginBottom: 5 }}>
              {results.taskResults.reduce((sum, task) => sum + task.submissions, 0)}
            </p>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 14 }}>
              Across all tasks
            </p>
          </div>

          {/* AI Hints Used */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: 16,
            padding: 30,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center'
          }}>
            <Lightbulb size={40} color="#a855f7" style={{ margin: '0 auto 15px' }} />
            <h3 style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
              AI Hints Used
            </h3>
            <p style={{ color: '#a855f7', fontSize: 36, fontWeight: 700, marginBottom: 5 }}>
              {results.taskResults.reduce((sum, task) => sum + task.aiHintsUsed, 0)}
            </p>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 14 }}>
              Total hints requested
            </p>
          </div>
        </div>

        {/* Task-by-Task Breakdown */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: 20,
          padding: 40,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: 30
        }}>
          <h2 style={{
            color: '#fff',
            fontSize: 28,
            marginBottom: 30,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <TrendingUp size={32} />
            Task-by-Task Breakdown
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {results.taskResults.map((task, index) => (
              <div
                key={task.taskId}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 12,
                  padding: 24,
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  transition: 'all 0.3s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      {task.completed ? (
                        <CheckCircle2 size={24} color="#22c55e" />
                      ) : (
                        <XCircle size={20} color="#ef4444" />
                      )}
                      <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 600 }}>
                        Task {index + 1}: {task.title}
                      </h3>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{
                      color: getScoreColor((task.score / task.maxPoints) * 100),
                      fontSize: 24,
                      fontWeight: 700
                    }}>
                      {task.score}/{task.maxPoints}
                    </p>
                    <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>
                      {Math.round((task.score / task.maxPoints) * 100)}% Score
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: 15,
                  marginTop: 15
                }}>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: 15,
                    borderRadius: 8
                  }}>
                    <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 12, marginBottom: 5 }}>
                      Test Cases
                    </p>
                    <p style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>
                      {task.testCasesPassed}/{task.totalTestCases}
                    </p>
                  </div>

                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: 15,
                    borderRadius: 8
                  }}>
                    <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 12, marginBottom: 5 }}>
                      Submissions
                    </p>
                    <p style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>
                      {task.submissions}
                    </p>
                  </div>

                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: 15,
                    borderRadius: 8
                  }}>
                    <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 12, marginBottom: 5 }}>
                      AI Hints Used
                    </p>
                    <p style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>
                      {task.aiHintsUsed}
                    </p>
                  </div>

                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: 15,
                    borderRadius: 8
                  }}>
                    <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 12, marginBottom: 5 }}>
                      Solution Used
                    </p>
                    <p style={{ color: task.solutionUnlocked ? '#ef4444' : '#22c55e', fontSize: 18, fontWeight: 600 }}>
                      {task.solutionUnlocked ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/participant/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '16px 32px',
              background: '#3b82f6',
              border: 'none',
              borderRadius: 12,
              color: '#fff',
              fontSize: 18,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#2563eb';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#3b82f6';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Home size={20} />
            Go to Dashboard
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default ContestResults;
