import { useNavigate } from 'react-router-dom';
import './Task.css';

const TaskPage = () => {
    const navigate = useNavigate();

    return (
        <div className="task-container">
            <header className="task-header">
                <div className="header-left">
                    <span className="brand">CODE COMBAT</span>
                    <span className="divider">/</span>
                    <span className="current-task">Challenge: Binary_Search_V2</span>
                </div>
                <div className="header-right">
                    <span className="timer">00:45:22</span>
                    <button onClick={() => navigate('/')} className="exit-btn">ABORT</button>
                </div>
            </header>

            <div className="task-layout">
                <div className="problem-pane">
                    <div className="pane-header">PROBLEM STATEMENT</div>
                    <div className="pane-content">
                        <h1>Binary Search</h1>
                        <p>Implement a function that performs a binary search on a sorted array of integers.</p>

                        <h3>Input Format</h3>
                        <code>nums = [-1,0,3,5,9,12], target = 9</code>

                        <h3>Output Format</h3>
                        <code>4</code>

                        <h3>Constraints</h3>
                        <code>1 {"<="} nums.length {"<="} 10^4</code>
                    </div>
                </div>

                <div className="editor-pane">
                    <div className="pane-header">SOLUTION.JS</div>
                    <div className="editor-area">
                        <div className="line-numbers">
                            {Array.from({ length: 15 }, (_, i) => <div key={i}>{i + 1}</div>)}
                        </div>
                        <div className="code-content">
                            <span className="keyword">function</span> <span className="function">search</span>(nums, target) {'{'}<br />
                            &nbsp;&nbsp;<span className="comment">// Write your code here</span><br />
                            &nbsp;&nbsp;<span className="keyword">return</span> -1;<br />
                            {'}'}
                        </div>
                    </div>
                    <div className="editor-footer">
                        <button className="run-btn">RUN TESTS</button>
                        <button className="submit-btn">SUBMIT</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskPage;
