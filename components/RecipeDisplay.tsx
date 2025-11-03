import React from 'react';
import { Recipe } from '../types';
import { ImageIcon, FireIcon } from './icons';
import { Translation } from '../i18n/translations';

interface RecipeDisplayProps {
  recipe: Recipe;
  onGenerateImage: () => void;
  t: Translation;
}

const RecipeDisplay: React.FC<RecipeDisplayProps> = ({ recipe, onGenerateImage, t }) => {
  return (
    <div className="w-full max-w-3xl bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700 p-6 md:p-8 animate-fade-in">
      <h2 className="text-3xl md:text-4xl font-bold mb-2 font-display text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">{recipe.title}</h2>
      <p className="text-gray-300 mb-4 text-center">{recipe.description}</p>

      {recipe.calories && (
        <div className="flex items-center justify-center gap-2 text-yellow-300 mb-6 animate-fade-in">
          <FireIcon />
          <span className="font-semibold">{recipe.calories} {t.recipeDisplay.calories}</span>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-1 bg-gray-900/40 p-4 rounded-lg">
          <h3 className="text-xl font-bold mb-3 font-display text-purple-300">{t.recipeDisplay.ingredients}</h3>
          <ul className="list-disc ltr:list-inside rtl:list-outside rtl:mr-4 space-y-1 text-gray-300">
            {recipe.ingredients.map((ing, index) => <li key={index}>{ing}</li>)}
          </ul>
        </div>

        <div className="md:col-span-2">
          <h3 className="text-xl font-bold mb-3 font-display text-purple-300">{t.recipeDisplay.instructions}</h3>
          <ol className="list-decimal ltr:list-inside rtl:list-outside rtl:mr-4 space-y-3 text-gray-300">
            {recipe.steps.map((step, index) => <li key={index}>{step}</li>)}
          </ol>
        </div>
      </div>
      
      <div className="text-center">
        <button
          onClick={onGenerateImage}
          className="px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transform transition-transform duration-300 flex items-center gap-2 mx-auto"
        >
          <ImageIcon />
          {t.recipeDisplay.visualizeButton}
        </button>
      </div>
    </div>
  );
};

export default RecipeDisplay;
