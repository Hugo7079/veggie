import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Sparkles, X, Loader2 } from 'lucide-react';
import { analyzeImage } from '../services/geminiService';

export const VisionDemo: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('Describe this image in detail.');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(''); // Clear previous result
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image || isLoading) return;

    setIsLoading(true);
    setResult('');
    try {
      const response = await analyzeImage(image, prompt);
      setResult(response.text || "No text returned.");
    } catch (error) {
      console.error(error);
      setResult("Error analyzing image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setResult('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 p-6 max-w-6xl mx-auto">
      {/* Left Panel: Input */}
      <div className="flex-1 flex flex-col space-y-6">
        <div 
          className={`flex-1 min-h-[300px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-colors relative overflow-hidden ${
            image ? 'border-gemini-600 bg-panel' : 'border-gray-700 hover:border-gemini-500 hover:bg-gray-800/30'
          }`}
        >
          {image ? (
            <>
              <img src={image} alt="Preview" className="max-w-full max-h-full object-contain p-4" />
              <button 
                onClick={clearImage}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-red-500/80 text-white rounded-full transition-colors backdrop-blur-sm"
              >
                <X size={20} />
              </button>
            </>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer flex flex-col items-center text-gray-400"
            >
              <Upload size={48} className="mb-4 text-gemini-500" />
              <p className="text-lg font-medium">Upload an image</p>
              <p className="text-sm opacity-60 mt-1">Supports JPG, PNG</p>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        <div className="bg-panel p-4 rounded-xl border border-gray-800">
          <label className="block text-sm text-gray-400 mb-2">Prompt</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 bg-black/30 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gemini-500 transition-colors"
            />
            <button
              onClick={handleAnalyze}
              disabled={!image || isLoading}
              className="bg-gemini-600 hover:bg-gemini-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
              Analyze
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel: Result */}
      <div className="flex-1 bg-panel border border-gray-800 rounded-2xl p-6 overflow-y-auto shadow-2xl">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
          <ImageIcon className="text-gemini-400" />
          <h2 className="text-xl font-semibold">Analysis Result</h2>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-40 space-y-4">
            <Loader2 className="animate-spin text-gemini-500" size={32} />
            <p className="text-gray-400 animate-pulse">Gemini is analyzing pixels...</p>
          </div>
        ) : result ? (
          <div className="prose prose-invert max-w-none text-gray-200 leading-relaxed whitespace-pre-wrap">
            {result}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-600">
            <p>Upload an image and click analyze to see the magic.</p>
          </div>
        )}
      </div>
    </div>
  );
};