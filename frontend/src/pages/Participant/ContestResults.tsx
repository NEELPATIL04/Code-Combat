import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, CheckCircle2, XCircle, Clock, Code, Lightbulb, Target, TrendingUp, Award, Home, Calendar, BarChart3, Zap, CheckCheck } from 'lucide-react';
import { contestAPI, userAPI } from '../../utils/api';
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
  timeTaken?: number; // in seconds
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
        navigate('/player', { replace: true });
        return;
      }

      try {
        const resultsResponse = await fetch(`/api/contests/${contestId}/results`, {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
          },
        });

        if (resultsResponse.ok) {
          const data = await resultsResponse.json();
          setContest(data.contest);
          setResults(data.results);
        } else {
          // Fallback: use getUserContestDetails API for contests without formal results
          const detailData = await userAPI.getContestDetails(parseInt(contestId));
          const contestInfo = detailData.contest;
          const tasks = detailData.tasks || [];

          // Build a ContestResultData-compatible object from the fallback data
          const totalScore = tasks.reduce((sum: number, t: any) => sum + (t.score || 0), 0);
          const totalPossible = tasks.reduce((sum: number, t: any) => sum + (t.maxPoints || 0), 0);
          const completed = tasks.filter((t: any) => t.status === 'accepted').length;

          setContest({
            id: parseInt(contestId),
            title: contestInfo.title,
            difficulty: contestInfo.difficulty,
            duration: 0,
          });

          setResults({
            id: 0,
            contestId: parseInt(contestId),
            userId: 0,
            totalScore,
            totalPossibleScore: totalPossible,
            percentageScore: totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0,
            tasksCompleted: completed,
            totalTasks: tasks.length,
            completionPercentage: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
            taskResults: tasks.map((t: any) => ({
              taskId: t.taskId,
              title: t.taskTitle,
              completed: t.status === 'accepted',
              submissions: 0,
              aiHintsUsed: t.hintsUsed || 0,
              solutionUnlocked: t.solutionUsed || false,
              testCasesPassed: t.passedTests || 0,
              totalTestCases: t.totalTests || 0,
              score: t.score || 0,
              maxPoints: t.maxPoints || 0,
            })),
            startedAt: contestInfo.startedAt || new Date().toISOString(),
            completedAt: contestInfo.completedAt || new Date().toISOString(),
            timeTaken: 0,
          });
        }
      } catch (error) {
        console.error('Error fetching contest results:', error);
        showToast('Failed to load contest results', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [contestId, navigate, showToast]);

  // Prevent back navigation - redirect to dashboard instead
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      navigate('/player', { replace: true });
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

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
      background: '#09090b',
      padding: '60px 20px'
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Celebration Header */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: 24,
          padding: '50px 40px',
          marginBottom: 40,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              width: 100,
              height: 100,
              margin: '0 auto 24px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)'
            }}>
              <Trophy size={56} color="#fff" />
            </div>
            <h1 style={{
              color: '#fff',
              fontSize: 48,
              marginBottom: 12,
              fontWeight: 700,
              letterSpacing: '-0.02em'
            }}>
              Contest Completed!
            </h1>
            <h2 style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: 24,
              marginBottom: 24,
              fontWeight: 500
            }}>
              {contest.title}
            </h2>
            <div style={{
              display: 'flex',
              gap: 16,
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: 12,
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: getDifficultyColor(contest.difficulty)
                }} />
                <span style={{
                  color: getDifficultyColor(contest.difficulty),
                  fontSize: 15,
                  fontWeight: 600,
                  textTransform: 'capitalize'
                }}>
                  {contest.difficulty}
                </span>
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: 12,
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <Clock size={18} color="rgba(255, 255, 255, 0.7)" />
                <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 15, fontWeight: 500 }}>
                  {formatTime(results.timeTaken || 0)}
                </span>
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: 12,
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <Calendar size={18} color="rgba(255, 255, 255, 0.7)" />
                <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 15, fontWeight: 500 }}>
                  {new Date(results.completedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Overview Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24,
          marginBottom: 40
        }}>
          {/* Total Score Card */}
          <div style={{
            background: '#18181b',
            border: '1px solid #27272a',
            borderRadius: 20,
            padding: 32,
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 120,
              height: 120,
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                width: 56,
                height: 56,
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20
              }}>
                <Award size={28} color="#3b82f6" />
              </div>
              <h3 style={{
                color: '#71717a',
                fontSize: 13,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 12
              }}>
                Total Score
              </h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                <span style={{
                  color: getScoreColor(results.percentageScore),
                  fontSize: 42,
                  fontWeight: 700,
                  lineHeight: 1
                }}>
                  {results.totalScore}
                </span>
                <span style={{ color: '#52525b', fontSize: 20, fontWeight: 500 }}>
                  / {results.totalPossibleScore}
                </span>
              </div>
              <div style={{
                width: '100%',
                height: 8,
                background: '#27272a',
                borderRadius: 4,
                overflow: 'hidden',
                marginBottom: 8
              }}>
                <div style={{
                  width: `${results.percentageScore}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${getScoreColor(results.percentageScore)}, ${getScoreColor(results.percentageScore)}dd)`,
                  transition: 'width 1s ease-out'
                }} />
              </div>
              <p style={{ color: '#a1a1aa', fontSize: 14, fontWeight: 500 }}>
                {results.percentageScore}% Achievement
              </p>
            </div>
          </div>

          {/* Tasks Completed Card */}
          <div style={{
            background: '#18181b',
            border: '1px solid #27272a',
            borderRadius: 20,
            padding: 32,
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 120,
              height: 120,
              background: 'radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%)',
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                width: 56,
                height: 56,
                background: 'rgba(34, 197, 94, 0.1)',
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20
              }}>
                <Target size={28} color="#22c55e" />
              </div>
              <h3 style={{
                color: '#71717a',
                fontSize: 13,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 12
              }}>
                Tasks Completed
              </h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                <span style={{ color: '#22c55e', fontSize: 42, fontWeight: 700, lineHeight: 1 }}>
                  {results.tasksCompleted}
                </span>
                <span style={{ color: '#52525b', fontSize: 20, fontWeight: 500 }}>
                  / {results.totalTasks}
                </span>
              </div>
              <div style={{
                width: '100%',
                height: 8,
                background: '#27272a',
                borderRadius: 4,
                overflow: 'hidden',
                marginBottom: 8
              }}>
                <div style={{
                  width: `${results.completionPercentage}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #22c55e, #22c55edd)',
                  transition: 'width 1s ease-out'
                }} />
              </div>
              <p style={{ color: '#a1a1aa', fontSize: 14, fontWeight: 500 }}>
                {results.completionPercentage}% Completion Rate
              </p>
            </div>
          </div>

          {/* Total Submissions Card */}
          <div style={{
            background: '#18181b',
            border: '1px solid #27272a',
            borderRadius: 20,
            padding: 32,
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 120,
              height: 120,
              background: 'radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%)',
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                width: 56,
                height: 56,
                background: 'rgba(245, 158, 11, 0.1)',
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20
              }}>
                <Code size={28} color="#f59e0b" />
              </div>
              <h3 style={{
                color: '#71717a',
                fontSize: 13,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 12
              }}>
                Total Submissions
              </h3>
              <div style={{ marginBottom: 8 }}>
                <span style={{ color: '#f59e0b', fontSize: 42, fontWeight: 700, lineHeight: 1 }}>
                  {results.taskResults.reduce((sum, task) => sum + task.submissions, 0)}
                </span>
              </div>
              <p style={{ color: '#a1a1aa', fontSize: 14, fontWeight: 500 }}>
                Across all tasks
              </p>
            </div>
          </div>

          {/* AI Assistance Card */}
          <div style={{
            background: '#18181b',
            border: '1px solid #27272a',
            borderRadius: 20,
            padding: 32,
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 120,
              height: 120,
              background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)',
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                width: 56,
                height: 56,
                background: 'rgba(168, 85, 247, 0.1)',
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20
              }}>
                <Lightbulb size={28} color="#a855f7" />
              </div>
              <h3 style={{
                color: '#71717a',
                fontSize: 13,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 12
              }}>
                AI Assistance
              </h3>
              <div style={{ marginBottom: 8 }}>
                <span style={{ color: '#a855f7', fontSize: 42, fontWeight: 700, lineHeight: 1 }}>
                  {results.taskResults.reduce((sum, task) => sum + task.aiHintsUsed, 0)}
                </span>
              </div>
              <p style={{ color: '#a1a1aa', fontSize: 14, fontWeight: 500 }}>
                Hints requested
              </p>
            </div>
          </div>
        </div>

        {/* Task Results Section */}
        <div style={{
          background: '#18181b',
          border: '1px solid #27272a',
          borderRadius: 24,
          padding: 40,
          marginBottom: 40
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 32,
            paddingBottom: 24,
            borderBottom: '1px solid #27272a'
          }}>
            <div style={{
              width: 48,
              height: 48,
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BarChart3 size={24} color="#3b82f6" />
            </div>
            <div>
              <h2 style={{
                color: '#fafafa',
                fontSize: 28,
                fontWeight: 700,
                marginBottom: 4
              }}>
                Task Performance
              </h2>
              <p style={{ color: '#71717a', fontSize: 14 }}>
                Detailed breakdown of your performance on each task
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {results.taskResults.map((task, index) => {
              const passPercentage = task.totalTestCases > 0 
                ? Math.round((task.testCasesPassed / task.totalTestCases) * 100) 
                : 0;
              const scorePercentage = task.maxPoints > 0
                ? Math.round((task.score / task.maxPoints) * 100)
                : 0;

              return (
                <div
                  key={task.taskId}
                  style={{
                    background: '#09090b',
                    border: `1px solid ${task.completed ? 'rgba(34, 197, 94, 0.2)' : '#27272a'}`,
                    borderRadius: 16,
                    padding: 28,
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Task Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 24,
                    gap: 20
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <div style={{
                          width: 32,
                          height: 32,
                          background: task.completed ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          borderRadius: 8,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {task.completed ? (
                            <CheckCircle2 size={20} color="#22c55e" />
                          ) : (
                            <XCircle size={20} color="#ef4444" />
                          )}
                        </div>
                        <h3 style={{
                          color: '#fafafa',
                          fontSize: 20,
                          fontWeight: 600,
                          margin: 0
                        }}>
                          Task {index + 1}: {task.title}
                        </h3>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '4px 12px',
                          background: task.completed ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          borderRadius: 6,
                          color: task.completed ? '#22c55e' : '#ef4444',
                          fontSize: 13,
                          fontWeight: 600
                        }}>
                          {task.completed ? 'Completed' : 'Incomplete'}
                        </span>
                        {task.solutionUnlocked && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '4px 12px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            borderRadius: 6,
                            color: '#ef4444',
                            fontSize: 13,
                            fontWeight: 600
                          }}>
                            Solution Used
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Score Badge */}
                    <div style={{
                      textAlign: 'right',
                      padding: '16px 24px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: 12,
                      border: '1px solid #27272a'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                        <span style={{
                          color: getScoreColor(scorePercentage),
                          fontSize: 32,
                          fontWeight: 700,
                          lineHeight: 1
                        }}>
                          {task.score}
                        </span>
                        <span style={{ color: '#52525b', fontSize: 16, fontWeight: 500 }}>
                          /{task.maxPoints}
                        </span>
                      </div>
                      <p style={{
                        color: getScoreColor(scorePercentage),
                        fontSize: 13,
                        fontWeight: 600,
                        margin: 0
                      }}>
                        {scorePercentage}% Score
                      </p>
                    </div>
                  </div>

                  {/* Test Cases Progress */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 8
                    }}>
                      <span style={{ color: '#a1a1aa', fontSize: 13, fontWeight: 600 }}>
                        Test Cases Passed
                      </span>
                      <span style={{ color: '#fafafa', fontSize: 14, fontWeight: 600 }}>
                        {task.testCasesPassed} / {task.totalTestCases} ({passPercentage}%)
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: 10,
                      background: '#27272a',
                      borderRadius: 5,
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${passPercentage}%`,
                        height: '100%',
                        background: passPercentage === 100 
                          ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                          : passPercentage >= 50
                          ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                          : 'linear-gradient(90deg, #ef4444, #dc2626)',
                        transition: 'width 1s ease-out'
                      }} />
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: 16
                  }}>
                    <div style={{
                      padding: 16,
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: 10,
                      border: '1px solid #27272a'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <Code size={16} color="#71717a" />
                        <span style={{ color: '#71717a', fontSize: 12, fontWeight: 600 }}>
                          Submissions
                        </span>
                      </div>
                      <p style={{ color: '#fafafa', fontSize: 22, fontWeight: 700, margin: 0 }}>
                        {task.submissions}
                      </p>
                    </div>

                    <div style={{
                      padding: 16,
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: 10,
                      border: '1px solid #27272a'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <CheckCheck size={16} color="#71717a" />
                        <span style={{ color: '#71717a', fontSize: 12, fontWeight: 600 }}>
                          Passed
                        </span>
                      </div>
                      <p style={{ color: '#fafafa', fontSize: 22, fontWeight: 700, margin: 0 }}>
                        {task.testCasesPassed}/{task.totalTestCases}
                      </p>
                    </div>

                    <div style={{
                      padding: 16,
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: 10,
                      border: '1px solid #27272a'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <Lightbulb size={16} color="#71717a" />
                        <span style={{ color: '#71717a', fontSize: 12, fontWeight: 600 }}>
                          Hints Used
                        </span>
                      </div>
                      <p style={{ color: '#fafafa', fontSize: 22, fontWeight: 700, margin: 0 }}>
                        {task.aiHintsUsed}
                      </p>
                    </div>

                    <div style={{
                      padding: 16,
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: 10,
                      border: '1px solid #27272a'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <Zap size={16} color="#71717a" />
                        <span style={{ color: '#71717a', fontSize: 12, fontWeight: 600 }}>
                          Points
                        </span>
                      </div>
                      <p style={{
                        color: getScoreColor(scorePercentage),
                        fontSize: 22,
                        fontWeight: 700,
                        margin: 0
                      }}>
                        {task.score}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/player', { replace: true })}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '18px 40px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              border: 'none',
              borderRadius: 14,
              color: '#fff',
              fontSize: 17,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.3)';
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
