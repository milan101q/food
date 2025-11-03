
import React, { useState, useCallback, useEffect } from 'react';
import { AppState, Recipe } from './types.ts';
import ImageUploader from './components/ImageUploader.tsx';
import RecipeDisplay from './components/RecipeDisplay.tsx';
import RecipeSuggestions from './components/RecipeSuggestions.tsx';
import VideoGenerator from './components/VideoGenerator.tsx';
import LanguageSelector from './components/LanguageSelector.tsx';
import { analyzeIngredients, generateRecipeSuggestions } from './services/geminiService.ts';
import { AlchemistIcon, SparklesIcon } from './components/icons.tsx';
import { translations, Language, Translation } from './i18n/translations.ts';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.SELECTING_LANGUAGE);
  const [language, setLanguage] = useState<Language>('en');
  const [t, setT] = useState<Translation>(translations.en);
  
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [identifiedIngredients, setIdentifiedIngredients] = useState<string[]>([]);
  const [recipeSuggestions, setRecipeSuggestions] = useState<Recipe[]>([]);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setT(translations[language]);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    document.body.className = language === 'fa' ? 'lang-fa' : '';
  }, [language]);

  const handleLanguageSelect = useCallback((lang: Language) => {
    setLanguage(lang);
    setAppState(AppState.IDLE);
  }, []);

  const handleImageUpload = useCallback(async (imageData: string) => {
    setAppState(AppState.ANALYZING_IMAGE);
    setUploadedImage(imageData);
    setError(null);
    try {
      const ingredients = await analyzeIngredients(imageData, language);
      setIdentifiedIngredients(ingredients);
      const suggestions = await generateRecipeSuggestions(ingredients, language);
      setRecipeSuggestions(suggestions);
      setAppState(AppState.SUGGESTIONS_READY);
    } catch (err) {
      setError(t.error.ingredientAnalysisFailed);
      setAppState(AppState.IDLE);
      console.error(err);
    }
  }, [language, t]);

  const handleRecipeSelect = useCallback((selectedRecipe: Recipe) => {
    setRecipe(selectedRecipe);
    setAppState(AppState.RECIPE_READY);
  }, []);

  const handleGenerateImage = useCallback(() => {
    setError(null);
    setAppState(AppState.GENERATING_IMAGE);
  }, []);

  const handleImageReady = useCallback((url: string) => {
    setImageUrl(url);
    setAppState(AppState.IMAGE_READY);
  }, []);

  const handleImageGenerationFail = useCallback(() => {
    setError(t.error.imageGenerationFailed);
    setAppState(AppState.RECIPE_READY);
  }, [t]);

  const handleReset = useCallback(() => {
    setAppState(AppState.IDLE);
    setUploadedImage(null);
    setIdentifiedIngredients([]);
    setRecipeSuggestions([]);
    setRecipe(null);
    setImageUrl(null);
    setError(null);
  }, []);
  
  const handleBackToLanguageSelect = useCallback(() => {
    handleReset();
    setAppState(AppState.SELECTING_LANGUAGE);
  }, [handleReset]);


  const renderContent = () => {
    switch (appState) {
      case AppState.SELECTING_LANGUAGE:
        return <LanguageSelector onSelectLanguage={handleLanguageSelect} t={t} />;
      case AppState.IDLE:
      case AppState.ANALYZING_IMAGE:
        return (
          <ImageUploader
            onImageUpload={handleImageUpload}
            isLoading={appState === AppState.ANALYZING_IMAGE}
            t={t}
          />
        );
      case AppState.SUGGESTIONS_READY:
        return (
          <RecipeSuggestions
            recipes={recipeSuggestions}
            onSelectRecipe={handleRecipeSelect}
            t={t} />
        );
      case AppState.RECIPE_READY:
        return recipe ? (
          <RecipeDisplay
            recipe={recipe}
            onGenerateImage={handleGenerateImage}
            t={t}
          />
        ) : null;
      case AppState.GENERATING_IMAGE:
        return recipe ? (
          <VideoGenerator
            recipeTitle={recipe.title}
            onImageReady={handleImageReady}
            onGenerationFail={handleImageGenerationFail}
            t={t}
            language={language}
          />
        ) : null;
      case AppState.IMAGE_READY:
        return (
          <div className="w-full max-w-3xl text-center flex flex-col items-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display">{t.imageReady.title}</h2>
            <p className="text-lg text-gray-300 mb-6">{t.imageReady.subtitle}</p>
            {imageUrl && (
              <img
                src={imageUrl}
                alt={`Generated of ${recipe?.title}`}
                className="w-full max-w-md rounded-2xl shadow-2xl mb-8 border-2 border-purple-400/50"
              />
            )}
            <button
              onClick={handleReset}
              className="px-8 py-4 bg-gradient-to-r from-green-400 to-teal-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transform transition-transform duration-300 flex items-center gap-2"
            >
              <SparklesIcon/>
              {t.imageReady.cookAnotherButton}
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 selection:bg-purple-500 selection:text-white">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2228%22%20height%3D%2249%22%20viewBox%3D%220%200%2028%2049%22%3E%3Cg%20fill-rule%3D%22evenodd%22%3E%3Cg%20id%3D%22hexagons%22%20fill%3D%22%232d3748%22%20fill-opacity%3D%220.2%22%20fill-rule%3D%22nonzero%22%3E%3Cpath%20d%3D%22M13.99%209.25l13.99%209.25v10.5h-14.01zM13.99%2028.75l13.99%209.25v10.5h-14.01zM13.99%200l13.99%209.25-13.99%209.25-13.99-9.25zM-3.68e-15%2028.75l13.99%209.25-13.99%209.25-13.99-9.25z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30"></div>
      
      <header className="w-full max-w-5xl mx-auto p-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <AlchemistIcon/>
          <h1 className="text-2xl md:text-3xl font-bold font-display">{t.header.title}</h1>
        </div>
        {appState !== AppState.IDLE && appState !== AppState.SELECTING_LANGUAGE && (
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-700/50 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600/70 transform transition-all duration-200 backdrop-blur-sm"
          >
            {t.header.startOver}
          </button>
        )}
        {appState !== AppState.SELECTING_LANGUAGE && (
           <button onClick={handleBackToLanguageSelect} className="text-sm text-gray-400 hover:text-white">
             Change Language
           </button>
        )}
      </header>

      <main className="flex-grow flex items-center justify-center w-full max-w-5xl mx-auto z-10 p-4">
        {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg relative mb-4 text-center" role="alert">
                <strong className="font-bold">{t.error.title}</strong>
                <span className="block sm:inline ltr:ml-2 rtl:mr-2">{error}</span>
            </div>
        )}
        {renderContent()}
      </main>
    </div>
  );
};

export default App;