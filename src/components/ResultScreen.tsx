import React from 'react';
import { Trophy, RefreshCcw, CheckCircle, XCircle } from 'lucide-react';

interface ResultScreenProps {
  score: number;
  total: number;
  onRestart: () => void;
  onNewFile: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ score, total, onRestart, onNewFile }) => {
  const percentage = Math.round((score / total) * 100);
  
  let gradeColor = "text-indigo-600";
  let message = "Excellent!";
  if (percentage < 60) {
    gradeColor = "text-red-500";
    message = "Keep Practicing!";
  } else if (percentage < 80) {
    gradeColor = "text-orange-500";
    message = "Good Job!";
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-fade-in">
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