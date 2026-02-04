import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Send, XCircle, Clock } from 'lucide-react';
import './Task.css';

const TaskPage: React.FC = () => {
    const navigate = useNavigate();
    const [time, setTime] = useState<number>(45 * 60 + 22);

    useEffect(() => {
        const interval = setInterval(() => setTime(prev => prev > 0 ? prev - 1 : 0), 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds: number): string => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="task-page">
            <nav className="nav">
                <div className="nav-inner">
                    <a href="/" className="nav-logo">
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                            <circle cx="14" cy="14" r="12" stroke="url(#logoGrad3)" strokeWidth="1.5" />
                            <circle cx="14" cy="14" r="5" fill="url(#logoGrad3)" />
                            <defs><linearGradient id="logoGrad3" x1="0" y1="0" x2="28" y2="28"><stop offset="0%" stopColor="#FDE68A" /><stop offset="100%" stopColor="#F59E0B" /></linearGradient></defs>
                        </svg>
                        <span>Code Combat</span>
                    </a>
                    <div className="nav-right">
                        <span className="challenge-name">Binary Search Challenge</span>
                        <div className="timer"><Clock size={16} />{formatTime(time)}</div>
                        <button className="abort-btn" onClick={() => navigate('/')}><XCircle size={16} /> Abort</button>
                    </div>
                </div>
            </nav>

            <div className="task-content">
                <div className="problem-section">
                    <div className="section-header">
                        <span className="difficulty-badge">Medium</span>
                        <h1>Binary Search</h1>
                    </div>
                    <div className="problem-body">
                        <p className="description">Implement a function that performs a binary search on a sorted array of integers.</p>
                        <div className="example-block"><h3>Input</h3><code>nums = [-1, 0, 3, 5, 9, 12], target = 9</code></div>
                        <div className="example-block"><h3>Output</h3><code>4</code></div>
                        <div className="example-block"><h3>Constraints</h3><code>1 ≤ nums.length ≤ 10⁴</code></div>
                    </div>
                </div>

                <div className="editor-section">
                    <div className="editor-header"><span className="file-tab active">solution.ts</span></div>
                    <div className="editor-body">
                        <div className="line-numbers">{Array.from({ length: 12 }, (_, i) => <div key={i}>{i + 1}</div>)}</div>
                        <div className="code-area">
                            <span className="keyword">function</span> <span className="function">search</span>(nums: <span className="keyword">number</span>[], target: <span className="keyword">number</span>): <span className="keyword">number</span> {'{'}<br />
                            &nbsp;&nbsp;<span className="comment">// Write your code here</span><br />
                            &nbsp;&nbsp;<span className="keyword">let</span> left = <span className="number">0</span>;<br />
                            &nbsp;&nbsp;<span className="keyword">let</span> right = nums.length - <span className="number">1</span>;<br />
                            &nbsp;&nbsp;<br />
                            &nbsp;&nbsp;<span className="keyword">while</span> (left {'<='} right) {'{'}<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;<span className="comment">// Your logic</span><br />
                            &nbsp;&nbsp;{'}'}<br />
                            &nbsp;&nbsp;<br />
                            &nbsp;&nbsp;<span className="keyword">return</span> -<span className="number">1</span>;<br />
                            {'}'}
                        </div>
                    </div>
                    <div className="editor-footer">
                        <button className="run-btn"><Play size={16} /> Run Tests</button>
                        <button className="submit-btn"><Send size={16} /> Submit</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskPage;
