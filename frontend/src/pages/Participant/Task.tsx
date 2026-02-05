import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Send, XCircle, Clock } from 'lucide-react';

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
        <div className="min-h-screen bg-black text-white font-sans">
            <nav className="fixed top-0 left-0 right-0 z-[100] py-4 px-8 bg-black/80 backdrop-blur-[20px] border-b border-white/[0.08]">
                <div className="flex justify-between items-center text-white font-sans">
                    <a href="/" className="flex items-center gap-2.5 no-underline text-white font-semibold">
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                            <circle cx="14" cy="14" r="12" stroke="url(#logoGrad3)" strokeWidth="1.5" />
                            <circle cx="14" cy="14" r="5" fill="url(#logoGrad3)" />
                            <defs><linearGradient id="logoGrad3" x1="0" y1="0" x2="28" y2="28"><stop offset="0%" stopColor="#FDE68A" /><stop offset="100%" stopColor="#F59E0B" /></linearGradient></defs>
                        </svg>
                        <span className="bg-gradient-to-r from-yellow-200 to-amber-500 bg-clip-text text-transparent">Code Combat</span>
                    </a>
                    <div className="flex items-center gap-5 text-white font-sans">
                        <span className="text-white/70 text-[0.95rem]">Binary Search Challenge</span>
                        <div className="flex items-center gap-2 text-[1.1rem] font-semibold text-yellow-200 font-mono">
                            <Clock size={16} />{formatTime(time)}
                        </div>
                        <button
                            className="flex items-center gap-1.5 py-2 px-4 bg-red-500/10 border border-red-500/30 text-red-500 rounded-full font-inherit text-[0.9rem] cursor-pointer transition-all duration-200 hover:bg-red-500/20"
                            onClick={() => navigate('/')}
                        >
                            <XCircle size={16} /> Abort
                        </button>
                    </div>
                </div>
            </nav>

            <div className="relative z-[1] grid grid-cols-2 gap-6 pt-[88px] px-8 pb-8 h-screen box-border">
                <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl overflow-hidden flex flex-col text-white font-sans">
                    <div className="py-5 px-6 border-b border-white/[0.08] flex items-center gap-4">
                        <span className="py-1 px-3 bg-amber-500/15 text-amber-500 rounded-full text-xs font-medium">Medium</span>
                        <h1 className="m-0 text-[1.3rem] font-medium text-white">Binary Search</h1>
                    </div>
                    <div className="p-6 overflow-y-auto flex-1">
                        <p className="text-white/70 leading-[1.7] mb-6">Implement a function that performs a binary search on a sorted array of integers.</p>
                        <div className="mb-5 text-white font-sans">
                            <h3 className="text-xs text-white/50 uppercase tracking-wider mb-2 font-sans font-normal">Input</h3>
                            <code className="block py-3 px-4 bg-white/[0.03] border border-white/[0.06] rounded-lg font-mono text-[0.9rem] text-white">nums = [-1, 0, 3, 5, 9, 12], target = 9</code>
                        </div>
                        <div className="mb-5 text-white font-sans">
                            <h3 className="text-xs text-white/50 uppercase tracking-wider mb-2 font-sans font-normal">Output</h3>
                            <code className="block py-3 px-4 bg-white/[0.03] border border-white/[0.06] rounded-lg font-mono text-[0.9rem] text-white">4</code>
                        </div>
                        <div className="mb-5 text-white font-sans">
                            <h3 className="text-xs text-white/50 uppercase tracking-wider mb-2 font-sans font-normal">Constraints</h3>
                            <code className="block py-3 px-4 bg-white/[0.03] border border-white/[0.06] rounded-lg font-mono text-[0.9rem] text-white">1 ≤ nums.length ≤ 10⁴</code>
                        </div>
                    </div>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl overflow-hidden flex flex-col text-white font-sans">
                    <div className="py-3 px-4 border-b border-white/[0.08] flex items-center">
                        <span className="py-2 px-4 bg-yellow-200/10 text-yellow-200 rounded-lg text-[0.85rem]">solution.ts</span>
                    </div>
                    <div className="flex-1 flex overflow-auto p-4 text-white font-sans">
                        <div className="w-10 text-right pr-4 border-r border-white/[0.06] mr-4 text-white/30 font-mono text-[0.9rem] leading-[1.6]">
                            {Array.from({ length: 12 }, (_, i) => <div key={i}>{i + 1}</div>)}
                        </div>
                        <div className="flex-1 font-mono text-[0.9rem] leading-[1.6] text-white/80">
                            <span className="text-[#c792ea]">function</span> <span className="text-[#82aaff]">search</span>(nums: <span className="text-[#c792ea]">number</span>[], target: <span className="text-[#c792ea]">number</span>): <span className="text-[#c792ea]">number</span> {'{'}<br />
                            &nbsp;&nbsp;<span className="text-[#546e7a]">// Write your code here</span><br />
                            &nbsp;&nbsp;<span className="text-[#c792ea]">let</span> left = <span className="text-[#f78c6c]">0</span>;<br />
                            &nbsp;&nbsp;<span className="text-[#c792ea]">let</span> right = nums.length - <span className="text-[#f78c6c]">1</span>;<br />
                            &nbsp;&nbsp;<br />
                            &nbsp;&nbsp;<span className="text-[#c792ea]">while</span> (left {'<='} right) {'{'}<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#546e7a]">// Your logic</span><br />
                            &nbsp;&nbsp;{'}'}<br />
                            &nbsp;&nbsp;<br />
                            &nbsp;&nbsp;<span className="text-[#c792ea]">return</span> -<span className="text-[#f78c6c]">1</span>;<br />
                            {'}'}
                        </div>
                    </div>
                    <div className="p-4 border-t border-white/[0.08] flex justify-end gap-3 text-white font-sans">
                        <button className="flex items-center gap-2 py-2.5 px-5 rounded-full font-inherit text-[0.9rem] cursor-pointer bg-white/5 border border-white/15 text-white transition-all duration-200 hover:bg-white/10">
                            <Play size={16} /> Run Tests
                        </button>
                        <button className="flex items-center gap-2 py-2.5 px-5 rounded-full font-inherit text-[0.9rem] cursor-pointer bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 transition-all duration-200 hover:bg-emerald-500/25">
                            <Send size={16} /> Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskPage;
