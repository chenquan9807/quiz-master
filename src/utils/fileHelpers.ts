import type { Question, RawQuestion, RawTemplate } from '../types';
import { EXAMPLE_TEMPLATE } from '../constants';

const generateId = () => Math.random().toString(36).substring(2, 9);

export const downloadTemplate = () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(EXAMPLE_TEMPLATE, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "quiz_template.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

export const parseAndValidateJSON = async (file: File): Promise<{ title: string; questions: Question[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string) as RawTemplate;
        
        if (!Array.isArray(json.questions)) {
          throw new Error("JSON file must contain a 'questions' array.");
        }

        const normalizedQuestions: Question[] = json.questions.map((q: RawQuestion, index) => {
          let options: string[] = [];
          let correctAnswers: number[] = [];

          // Normalize Options
          if (q.type === 'boolean') {
            options = ['正确', '错误']; // Standard True/False in Chinese context
          } else {
            options = q.options || [];
            if (options.length === 0) {
              throw new Error(`Question "${q.question}" (Index ${index}) missing options.`);
            }
          }

          // Normalize Answers
          if (q.type === 'boolean') {
            if (typeof q.answer === 'boolean') {
              correctAnswers = q.answer ? [0] : [1];
            } else {
              // Fallback if user put index manually for boolean
               correctAnswers = Array.isArray(q.answer) ? q.answer : [q.answer as number];
            }
          } else {
            if (Array.isArray(q.answer)) {
              correctAnswers = q.answer;
            } else if (typeof q.answer === 'number') {
              correctAnswers = [q.answer];
            } else {
              throw new Error(`Invalid answer format for question "${q.question}"`);
            }
          }

          return {
            id: q.id?.toString() || generateId(),
            type: q.type,
            question: q.question,
            options,
            correctAnswers,
            explanation: q.explanation
          };
        });

        resolve({
          title: json.title || file.name.replace('.json', ''),
          questions: normalizedQuestions
        });

      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};