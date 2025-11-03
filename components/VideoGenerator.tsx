import React, { useState, useEffect } from 'react';
import { generateDishImage } from '../services/geminiService';
import { Translation, Language, translations } from '../i18n/translations';

interface VideoGeneratorProps {
  recipeTitle: string;
  onImageReady: (url: string) => void;
  onGenerationFail: () => void;
  t: Translation;
  language: Language;
}

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ recipeTitle, onImageReady, onGenerationFail, t, language }) => {
  const [loadingMessage, setLoadingMessage] = useState(t.imageGenerator.loadingMessages[0]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setLoadingMessage(prev => {
        const loadingMessages = t.imageGenerator.loadingMessages;
        const currentIndex = loadingMessages.indexOf(prev);
        return loadingMessages[(currentIndex + 1) % loadingMessages.length];
      });
    }, 3000);
    return () => window.clearInterval(interval);
  }, [t.imageGenerator.loadingMessages]);

  useEffect(() => {
    const generate = async () => {
      const prompt = translations[language].prompts.generateImage(recipeTitle);
      try {
        const imageUrl = await generateDishImage(prompt);
        onImageReady(imageUrl);
      } catch (err: any) {
        console.error(err);
        onGenerationFail();
      }
    };

    generate();
  }, [recipeTitle, onImageReady, onGenerationFail, t, language]);

  return (
    <div className="w-full max-w-lg p-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700 text-center">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-400 mx-auto mb-4"></div>
      <p className="text-xl text-gray-200">{loadingMessage}</p>
    </div>
  );
};

export default VideoGenerator;