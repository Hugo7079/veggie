import React, { useState, useEffect } from 'react';
import { Key, X, Check } from 'lucide-react';
import { getApiKey, setApiKey, clearApiKey, isApiKeyPresent } from '../services/geminiService';

export const ApiKeyManager: React.FC = () => {
  const [apiKey, setKey] = useState<string>(getApiKey());
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(isApiKeyPresent());

  useEffect(() => {
    const onChange = () => setSaved(isApiKeyPresent());
    window.addEventListener('veggie_api_key_changed', onChange);
    return () => window.removeEventListener('veggie_api_key_changed', onChange);
  }, []);

  const handleSave = () => {
    setApiKey(apiKey.trim());
    setEditing(false);
    setSaved(!!apiKey.trim());
  };

  const handleClear = () => {
    clearApiKey();
    setKey('');
    setEditing(false);
    setSaved(false);
  };

  return (
    <div className="flex items-center gap-2">
      {!editing && (
        <div className="flex items-center gap-3">
          <div className={`px-3 py-2 rounded-lg border ${saved ? 'bg-green-100 border-green-400' : 'bg-yellow-50 border-yellow-400'} text-sm font-medium`}> 
            <Key size={16} className="inline mr-2" />
            {saved ? 'Gemini Key 已設定' : '未設定 Gemini Key'}
          </div>
          <button onClick={() => setEditing(true)} className="text-sm py-2 px-3 bg-white border rounded-lg hover:bg-gray-100">編輯</button>
        </div>
      )}
      {editing && (
        <div className="flex items-center gap-2">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setKey(e.target.value)}
            placeholder="輸入 Gemini API Key"
            className="px-3 py-2 rounded-lg border text-sm"
          />
          <button onClick={handleSave} title="儲存 API Key" className="bg-veggie-green text-white px-3 py-2 rounded-lg inline-flex items-center gap-2"><Check size={16} /> 儲存</button>
          <button onClick={() => { setEditing(false); setKey(getApiKey()); }} title="取消編輯" className="bg-white border px-3 py-2 rounded-lg">取消</button>
          <button onClick={handleClear} title="清除 API Key" className="text-red-600 border px-3 py-2 rounded-lg">清除</button>
        </div>
      )}
    </div>
  );
};

export default ApiKeyManager;
