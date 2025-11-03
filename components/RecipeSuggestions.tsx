import React from 'react';
import { Recipe } from '../types';
import { Translation } from '../i18n/translations';
import { SparklesIcon } from './icons';

interface RecipeSuggestionsProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  t: Translation;
}

const RecipeSuggestions: React.FC<RecipeSuggestionsProps> = ({ recipes, onSelectRecipe, t }) => {
  return (
    <div className="w-full max-w-5xl text-center animate-fade-in">
      <h2 className="text-3xl md:text-4xl font-bold mb-2 font-display bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">{t.recipeSuggestions.title}</h2>
      <p className="text-gray-300 mb-8 text-lg">{t.recipeSuggestions.subtitle}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe, index) => (
          <div
            key={index}
            className="bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-lg p-6 flex flex-col justify-between border border-gray-700 hover:border-purple-500 hover:scale-105 transform transition-all duration-300"
          >
            <div>
              <h3 className="text-xl font-bold font-display text-white mb-2">{recipe.title}</h3>
              <p className="text-gray-400 text-sm mb-4 h-20 overflow-hidden">{recipe.description}</p>
              {recipe.calories && (
                <p className="text-xs text-yellow-300 mb-4">{recipe.calories} {t.recipeDisplay.calories}</p>
              )}
            </div>
            <button
              onClick={() => onSelectRecipe(recipe)}
              className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg shadow-md hover:from-purple-500 hover:to-indigo-500 transition-colors flex items-center justify-center gap-2"
            >
              <SparklesIcon />
              {t.recipeSuggestions.selectButton}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeSuggestions;
