import React, { useRef, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { AgentProfile } from '../types';

interface PassportCardProps {
  generatedImage: string; // The AI generated background (template)
  userPhoto: string;      // The user's uploaded photo
  agent: AgentProfile;
  userName: string;
}

export const PassportCard: React.FC<PassportCardProps> = ({ generatedImage, userPhoto, agent, userName }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current || isDownloading) return;
    setIsDownloading(true);

    try {
      // Use html2canvas to capture the composed DOM element
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true, // Important for loading images
        scale: 2,      // Higher resolution
        backgroundColor: null,
      });

      const link = document.createElement('a');
      link.download = `Veggie_Passport_${agent.id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error("Download failed:", error);
      alert("下載失敗，請重試");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 w-full">
      
      {/* 
        COMPOSITION AREA 
        This div is what gets screenshotted.
        It layers the AI Background + User Photo + Text.
      */}
      <div 
        ref={cardRef}
        className="relative w-[320px] aspect-[3/4] rounded-[24px] overflow-hidden shadow-2xl bg-white border-4 border-white"
        style={{
            // Fallback color if image loads slow
            backgroundColor: agent.color.replace('bg-', '') 
        }}
      >
        {/* Layer 1: AI Generated Background (Template) */}
        <img 
            src={generatedImage} 
            alt="Background" 
            className="absolute inset-0 w-full h-full object-cover z-0"
        />

        {/* Layer 2: Overlay Content */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-between p-6">
            
            {/* Top Section: User Photo - Centered */}
            <div className="flex justify-center pt-4">
                <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-white shadow-md bg-white rotate-[-3deg]">
                    <img 
                        src={userPhoto} 
                        alt="User" 
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>

            {/* Bottom Section: Text Info - Full Width */}
            <div className="bg-white/90 backdrop-blur-sm p-5 rounded-xl shadow-lg border-2 border-gray-100 flex flex-col gap-3 w-full relative">
                 {/* Badge/Title */}
                 <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-veggie-green text-white px-4 py-1 rounded-full text-xs font-black tracking-widest shadow-sm">
                    {agent.title}
                 </div>

                 <div className="flex flex-col text-center">
                    <h2 className="text-2xl font-black text-veggie-dark leading-none">{agent.name}</h2>
                    <p className="text-sm font-bold text-gray-500 mt-2">{userName}</p>
                 </div>

                 <hr className="border-gray-200" />
                 
                 <p className="text-sm font-medium text-veggie-green italic text-center">
                    "{agent.quote}"
                 </p>

                 {/* Hashtags */}
                 <div className="flex flex-wrap gap-2 justify-center pt-1">
                    {agent.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                            {tag}
                        </span>
                    ))}
                 </div>
            </div>
        </div>
      </div>

      <button 
        onClick={handleDownload}
        disabled={isDownloading}
        className="flex items-center gap-2 bg-[#0E705D] text-white px-8 py-3 rounded-full font-bold shadow-xl hover:scale-105 transition-transform active:scale-95 disabled:opacity-50"
      >
        {isDownloading ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
        下載通行證
      </button>
    </div>
  );
};