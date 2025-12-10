import React, { useState, useRef, useEffect } from 'react';
import { Send, Search, Camera, X, Loader2, RefreshCcw, Image as ImageIcon } from 'lucide-react';
import { AppMode, ChatMessage, VeggieType } from './types';
import { AGENTS } from './data/agents';
import { startAssessment, sendAssessmentMessage, startAgentChat, sendAgentMessage, generatePassportImage } from './services/geminiService';
import { PassportCard } from './components/PassportCard';

// Updated to 5 items as requested
const SUGGESTION_CHIPS = ["食材重複", "好想吃肉", "身體疲憊", "蛋白質不足", "營養不均衡"];

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // --- Logic ---

  const handleStart = async () => {
    if (!userName.trim()) return;
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

  const handlePassportGeneration = async () => {
     if (!userPhoto || !resultType) return;
     
     setIsLoading(true);
     try {
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
    <div className="flex items-center gap-3">
      {/* 左邊 ICON */}
      <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0">
        <svg
          viewBox="0 0 160 160"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          aria-hidden="true"
        >
          {/* 花朵三瓣形狀（橘色） */}
          <g fill="#EDA63A">
            {/* 上方圓瓣 */}
            <circle cx="80" cy="40" r="32" />
            {/* 左右圓瓣 */}
            <circle cx="46" cy="72" r="30" />
            <circle cx="114" cy="72" r="30" />
          </g>

          {/* 綠色葉子 + 桿子 + 叉子本體 */}
          <g fill="#367B63">
            {/* 下方大葉：半橢圓 */}
            <path d="M32 104c0 28 20 48 48 48s48-20 48-48H32z" />
            {/* 桿子 */}
            <rect x="74" y="64" width="12" height="54" rx="6" />
            {/* 叉子頭圓形 */}
            <circle cx="80" cy="60" r="24" />
          </g>

          {/* 用橘色「挖出」三個叉齒縫隙，做出跟原圖很像的叉子形狀 */}
          <g fill="#EDA63A">
            {/* 中間叉齒縫隙稍微長一點 */}
            <rect x="76.5" y="40" width="7" height="28" rx="3.5" />
            <rect x="67" y="42" width="6" height="24" rx="3" />
            <rect x="87" y="42" width="6" height="24" rx="3" />
          </g>
        </svg>
      </div>

      {/* 右邊文字區：植食旅程 + VEGGIE TRAIL */}
      <div className="flex flex-col leading-tight">
        <div className="text-veggie-dark font-black text-xl md:text-2xl tracking-[0.35em]">
          <div>植食</div>
          <div className="mt-1">旅程</div>
        </div>
        <div className="mt-1 text-[10px] md:text-xs font-bold tracking-[0.3em] text-[#3A5306]">
          VEGGIE TRAIL
        </div>
      </div>
    </div>
  );

  const HanHanIllustration = () => (
    <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0">
             {/* Character SVG */}
             <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
                 {/* Body */}
                 <path d="M20 90C20 65 35 55 50 55C65 55 80 65 80 90" fill="black"/>
                 {/* Face */}
                 <circle cx="50" cy="45" r="22" fill="white" stroke="black" strokeWidth="2.5"/>
                 {/* Cap */}
                 <path d="M20 30 L50 15 L80 30 L50 45 Z" fill="white" stroke="black" strokeWidth="2.5" strokeLinejoin="round"/>
                 <line x1="80" y1="30" x2="80" y2="50" stroke="black" strokeWidth="1.5"/>
                 <circle cx="80" cy="52" r="2" fill="black"/>
                 {/* Glasses */}
                 <circle cx="43" cy="46" r="5" stroke="black" strokeWidth="1.5" fill="white"/>
                 <circle cx="57" cy="46" r="5" stroke="black" strokeWidth="1.5" fill="white"/>
                 <path d="M48 46 H52" stroke="black" strokeWidth="1.5"/>
                 {/* Smile */}
                 <path d="M46 55 Q50 58 54 55" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
             </svg>
             {/* Magnifying Glass Accessory */}
             <div className="absolute -top-1 -right-1 bg-white rounded-full p-1.5 border-2 border-black rotate-12 shadow-sm z-10">
                <Search size={16} className="text-black"/>
             </div>
        </div>
        <div className="hidden md:block text-left">
           <h1 className="text-2xl font-black text-veggie-green tracking-wide">哈囉！我是韓韓！</h1>
           <p className="text-sm text-veggie-dark font-bold mt-1 leading-relaxed opacity-90">
             我是你的蔬食小幫手，在你的蔬食之路，<br/>有任何疑惑都可以問我喔！
           </p>
        </div>
    </div>
  );

  const ChatBubble = ({ role, text }: { role: 'user' | 'model', text: string }) => {
    const isModel = role === 'model';
    // Simplified class logic to avoid conflicts
    const bubbleClasses = isModel 
      ? 'bg-veggie-green text-white rounded-tl-sm' 
      : 'bg-white text-veggie-dark border border-gray-200 rounded-tr-sm';

    return (
      <div className={`flex gap-4 mb-8 ${isModel ? 'flex-row' : 'flex-row-reverse'} animate-fade-in`}>
        {/* Avatar - Only for Model */}
        {isModel && (
            <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-veggie-grey border border-gray-300 flex items-center justify-center overflow-hidden">
                   {/* Empty grey circle as per design */}
                </div>
            </div>
        )}
        
        {/* Message Bubble */}
        <div className={`relative px-6 py-5 rounded-2xl max-w-[80%] text-lg leading-relaxed shadow-sm ${bubbleClasses}`}>
           <div className="whitespace-pre-wrap font-medium">{text}</div>
        </div>
      </div>
    );
  };

  // --- Main Render ---

  return (
    <div className="min-h-screen bg-veggie-bg flex flex-col items-center py-4 md:py-8 font-sans">
      
      {/* 1. Header Section */}
      <div className="w-full max-w-5xl px-6 md:px-12 flex justify-between items-start mb-6">
         <HanHanIllustration />
         <VeggieLogo />
      </div>

      {/* 2. Main Card Container */}
      <div className="w-full max-w-5xl flex-1 mx-4 bg-veggie-card border-2 border-[#F0F0E0] rounded-[40px] shadow-soft relative overflow-hidden flex flex-col">
         
         {/* LANDING MODE */}
         {mode === 'LANDING' && (
           <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-10">
              <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center border-4 border-veggie-green shadow-sm animate-bounce">
                 <img src="https://api.iconify.design/lucide:sprout.svg?color=%230E705D" className="w-24 h-24" alt="Sprout" />
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
                           <div className="w-12 h-12 rounded-full bg-veggie-grey border border-gray-300"></div>
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
                     <div className="w-12 h-12 rounded-full bg-veggie-grey opacity-50"></div>
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
            <div className="h-full flex flex-col items-center justify-center p-8 animate-fade-in">
               <PassportCard 
                  generatedImage={generatedPassportUrl}
                  userPhoto={userPhoto}
                  agent={AGENTS[resultType]}
                  userName={userName}
               />
               <button 
                 onClick={() => setMode('RESULT')} 
                 className="mt-8 text-veggie-green font-bold flex items-center gap-2 hover:bg-veggie-chip px-4 py-2 rounded-lg transition-colors"
               >
                  <RefreshCcw size={18} /> 返回對話
               </button>
            </div>
         )}
      </div>

      {/* 3. Footer / Input Area */}
      {(mode === 'ASSESSMENT' || mode === 'RESULT') && (
        <div className="w-full max-w-5xl px-6 md:px-12 pb-2">
           {/* Suggestion Chips - Non-clickable, 5 Items */}
           <div className="flex gap-3 mb-4 overflow-x-auto no-scrollbar pb-1 pl-1">
              {SUGGESTION_CHIPS.map((chip, idx) => (
                 <div 
                   key={idx}
                   className="bg-veggie-chip border border-[#DCE775] text-veggie-dark font-bold px-5 py-3 rounded-xl whitespace-nowrap shadow-sm text-sm md:text-base cursor-default select-none"
                 >
                    {chip}
                 </div>
              ))}
           </div>

           {/* Pill Input Bar */}
           <div className="bg-white border-2 border-gray-100 rounded-full shadow-lg p-2 pl-6 flex items-center relative transition-shadow hover:shadow-xl">
              <input
                 type="text"
                 value={input}
                 onChange={e => setInput(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                 placeholder="好的我知道了！需要特別補充哪些營養和維生素呢？"
                 className="flex-1 bg-transparent focus:outline-none text-veggie-dark placeholder-gray-400 py-3 pr-14 text-base md:text-lg font-medium"
                 disabled={isLoading}
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
                    onClick={() => setMode('RESULT')} 
                    className="absolute top-6 right-6 text-gray-400 hover:text-veggie-dark transition-colors"
                >
                    <X size={32} />
                </button>

                {!userPhoto ? (
                    <div className="space-y-8">
                        <div className="w-24 h-24 mx-auto bg-veggie-green rounded-full flex items-center justify-center shadow-lg">
                            <ImageIcon size={48} className="text-white" />
                        </div>
                        
                        <h2 className="text-3xl font-black text-veggie-dark">
                            請提供一張您的<br/>美美的照片給我吧！
                        </h2>
                        
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-veggie-chip hover:bg-[#E6EE9C] text-veggie-dark font-black text-xl py-5 px-12 rounded-2xl cursor-pointer transition-all shadow-md hover:scale-105 active:scale-95 inline-block"
                        >
                            上傳照片
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
            </div>
        </div>
      )}

    </div>
  );
};

export default App;