import React, { useState } from 'react';
import { Upload, FileJson, Download, AlertCircle } from 'lucide-react';
import { downloadTemplate, parseAndValidateJSON } from '../utils/fileHelpers';
import type { Question } from '../types';

interface StartScreenProps {
  onQuizStart: (questions: Question[], title: string) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onQuizStart }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    // Basic check, though mobile file pickers handle mime types differently sometimes
    if (!file.name.toLowerCase().endsWith('.json')) {
      setError('请选择 JSON 格式的文件 (Please select a JSON file)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { questions, title } = await parseAndValidateJSON(file);
      if (questions.length === 0) {
        throw new Error("文件中没有找到题目 (No questions found in file)");
      }
      onQuizStart(questions, title);
    } catch (err: any) {
      console.error(err);
      setError(err.message || '解析文件失败，请检查格式 (Failed to parse file)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4 py-8 animate-fade-in safe-p">
      <div className="text-center mb-8 md:mb-12 mt-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">
          QuizMaster Pro
        </h1>
        <p className="text-slate-500 text-base md:text-lg max-w-xs md:max-w-lg mx-auto">
          PMP 备考神器<br/>
          Import your question bank and start practicing.
        </p>
      </div>

      <div
        className={`w-full max-w-xl p-8 md:p-10 border-2 border-dashed rounded-3xl transition-all duration-300 flex flex-col items-center justify-center cursor-pointer bg-white shadow-sm active:scale-95 touch-manipulation
          ${isDragging 
            ? 'border-indigo-500 bg-indigo-50 scale-102 shadow-xl' 
            : 'border-slate-300 hover:border-indigo-400 hover:shadow-md'
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        <input
          type="file"
          id="fileInput"
          className="hidden"
          accept=".json"
          onChange={handleFileSelect}
        />
        
        <div className={`p-4 rounded-full mb-4 ${isDragging ? 'bg-indigo-200' : 'bg-slate-100'}`}>
          {loading ? (
             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          ) : (
            <Upload className={`w-10 h-10 ${isDragging ? 'text-indigo-600' : 'text-slate-500'}`} />
          )}
        </div>

        <h3 className="text-lg md:text-xl font-semibold text-slate-800 mb-2 text-center">
          {loading ? '正在加载...' : '点击选择题库文件'}
        </h3>
        <p className="text-slate-400 text-xs md:text-sm mb-6 text-center">
          支持导入您之前保存的 .json 文件
        </p>

        <button className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold shadow-lg shadow-indigo-200 pointer-events-none">
          浏览文件
        </button>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3 max-w-xl w-full animate-bounce-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="mt-auto md:mt-12 py-6">
         <button 
          onClick={downloadTemplate}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors px-4 py-2 rounded-lg"
         >
           <FileJson className="w-4 h-4" />
           <span className="text-xs font-medium">下载示例模板</span>
           <Download className="w-4 h-4" />
         </button>
      </div>
    </div>
  );
};

export default StartScreen;