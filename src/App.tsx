import React, { useState } from 'react';
import StartScreen from './components/StartScreen';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import type { Question, Screen } from './types';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('start');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizTitle, setQuizTitle] = useState<string>('');
  const [finalScore, setFinalScore] = useState(0);

  const handleStartQuiz = (loadedQuestions: Question[], title: string) => {
    setQuestions(loadedQuestions);
    setQuizTitle(title);
    setCurrentScreen('quiz');
  };

  const handleComplete = (score: number) => {
    setFinalScore(score);
    setCurrentScreen('result');
  };

  const handleRestart = () => {
    setFinalScore(0);
    setCurrentScreen('quiz');
  };

  const handleNewFile = () => {
    setQuestions([]);
    setQuizTitle('');
    setFinalScore(0);
    setCurrentScreen('start');
  };

  return (
    // min-h-[100dvh] ensures it takes full height on mobile browsers including address bar area handling
    <div className="w-full min-h-[100dvh] bg-slate-50 text-slate-900 flex flex-col">
      {currentScreen === 'start' && (
        <StartScreen onQuizStart={handleStartQuiz} />
      )}
      {currentScreen === 'quiz' && (
        <QuizScreen 
          questions={questions} 
          title={quizTitle} 
          onComplete={handleComplete} 
          onExit={handleNewFile}
        />
      )}
      {currentScreen === 'result' && (
        <ResultScreen 
          score={finalScore} 
          total={questions.length} 
          onRestart={handleRestart}
          onNewFile={handleNewFile}
        />
      )}
    </div>
  );
};

export default App;