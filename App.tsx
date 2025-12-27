import React, { useState, useRef, useEffect, memo } from 'react';
import { Send, Search, Camera, X, Loader2, RefreshCcw, Image as ImageIcon, Download } from 'lucide-react';
import { toPng } from 'html-to-image';
import { AppMode, ChatMessage, VeggieType } from './types';
import { AGENTS } from './data/agents';
import { startAssessment, sendAssessmentMessage, startAgentChat, sendAgentMessage, generatePassportImage, isApiKeyPresent } from './services/geminiService';
import { PassportCard } from './components/PassportCard';
import ApiKeyManager from './components/ApiKeyManager';

// Extract ChatBubble outside App to prevent re-renders
const ChatBubble = memo(({ role, text }: { role: 'user' | 'model', text: string }) => {
  const isModel = role === 'model';
  const bubbleClasses = isModel 
    ? 'bg-veggie-green text-white rounded-tl-sm' 
    : 'bg-white text-veggie-dark border border-gray-200 rounded-tr-sm';

  return (
    <div className={`flex gap-4 mb-8 ${isModel ? 'flex-row' : 'flex-row-reverse'}`}>
      {isModel && (
        <div className="flex-shrink-0">
          <img src="./hanhan_head.png" alt="韓韓" className="w-12 h-12 rounded-full border border-gray-300 object-cover" />
        </div>
      )}
      <div className={`relative px-6 py-5 rounded-2xl max-w-[80%] text-lg leading-relaxed shadow-sm ${bubbleClasses}`}>
        <div className="whitespace-pre-wrap font-medium">{text}</div>
      </div>
    </div>
  );
});

