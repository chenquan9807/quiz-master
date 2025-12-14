import React, { useState, useEffect } from 'react';
import type { Question } from '../types';
import { CheckCircle2, XCircle, ArrowRight, ArrowLeft, RotateCcw, HelpCircle } from 'lucide-react';

interface QuizScreenProps {
  questions: Question[];
  title: string;
  onComplete: (score: number, userAnswers: Record<string, number[]>) => void;
  onExit: () => void;
}

const QuizScreen: React.FC<QuizScreenProps> = ({ questions, onComplete, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, number[]>>({});
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  useEffect(() => {
    const savedAnswer = userAnswers[currentQuestion.id];
    if (savedAnswer) {
      setSelectedIndices(savedAnswer);
      setIsSubmitted(true);
    } else {
      setSelectedIndices([]);
      setIsSubmitted(false);
    }
  }, [currentIndex, currentQuestion.id, userAnswers]);

  const handleOptionClick = (index: number) => {
    if (isSubmitted) return;

    if (currentQuestion.type === 'multiple') {
      setSelectedIndices(prev => {
        if (prev.includes(index)) return prev.filter(i => i !== index);
        return [...prev, index].sort();
      });
    } else {
      setSelectedIndices([index]);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      onComplete(score, userAnswers);
    } else {
      setCurrentIndex(prev => prev + 1);
      // Auto scroll to top on mobile
      window.scrollTo(0,0);
    }
  };

  const handleSubmit = () => {
    if (selectedIndices.length === 0) return;

    const isCorrect = 
      selectedIndices.length === currentQuestion.correctAnswers.length &&
      selectedIndices.every(val => currentQuestion.correctAnswers.includes(val));

    let newScore = score;
    if (isCorrect && !userAnswers[currentQuestion.id]) {
        newScore = score + 1;
        setScore(newScore);
    }

    const newUserAnswers = {
      ...userAnswers,
      [currentQuestion.id]: selectedIndices
    };

    setUserAnswers(newUserAnswers);
    setIsSubmitted(true);

    // Auto-advance if correct
    if (isCorrect) {
      setTimeout(() => {
        if (isLastQuestion) {
           onComplete(newScore, newUserAnswers);
        } else {
           setCurrentIndex(prev => prev + 1);
           window.scrollTo(0,0);
        }
      }, 400); // 700ms delay to show the green checkmark
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      window.scrollTo(0,0);
    }
  };

  const getOptionStyle = (index: number) => {
    const isSelected = selectedIndices.includes(index);
    const isCorrect = currentQuestion.correctAnswers.includes(index);
    
    // Increased padding for touch targets
    let baseStyle = "w-full p-4 md:p-5 rounded-xl border text-left transition-all duration-200 flex items-center justify-between group active:scale-[0.99] touch-manipulation ";
    
    if (!isSubmitted) {
      if (isSelected) return baseStyle + "border-indigo-600 bg-indigo-50 text-indigo-900 shadow-sm ring-1 ring-indigo-200 font-medium";
      return baseStyle + "border-slate-200 bg-white text-slate-700 shadow-sm";
    }

    if (isCorrect) {
        if (isSelected) return baseStyle + "border-green-500 bg-green-50 text-green-900 shadow-sm font-medium";
        return baseStyle + "border-green-500 bg-green-50 text-green-900 border-dashed opacity-80";
    }
    
    if (isSelected && !isCorrect) {
      return baseStyle + "border-red-500 bg-red-50 text-red-900 shadow-sm";
    }

    return baseStyle + "border-slate-100 bg-slate-50 text-slate-400";
  };

  const renderIcon = (index: number) => {
    const isSelected = selectedIndices.includes(index);
    const isCorrect = currentQuestion.correctAnswers.includes(index);

    if (!isSubmitted) {
        return <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
            ${isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
            {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
        </div>;
    }

    if (isCorrect) return <CheckCircle2 className="w-6 h-6 text-green-600" />;
    if (isSelected && !isCorrect) return <XCircle className="w-6 h-6 text-red-600" />;
    return <div className="w-6 h-6" />;
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col h-full">
      {/* Header - Sticky */}
      <div className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm px-4 pt-4 pb-2 border-b border-slate-200/50">
          <div className="flex items-center justify-between mb-3">
            <button onClick={onExit} className="p-2 -ml-2 text-slate-400 hover:text-slate-700">
                <RotateCcw className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Question {currentIndex + 1} / {questions.length}
                </span>
            </div>
            <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
                Score: {score}
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
            <div 
                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
         {/* Question Text */}
         <div className="mb-6">
            <div className="inline-block px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide mb-3
                bg-white border border-slate-200 text-slate-500 shadow-sm">
                {currentQuestion.type === 'single' ? '单选题 (Single Choice)' : 
                 currentQuestion.type === 'multiple' ? '多选题 (Multiple Choice)' : '判断题 (True/False)'}
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-800 leading-snug">
                {currentQuestion.question}
            </h3>
         </div>

         {/* Options */}
         <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => (
                <div
                    key={idx}
                    onClick={() => handleOptionClick(idx)}
                    className={getOptionStyle(idx)}
                >
                    <span className="text-sm md:text-base leading-relaxed mr-2">{option}</span>
                    <span className="flex-shrink-0">{renderIcon(idx)}</span>
                </div>
            ))}
         </div>

         {/* Explanation */}
         {isSubmitted && (
             <div className={`mt-6 p-4 rounded-xl border ${
                 selectedIndices.length === currentQuestion.correctAnswers.length && 
                 selectedIndices.every(i => currentQuestion.correctAnswers.includes(i)) 
                 ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'
             } animate-fade-in`}>
                <div className="flex gap-3">
                    <HelpCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                         selectedIndices.length === currentQuestion.correctAnswers.length && 
                         selectedIndices.every(i => currentQuestion.correctAnswers.includes(i))
                         ? 'text-green-600' : 'text-orange-500'
                    }`} />
                    <div>
                        <h4 className="font-bold text-sm text-slate-800 mb-1">解析 (Explanation)</h4>
                        <p className="text-slate-700 text-sm leading-relaxed">
                            {currentQuestion.explanation || "暂无详细解析。"}
                        </p>
                    </div>
                </div>
             </div>
         )}
      </div>

      {/* Footer Navigation - Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 pb-safe-bottom z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
         <div className="max-w-3xl mx-auto flex gap-3">
            <button 
                onClick={handlePrev} 
                disabled={currentIndex === 0}
                className={`px-4 py-3 rounded-xl border-2 font-bold transition-colors
                    ${currentIndex === 0 ? 'border-slate-100 text-slate-300' : 'border-slate-200 text-slate-600 active:bg-slate-50'}`}
            >
                <ArrowLeft className="w-5 h-5" />
            </button>

            {!isSubmitted ? (
                 <button 
                    onClick={handleSubmit}
                    disabled={selectedIndices.length === 0}
                    className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-[0.98]
                        ${selectedIndices.length === 0 ? 'bg-slate-300 shadow-none' : 'bg-indigo-600 shadow-indigo-200'}`}
                 >
                    提交答案 (Submit)
                 </button>
            ) : (
                <button 
                    onClick={handleNext}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
                >
                    {isLastQuestion ? '查看结果' : '下一题'}
                    <ArrowRight className="w-5 h-5" />
                </button>
            )}
         </div>
      </div>
    </div>
  );
};

export default QuizScreen;