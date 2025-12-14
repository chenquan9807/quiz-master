import React, { useState, useMemo } from 'react';
import { Trophy, RefreshCcw, AlertTriangle, CheckCircle2, XCircle, ChevronLeft } from 'lucide-react';
import type { Question } from '../types';

interface ResultScreenProps {
  score: number;
  questions: Question[]; // Need full questions to calculate mistakes
  userAnswers: Record<string, number[]>;
  onRestart: () => void;
  onNewFile: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ score, questions, userAnswers, onRestart, onNewFile }) => {
  const [showMistakes, setShowMistakes] = useState(false);
  const total = questions.length;
  const percentage = Math.round((score / total) * 100);
  
  // Calculate wrong answers
  const wrongQuestions = useMemo(() => {
    return questions.filter(q => {
      const userAnswer = userAnswers[q.id] || [];
      // Simple array comparison: check length and every element
      const isCorrect = userAnswer.length === q.correctAnswers.length &&
                        userAnswer.every(val => q.correctAnswers.includes(val));
      return !isCorrect;
    });
  }, [questions, userAnswers]);

  let gradeColor = "text-indigo-600";
  let message = "Excellent!";
  if (percentage < 60) {
    gradeColor = "text-red-500";
    message = "Keep Practicing!";
  } else if (percentage < 80) {
    gradeColor = "text-orange-500";
    message = "Good Job!";
  }

  // --- View: Mistakes Review ---
  if (showMistakes) {
    return (
      <div className="flex flex-col w-full max-w-3xl mx-auto h-[100dvh] bg-slate-50">
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-4 flex items-center gap-3 shadow-sm">
             <button 
                onClick={() => setShowMistakes(false)}
                className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
             >
                <ChevronLeft className="w-6 h-6" />
             </button>
             <h2 className="text-lg font-bold text-slate-800">
                错题记录 ({wrongQuestions.length})
             </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {wrongQuestions.map((q, index) => {
                const myAnswer = userAnswers[q.id] || [];
                return (
                    <div key={q.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-start gap-3 mb-4">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-600 font-bold text-xs flex items-center justify-center mt-0.5">
                                {index + 1}
                            </span>
                            <h3 className="font-bold text-slate-800 text-lg">{q.question}</h3>
                        </div>

                        <div className="space-y-2 mb-4">
                            {q.options.map((opt, optIdx) => {
                                const isSelected = myAnswer.includes(optIdx);
                                const isCorrect = q.correctAnswers.includes(optIdx);
                                
                                let itemStyle = "p-3 rounded-lg border text-sm flex items-center justify-between ";
                                let icon = null;

                                if (isCorrect) {
                                    itemStyle += "bg-green-50 border-green-200 text-green-900 font-medium";
                                    icon = <CheckCircle2 className="w-5 h-5 text-green-600" />;
                                } else if (isSelected) {
                                    itemStyle += "bg-red-50 border-red-200 text-red-900";
                                    icon = <XCircle className="w-5 h-5 text-red-600" />;
                                } else {
                                    itemStyle += "bg-white border-slate-100 text-slate-400";
                                }

                                return (
                                    <div key={optIdx} className={itemStyle}>
                                        <span>{opt}</span>
                                        {icon}
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-600 leading-relaxed border border-slate-100">
                            <span className="font-bold text-slate-700 block mb-1">解析：</span>
                            {q.explanation || "暂无详细解析"}
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
    );
  }

  // --- View: Summary Card ---
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] px-4 animate-fade-in py-8">
       <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl text-center max-w-lg w-full border border-slate-100">
           <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center bg-gradient-to-br from-yellow-100 to-yellow-50`}>
               <Trophy className={`w-12 h-12 ${gradeColor}`} />
           </div>
           
           <h2 className="text-3xl font-bold text-slate-800 mb-2">{message}</h2>
           <p className="text-slate-500 mb-8">You have completed the quiz.</p>

           <div className="flex items-center justify-center gap-8 mb-10">
               <div className="text-center">
                   <p className="text-4xl font-extrabold text-slate-800">{score}</p>
                   <p className="text-sm font-medium text-slate-400 mt-1 uppercase tracking-wide">Correct</p>
               </div>
               <div className="h-12 w-px bg-slate-200"></div>
               <div className="text-center">
                   <p className={`text-4xl font-extrabold ${gradeColor}`}>{percentage}%</p>
                   <p className="text-sm font-medium text-slate-400 mt-1 uppercase tracking-wide">Score</p>
               </div>
               <div className="h-12 w-px bg-slate-200"></div>
               <div className="text-center">
                   <p className="text-4xl font-extrabold text-slate-800">{total}</p>
                   <p className="text-sm font-medium text-slate-400 mt-1 uppercase tracking-wide">Total</p>
               </div>
           </div>

           <div className="space-y-3">
               {wrongQuestions.length > 0 && (
                   <button 
                    onClick={() => setShowMistakes(true)}
                    className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-bold transition-all flex items-center justify-center gap-2 mb-2"
                   >
                       <AlertTriangle className="w-5 h-5" />
                       查看错题 ({wrongQuestions.length})
                   </button>
               )}

               <button 
                onClick={onRestart}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
               >
                   <RefreshCcw className="w-5 h-5" />
                   Restart Quiz
               </button>
               <button 
                onClick={onNewFile}
                className="w-full py-3 bg-white border-2 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 rounded-xl font-bold transition-all"
               >
                   Import New File
               </button>
           </div>
       </div>
    </div>
  );
};

export default ResultScreen;