ChatBubble.displayName = 'ChatBubble';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('LANDING');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resultType, setResultType] = useState<VeggieType | null>(null);
  const [userName, setUserName] = useState('');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [generatedPassportUrl, setGeneratedPassportUrl] = useState<string | null>(null);
  const [agentChatSession, setAgentChatSession] = useState<any>(null);
  const [isPassportDownloading, setIsPassportDownloading] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const passportRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // 在進入聊天模式時自動聚焦輸入框
  useEffect(() => {
    if ((mode === 'ASSESSMENT' || mode === 'RESULT')) {
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.click();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [mode]);

  // 允許使用者「直接打字」就輸入到對話框（不需要先點 input）
  useEffect(() => {
    if (!(mode === 'ASSESSMENT' || mode === 'RESULT')) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const active = document.activeElement as HTMLElement | null;
      const tag = active?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || (active && active.isContentEditable)) return;

      // 如果目前不在輸入框，將輸入導向到底部對話框（包含第一個字，不要被吃掉）
      if (e.key.length === 1) {
        e.preventDefault();
        inputRef.current?.focus();
        setInput((prev) => prev + e.key);
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        inputRef.current?.focus();
        setInput((prev) => prev.slice(0, -1));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mode]);

  const handlePassportDownload = async () => {
    if (!passportRef.current || !resultType || isPassportDownloading) return;
    setIsPassportDownloading(true);
    try {
      // 等字體與圖片穩定，避免下載與畫面不同
      const fonts = (document as any).fonts;
      if (fonts?.ready) await fonts.ready;

      const images = passportRef.current.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map(async (img) => {
          const el = img as HTMLImageElement;
          try {
            if (el.decode) await el.decode();
          } catch {
            // ignore
          }
        })
      );

      const node = passportRef.current;
      const width = Math.round(node.offsetWidth);
      const height = Math.round(node.offsetHeight);
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 3,
        width,
        height,
      });

      const link = document.createElement('a');
      link.download = `Veggie_Passport_${AGENTS[resultType].id}_${userName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Passport download failed:', e);
      alert('下載失敗，請再試一次');
    } finally {
      setIsPassportDownloading(false);
    }
  };

  // --- Logic ---

  const handleStart = async () => {
    if (!userName.trim()) return;
    if (!isApiKeyPresent()) {
      alert('請先在右上方輸入 Gemini API Key 才能開始測驗，或在本機建立 .env.local，將 GEMINI_API_KEY 放入其中。');
      return;
    }
    setMode('ASSESSMENT');
    setIsLoading(true);
    try {
      const text = await startAssessment(userName);
      setMessages([{ id: 'init', role: 'model', text }]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const textToSend = input;
    if (!textToSend.trim() || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: textToSend }]);
    setIsLoading(true);

    try {
      let response = '';
      if (mode === 'ASSESSMENT') {
        response = await sendAssessmentMessage(textToSend);
        const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
            const result = JSON.parse(jsonMatch[1]);
            setResultType(result.type as VeggieType);
            setMode('RESULT');
            initAgentChat(result.type);
            return;
        }
      } else if (mode === 'RESULT') {
        response = await sendAgentMessage(agentChatSession, textToSend);
      }
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: response }]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const initAgentChat = async (type: string) => {
    try {
       const { chat, initialText } = await startAgentChat(type, []);
       setAgentChatSession(chat);
       setMessages([{ id: 'agent-init', role: 'model', text: initialText }]);
    } catch (e) { console.error(e); }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => setUserPhoto(ev.target?.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      setCameraStream(stream);
      setIsCameraActive(true);
      
      // 等待一會兒讓 videoRef 更新
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error('無法訪問相機:', err);
      alert('無法開啟相機，請檢查相機權限或使用上傳照片功能。');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setUserPhoto(dataUrl);
        stopCamera();
      }
    }
  };

  // 清理相機資源
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleReset = () => {
    stopCamera();
    setMode('LANDING');
    setMessages([]);
    setInput('');
    setIsLoading(false);
    setResultType(null);
    setUserName('');
    setUserPhoto(null);
    setGeneratedPassportUrl(null);
    setAgentChatSession(null);
    setIsCameraActive(false);
  };

  const handlePassportGeneration = async () => {
     if (!userPhoto || !resultType) return;
     
     setIsLoading(true);
     try {
        if (!isApiKeyPresent()) {
          alert('請先在右上方輸入 Gemini API Key 才能產生通行證。');
          setIsLoading(false);
          return;
        }
        const agent = AGENTS[resultType];
        const imageUrl = await generatePassportImage(userPhoto, agent, userName);
        setGeneratedPassportUrl(imageUrl);
        setMode('PASSPORT');
     } catch (e) {
        console.error("Passport Generation Failed", e);
        alert("生成通行證失敗，請稍後再試！");
     } finally {
        setIsLoading(false);
     }
  };

  // --- Visual Components ---

  const VeggieLogo: React.FC = () => (
    <div className="flex items-center">
      <img src="./logo.png" alt="Veggie Trail Logo" className="h-20 md:h-24" />
    </div>
  );

  const HanHanIllustration = () => (
    <div className="flex items-center gap-4">
        <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0">
             <img src="./hanhan.png" alt="韓韓" className="w-full h-full object-contain drop-shadow-sm" />
        </div>
        <div className="hidden md:block text-left">
           <h1 className="text-2xl font-black text-veggie-green tracking-wide">哈囉！我是韓韓！</h1>
           <p className="text-sm text-veggie-dark font-bold mt-1 leading-relaxed opacity-90">
             我是你的蔬食小幫手，在你的蔬食之路，<br/>有任何疑惑都可以問我喔！
           </p>
        </div>
    </div>
  );

  // --- Main Render ---

  return (
    <div className="h-screen bg-veggie-bg flex flex-col items-center py-4 md:py-8 font-sans overflow-hidden">
      
      {/* 1. Header Section */}
      <div className="w-full max-w-5xl px-6 md:px-12 flex justify-between items-start mb-6 relative flex-shrink-0">
         <HanHanIllustration />
         <div className="flex items-center gap-4">
           {/* Reset Button - only show in chat modes */}
           {(mode === 'ASSESSMENT' || mode === 'RESULT' || mode === 'PASSPORT' || mode === 'PASSPORT_UPLOAD') && (
             <button
               onClick={handleReset}
               className="bg-white text-veggie-green font-black px-6 py-3 rounded-xl border-2 border-veggie-green hover:bg-veggie-chip transition-all shadow-md hover:scale-105 active:scale-95 flex items-center gap-2"
               title="重新開始"
             >
               <RefreshCcw size={20} />
               重新開始
             </button>
           )}
           {/* API Key Manager to the left of logo */}
           <ApiKeyManager />
           <VeggieLogo />
         </div>
      </div>

      {/* 2. Main Card Container */}
      <div className="w-full max-w-5xl flex-1 mx-4 bg-veggie-card border-2 border-[#F0F0E0] rounded-[40px] shadow-soft relative overflow-hidden flex flex-col min-h-0">
         
         {/* LANDING MODE */}
         {mode === 'LANDING' && (
           <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-10">
              <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center border-4 border-veggie-green shadow-sm animate-bounce flex-shrink-0">
                 <img src="https://api.iconify.design/lucide:sprout.svg?color=%230E705D" className="w-24 h-24 object-contain" alt="Sprout" />
              </div>
              <div className="space-y-4">
                  <h2 className="text-3xl md:text-4xl font-black text-veggie-dark tracking-wide">
                    準備好開始你的<br/>
                    <span className="text-veggie-green">蔬食旅程</span>了嗎？
                  </h2>
              </div>
              
              <div className="w-full max-w-sm space-y-4">
                <input
                    type="text"
                    value={userName}
                    onChange={e => setUserName(e.target.value)}
                    placeholder="請輸入你的名字"
                    className="w-full bg-white border-2 border-veggie-green rounded-2xl px-6 py-4 text-xl text-center text-veggie-dark placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-veggie-chip transition-all"
                />
                <button 
                    onClick={handleStart}
                    className="w-full bg-veggie-green text-white text-xl font-black py-4 rounded-2xl shadow-lg hover:bg-[#0B5C4D] hover:scale-[1.02] transition-all active:scale-95"
                >
                    開始對話
                </button>
              </div>
           </div>
         )}

         {/* CHAT MODE */}
         {(mode === 'ASSESSMENT' || mode === 'RESULT') && (
            <div className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth no-scrollbar">
               {messages.map((msg) => (
                  <ChatBubble key={msg.id} role={msg.role} text={msg.text} />
               ))}
               
               {/* Passport Prompt inside Chat Flow */}
               {mode === 'RESULT' && !userPhoto && (
                   <div className="flex gap-4 mb-8 animate-fade-in">
                       <div className="flex-shrink-0">
                           <img src="./hanhan_head.png" alt="韓韓" className="w-12 h-12 rounded-full border border-gray-300 object-cover" />
                       </div>
                       <div className="bg-veggie-green text-white px-6 py-6 rounded-2xl rounded-tl-sm max-w-[80%] shadow-sm space-y-6">
                           <p className="font-bold text-lg">您是否要生成您專屬的蔬別通行證？</p>
                           <div className="flex gap-3 flex-wrap">
                               <button 
                                 onClick={() => setMode('PASSPORT_UPLOAD')} 
                                 className="bg-veggie-chip text-veggie-dark font-black px-8 py-3 rounded-xl hover:bg-[#E6EE9C] hover:scale-105 transition-all shadow-sm"
                               >
                                 好！我要！
                               </button>
                               {/* The "Choice is Illusion" Button - Styled Identically */}
                               <button 
                                 onClick={() => setMode('PASSPORT_UPLOAD')}
                                 className="bg-veggie-chip text-veggie-dark font-black px-8 py-3 rounded-xl hover:bg-[#E6EE9C] hover:scale-105 transition-all shadow-sm"
                               >
                                 不管！你就是要！
                               </button>
                           </div>
                       </div>
                   </div>
               )}

               {isLoading && (
                  <div className="flex gap-4 mb-8">
                     <img src="./hanhan_head.png" alt="韓韓" className="w-12 h-12 rounded-full border border-gray-300 object-cover opacity-50" />
                     <div className="bg-veggie-green px-6 py-4 rounded-2xl rounded-tl-sm flex items-center">
                        <Loader2 className="animate-spin text-white w-6 h-6" />
                     </div>
                  </div>
               )}
               <div ref={messagesEndRef} />
            </div>
         )}

         {/* PASSPORT DISPLAY (DOM Composed) */}
         {mode === 'PASSPORT' && generatedPassportUrl && resultType && userPhoto && (
            <div className="h-full flex flex-col items-center justify-center p-6 md:p-10">
              <div className="pb-4" />
              <PassportCard
                ref={passportRef}
                generatedImage={generatedPassportUrl}
                userPhoto={userPhoto}
                agent={AGENTS[resultType]}
                userName={userName}
              />

              {/* 下載/返回 左右並排，不需要滾動 */}
              <div className="mt-6 w-[540px] flex justify-between items-center">
                <button
                  onClick={handlePassportDownload}
                  disabled={isPassportDownloading}
                  className="bg-veggie-green text-white font-black px-8 py-4 rounded-2xl flex items-center gap-3 hover:bg-[#0B5C4D] transition-all shadow-lg disabled:opacity-60"
                >
                  {isPassportDownloading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} /> 下載中...
                    </>
                  ) : (
                    <>
                      <Download size={20} /> 下載通行證
                    </>
                  )}
                </button>

                <button
                  onClick={() => setMode('RESULT')}
                  className="bg-white text-veggie-green font-black px-8 py-4 rounded-2xl flex items-center gap-3 border-2 border-veggie-green hover:bg-veggie-chip transition-all shadow-lg"
                >
                  <RefreshCcw size={20} /> 返回聊天
                </button>
              </div>
            </div>
         )}
      </div>

      {/* 3. Footer / Input Area */}
      {(mode === 'ASSESSMENT' || mode === 'RESULT') && (
        <div className="w-full max-w-5xl px-6 md:px-12 pb-2">
           {/* Pill Input Bar */}
           <div className="bg-white border-2 border-gray-100 rounded-full shadow-lg p-2 pl-6 flex items-center relative transition-shadow hover:shadow-xl">
              <input
                 ref={inputRef}
                 type="text"
                 value={input}
                 onChange={e => setInput(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                 onClick={() => inputRef.current?.focus()}
                 onFocus={() => inputRef.current?.focus()}
                 placeholder="好的我知道了！需要特別補充哪些營養和維生素呢？"
                 className="flex-1 bg-transparent focus:outline-none text-veggie-dark placeholder-gray-400 py-3 pr-14 text-base md:text-lg font-medium"
                 disabled={isLoading}
                 autoFocus
              />
              <button 
                 onClick={handleSubmit}
                 disabled={!input.trim() || isLoading}
                 className="absolute right-2 top-1/2 -translate-y-1/2 bg-veggie-green text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-[#0B5C4D] disabled:opacity-50 disabled:hover:bg-veggie-green transition-all shadow-md active:scale-95"
              >
                 <Send size={24} className="-ml-1" />
              </button>
           </div>
        </div>
      )}

      {/* 4. Passport Upload Modal */}
      {mode === 'PASSPORT_UPLOAD' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#FEFCE8] w-full max-w-xl rounded-[32px] p-10 shadow-2xl relative animate-fade-in border-4 border-veggie-green text-center">
                <button 
                    onClick={() => {
                      stopCamera();
                      setMode('RESULT');
                    }} 
                    className="absolute top-6 right-6 text-gray-400 hover:text-veggie-dark transition-colors"
                >
                    <X size={32} />
                </button>

                {!userPhoto && !isCameraActive ? (
                    <div className="space-y-8">
                        <div className="w-24 h-24 mx-auto bg-veggie-green rounded-full flex items-center justify-center shadow-lg">
                            <ImageIcon size={48} className="text-white" />
                        </div>
                        
                        <h2 className="text-3xl font-black text-veggie-dark">
                            請提供一張您的<br/>美美的照片給我吧！
                        </h2>
                        
                        <div className="flex flex-col gap-4">
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-veggie-chip hover:bg-[#E6EE9C] text-veggie-dark font-black text-xl py-5 px-12 rounded-2xl cursor-pointer transition-all shadow-md hover:scale-105 active:scale-95"
                            >
                                上傳照片
                            </div>
                            
                            <div 
                                onClick={startCamera}
                                className="bg-veggie-green hover:bg-[#0B5C4D] text-white font-black text-xl py-5 px-12 rounded-2xl cursor-pointer transition-all shadow-md hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
                            >
                                <Camera size={24} />
                                使用相機拍照
                            </div>
                        </div>
                    </div>
                ) : isCameraActive ? (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-black text-veggie-dark">對準鏡頭並拍照</h2>
                        
                        <div className="relative w-full max-w-md mx-auto rounded-2xl overflow-hidden border-4 border-veggie-green shadow-xl bg-black">
                            <video 
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full h-auto"
                            />
                        </div>
                        
                        <div className="flex gap-4 justify-center">
                            <button 
                                onClick={capturePhoto}
                                className="bg-veggie-green text-white font-black text-xl py-4 px-8 rounded-2xl shadow-lg hover:bg-[#0B5C4D] hover:scale-105 transition-transform flex items-center gap-3"
                            >
                                <Camera size={24} />
                                拍照
                            </button>
                            
                            <button 
                                onClick={stopCamera}
                                className="bg-gray-500 text-white font-black text-xl py-4 px-8 rounded-2xl shadow-lg hover:bg-gray-600 hover:scale-105 transition-transform"
                            >
                                取消
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                         <h2 className="text-2xl font-black text-veggie-dark">預覽照片</h2>
                         <div className="w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-veggie-green shadow-xl">
                            <img src={userPhoto} className="w-full h-full object-cover" alt="Preview" />
                         </div>
                         {/* Trigger Generation */}
                         <button 
                            onClick={handlePassportGeneration}
                            disabled={isLoading}
                            className="bg-veggie-green text-white font-black text-xl py-4 px-12 rounded-2xl shadow-lg hover:bg-[#0B5C4D] hover:scale-105 transition-transform w-full flex items-center justify-center gap-3 disabled:opacity-50"
                         >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" />
                                    生成中...
                                </>
                            ) : (
                                "確認開始生成"
                            )}
                         </button>
                         <button 
                            onClick={() => setUserPhoto(null)}
                            disabled={isLoading}
                            className="text-gray-400 font-bold hover:text-veggie-dark underline decoration-2 underline-offset-4 disabled:opacity-50"
                         >
                             重新上傳
                         </button>
                    </div>
                )}
                
                <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
                <canvas ref={canvasRef} className="hidden" />
            </div>
        </div>
      )}

    </div>
  );
};

export default App;