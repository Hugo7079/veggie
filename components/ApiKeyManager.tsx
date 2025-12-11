import React, { useState, useEffect, useRef } from 'react';
import { Key, X, Check } from 'lucide-react';
import { getApiKey, setApiKey, clearApiKey, isApiKeyPresent } from '../services/geminiService';

export const ApiKeyManager: React.FC = () => {
  const [apiKey, setKey] = useState<string>(getApiKey());
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [saved, setSaved] = useState(isApiKeyPresent());

  useEffect(() => {
    const onChange = () => setSaved(isApiKeyPresent());
    window.addEventListener('veggie_api_key_changed', onChange);
    return () => window.removeEventListener('veggie_api_key_changed', onChange);
  }, []);

  useEffect(() => {
    if (open) {
      // autofocus input field when modal opens
      setTimeout(() => inputRef.current?.focus(), 50);
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setOpen(false);
      };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }
  }, [open]);

  const handleSave = () => {
    setApiKey(apiKey.trim());
    setOpen(false);
    setSaved(!!apiKey.trim());
  };

  const handleClear = () => {
    clearApiKey();
    setKey('');
    setOpen(false);
    setSaved(false);
  };

  return (
    <>
      {/* Floating small circular button with key icon */}
      <button
        aria-label={saved ? 'Gemini Key 已設定 - 點擊編輯' : '未設定 Gemini Key - 點擊設定'}
        title={saved ? 'Gemini Key 已設定 (點擊編輯)' : '未設定 Gemini Key (點擊設定)'}
        className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-colors duration-150 ${saved ? 'bg-green-100 border border-green-400 text-veggie-dark' : 'bg-yellow-50 border border-yellow-400 text-veggie-dark'}`}
        onClick={() => setOpen(true)}
      >
        <Key size={16} />
      </button>

      {/* Modal for entering the API key */}
      {open && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative z-10 bg-white rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Gemini API Key</h3>
              <button className="p-2 rounded-full hover:bg-gray-100" title="關閉" aria-label="關閉" onClick={() => setOpen(false)}>
                <X size={18} />
              </button>
            </div>

              <div className="mb-4">
              <label htmlFor="gemini-key" className="block text-sm text-gray-600 mb-2">輸入你的 Gemini API Key</label>
              <input
                id="gemini-key"
                type="password"
                value={apiKey}
                  onChange={(e) => setKey(e.target.value)}
                placeholder="輸入 Gemini API Key"
                  ref={inputRef}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                aria-label="Gemini API Key 輸入"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button onClick={handleClear} className="text-red-600 border px-3 py-2 rounded-lg">清除</button>
              <button onClick={() => { setKey(getApiKey()); setOpen(false); }} className="bg-white border px-3 py-2 rounded-lg">取消</button>
              <button onClick={handleSave} title="儲存 API Key" className="bg-veggie-green text-white px-3 py-2 rounded-lg inline-flex items-center gap-2"><Check size={16} /> 儲存</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ApiKeyManager;
