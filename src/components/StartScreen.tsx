import React, { useState, useMemo, useEffect } from 'react';
import { Upload, FileJson, Download, AlertCircle, BookOpen, ChevronRight, PlayCircle, History, Trash2 } from 'lucide-react';
import { downloadTemplate, parseAndValidateJSON } from '../utils/fileHelpers';
import { EXAMPLE_TEMPLATE } from '../constants';
import type { Question, RawTemplate } from '../types';

interface StartScreenProps {
  onQuizStart: (questions: Question[], title: string) => void;
}

const STORAGE_KEY = 'quiz_master_mistakes';

const StartScreen: React.FC<StartScreenProps> = ({ onQuizStart }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);

  // Check local storage for history on mount
  useEffect(() => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const data = JSON.parse(stored);
            setHistoryCount(Array.isArray(data) ? data.length : 0);
        }
    } catch (e) {
        console.error("Failed to read history", e);
    }
  }, []);

  // Auto-load all pmp_*.json files
  const presets = useMemo(() => {
    try {
      // @ts-ignore - Vite glob import
      const modules = import.meta.glob([
        '../../public/pmp_*.json', 
        '../pmp_*.json',      
        '../../pmp_*.json',   
        '/pmp_*.json',        
        './pmp_*.json'        
      ], { eager: true });
      
      const list = Object.entries(modules).map(([path, content]: [string, any]) => {
        const data = (content.default || content) as RawTemplate;
        const filename = path.split('/').pop() || 'Unknown';
        const match = filename.match(/section_(\d+)/);
        const order = match ? parseInt(match[1]) : 999;
        const displayTitle = data.title || filename.replace('.json', '').replace(/_/g, ' ').replace('pmp', 'PMP');

        return {
          id: path,
          filename,
          title: displayTitle,
          description: data.description || `包含 ${data.questions?.length || 0} 道题目`,
          count: Array.isArray(data.questions) ? data.questions.length : 0,
          data: data,
          order
        };
      });

      const uniquePresets = Array.from(new Map(list.map(item => [item.filename, item])).values());

      return uniquePresets
        .filter(item => item.count > 0)
        .sort((a, b) => {
            if (a.order !== 999 && b.order !== 999) return a.order - b.order;
            if (a.order !== 999) return -1;
            if (b.order !== 999) return 1;
            return a.filename.localeCompare(b.filename);
        });

    } catch (e) {
      console.error("Failed to load presets", e);
      return [];
    }
  }, []);

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
    if (!file.name.toLowerCase().endsWith('.json')) {
      setError('请选择 JSON 格式的文件');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { questions, title } = await parseAndValidateJSON(file);
      if (questions.length === 0) throw new Error("文件中没有找到题目");
      onQuizStart(questions, title);
    } catch (err: any) {
      setError(err.message || '解析文件失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePresetClick = (presetData: any, presetTitle: string) => {
    setLoading(true);
    setTimeout(async () => {
        try {
            const blob = new Blob([JSON.stringify(presetData)], { type: 'application/json' });
            const file = new File([blob], "preset.json", { type: 'application/json' });
            
            const { questions, title } = await parseAndValidateJSON(file);
            onQuizStart(questions, presetTitle || title);
        } catch (err: any) {
            setError('加载题库失败: ' + err.message);
            setLoading(false);
        }
    }, 50);
  };

  const loadExampleQuiz = async () => {
    setLoading(true);
    setTimeout(async () => {
        try {
            const blob = new Blob([JSON.stringify(EXAMPLE_TEMPLATE)], { type: 'application/json' });
            const file = new File([blob], "example_quiz.json", { type: 'application/json' });
            const { questions, title } = await parseAndValidateJSON(file);
            onQuizStart(questions, title);
        } catch (err: any) {
            setError('加载演示题库失败');
            setLoading(false);
        }
    }, 50);
  };

  const handleLoadHistory = () => {
      try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (!stored) return;
          // History items are already parsed Question objects (with correctAnswers),
          // not RawQuestion objects (with answer). We should skip parseAndValidateJSON.
          const questions = JSON.parse(stored) as Question[];
          onQuizStart(questions, "历史错题本 (History Mistakes)");
      } catch (e) {
          setError("加载历史错题失败");
      }
  };

  const handleClearHistory = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (window.confirm("确定要清空所有历史错题记录吗？此操作无法撤销。")) {
          localStorage.removeItem(STORAGE_KEY);
          setHistoryCount(0);
      }
  };

  return (
    <div className="flex flex-col items-center flex-1 w-full max-w-5xl mx-auto px-4 py-8 animate-fade-in safe-p">
      <div className="text-center mb-8 md:mb-10 mt-4">
        <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-3">
          QuizMaster Pro
        </h1>
        <p className="text-slate-500 text-sm md:text-lg max-w-lg mx-auto">
          PMP 专业备考与刷题工具
        </p>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Upload */}
        <div className="flex flex-col gap-6">
            <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-500" />
                导入新题库
            </h2>
            <div
                className={`w-full p-8 border-2 border-dashed rounded-2xl transition-all duration-300 flex flex-col items-center justify-center cursor-pointer bg-white min-h-[200px]
                ${isDragging 
                    ? 'border-indigo-500 bg-indigo-50 scale-[1.01] shadow-xl' 
                    : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50 hover:shadow-md'
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
                
                {loading ? (
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
                        <p className="text-slate-500 font-medium">处理中...</p>
                    </div>
                ) : (
                    <>
                        <div className={`p-3 rounded-full mb-4 ${isDragging ? 'bg-indigo-200' : 'bg-slate-100'}`}>
                            <Upload className={`w-8 h-8 ${isDragging ? 'text-indigo-600' : 'text-slate-400'}`} />
                        </div>
                        <p className="text-slate-600 font-medium mb-1">点击或拖拽上传 .json 文件</p>
                        <p className="text-slate-400 text-xs">支持自定义题库格式</p>
                    </>
                )}
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3 text-sm animate-bounce-in">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p>{error}</p>
                </div>
            )}
             
             <div className="flex justify-center">
                <button 
                onClick={downloadTemplate}
                className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors px-4 py-2 rounded-lg text-xs md:text-sm"
                >
                    <FileJson className="w-4 h-4" />
                    下载标准模板
                    <Download className="w-4 h-4" />
                </button>
             </div>
        </div>

        {/* Right Column: Presets */}
        <div className="flex flex-col gap-4 h-full">
            <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                内置题库
            </h2>
            <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[500px]">
                <div className="overflow-y-auto p-2 space-y-2 flex-1 custom-scrollbar">
                    {/* Special History Item - Always visible */}
                    <div 
                        onClick={historyCount > 0 ? handleLoadHistory : undefined}
                        className={`w-full text-left p-4 rounded-xl border transition-all group flex items-center justify-between mb-2 relative
                            ${historyCount > 0 
                                ? 'bg-orange-50 border-orange-200 hover:border-orange-300 cursor-pointer' 
                                : 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'}`}
                    >
                         <div className="flex-1 min-w-0 mr-4">
                            <h3 className={`font-bold flex items-center gap-2 ${historyCount > 0 ? 'text-orange-800' : 'text-slate-500'}`}>
                                <History className="w-4 h-4" />
                                历史错题本 (My Mistakes)
                            </h3>
                            <p className={`text-xs mt-1 ${historyCount > 0 ? 'text-orange-600/70' : 'text-slate-400'}`}>
                                {historyCount > 0 ? "自动收集的历史错题集合" : "暂无错题记录 (No records)"}
                            </p>
                            {historyCount > 0 && (
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                                        {historyCount} 题
                                    </span>
                                </div>
                            )}
                        </div>
                        {historyCount > 0 && (
                            <div className="flex flex-col items-end gap-2">
                                <button 
                                    onClick={handleClearHistory}
                                    className="p-2 text-orange-300 hover:text-red-500 hover:bg-orange-100 rounded-lg transition-colors z-10"
                                    title="清空记录"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {presets.length > 0 ? presets.map((preset) => (
                        <button
                            key={preset.id}
                            onClick={() => handlePresetClick(preset.data, preset.title)}
                            className="w-full text-left p-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group flex items-center justify-between"
                        >
                            <div className="flex-1 min-w-0 mr-4">
                                <h3 className="font-bold text-slate-700 truncate group-hover:text-indigo-700 transition-colors">
                                    {preset.title}
                                </h3>
                                <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                                    {preset.description}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700">
                                        {preset.count} 题
                                    </span>
                                    <span className="text-[10px] text-slate-300 font-mono hidden md:inline">
                                        {preset.filename}
                                    </span>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                        </button>
                    )) : (
                        <div className="flex flex-col items-center justify-center h-48 text-center p-8">
                            <BookOpen className="w-12 h-12 text-slate-200 mb-3" />
                            <p className="text-slate-400 text-sm mb-4">
                                正在扫描本地题库... <br/>
                                <span className="text-xs opacity-70 block mt-1">(请确保 pmp_*.json 文件位于项目根目录)</span>
                            </p>
                             <button 
                                onClick={loadExampleQuiz}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-bold"
                            >
                                <PlayCircle className="w-4 h-4" />
                                试用演示题库
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;