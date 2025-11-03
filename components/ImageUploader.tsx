
import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons.tsx';
import { Translation } from '../i18n/translations.ts';

interface ImageUploaderProps {
  onImageUpload: (imageData: string) => void;
  isLoading: boolean;
  t: Translation;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, isLoading, t }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError(t.error.invalidImage);
        setPreview(null);
        return;
      }
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
      };
      reader.readAsDataURL(file);
    }
  }, [t]);

  const handleSubmit = useCallback(() => {
    if (preview && !isLoading) {
      onImageUpload(preview);
    }
  }, [preview, isLoading, onImageUpload]);

  const fileInputId = 'image-upload-input';

  return (
    <div className="w-full max-w-lg text-center p-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700">
      <h2 className="text-3xl font-bold mb-2 font-display">{t.imageUploader.title}</h2>
      <p className="text-gray-400 mb-6">{t.imageUploader.subtitle}</p>
      
      <div className="mb-6">
        <label
          htmlFor={fileInputId}
          className="relative block w-full h-64 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-purple-400 transition-colors"
        >
          {preview ? (
            <img src={preview} alt="Ingredients preview" className="w-full h-full object-cover rounded-lg" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <UploadIcon />
              <span className="mt-2">{t.imageUploader.uploadArea}</span>
            </div>
          )}
          <input
            id={fileInputId}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
            disabled={isLoading}
          />
        </label>
        {error && <p className="text-red-400 mt-2">{error}</p>}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!preview || isLoading}
        className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg shadow-lg hover:scale-105 disabled:hover:scale-100 transform transition-transform duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin ltr:-ml-1 rtl:-mr-1 ltr:mr-3 rtl:ml-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t.imageUploader.loading}
          </>
        ) : (
          t.imageUploader.button
        )}
      </button>
    </div>
  );
};

export default ImageUploader;