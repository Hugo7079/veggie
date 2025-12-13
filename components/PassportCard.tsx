import React from 'react';
import { Leaf, Heart, Zap } from 'lucide-react';
import { AgentProfile } from '../types';

interface PassportCardProps {
  generatedImage: string; // 素食角色的圖片
  userPhoto: string;      // 使用者的照片
  agent: AgentProfile;
  userName: string;
}

export const PassportCard = React.forwardRef<HTMLDivElement, PassportCardProps>(
  ({ generatedImage, userPhoto, agent, userName }, ref) => {

  const getColorValue = (colorClass: string): string => {
    // 這裡定義底色，背景圖案會疊加在這些顏色上
    const colorMap: Record<string, string> = {
      'bg-[#DCFCE7]': '#dcfce7', // 綠 (純素)
      'bg-[#FEF9C3]': '#fff7ad', // 黃 (蛋奶)
      'bg-[#E0F2FE]': '#cceaff', // 藍 (魚素)
      'bg-[#FFEDD5]': '#ffd8a8', // 橘 (五辛)
      'bg-[#DBEAFE]': '#dbeafe',
      'bg-[#F3E8FF]': '#e9d5ff',
      'bg-[#FEE2E2]': '#ffcdd2',
    };
    return colorMap[colorClass] || '#DCFCE7';
  };

  const bgColor = getColorValue(agent.color);
  
  // 生成假的能力值 (為了視覺效果)
  const getRandomValue = (seed: number) => 50 + (seed % 50); 
  const strictness = getRandomValue(agent.name.length * 7);
  const foodieLevel = getRandomValue(agent.name.length * 3);
  const ecoPower = getRandomValue(agent.name.length * 9);

  // 渲染能力條的小元件 (樣式優化：更粗、更可愛)
  const renderAbilityBar = (label: string, value: number, icon: React.ReactNode, barColor: string) => (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px', width: '100%' }}>
      <div style={{ marginRight: '8px', color: '#555', display: 'flex', alignItems: 'center' }}>{icon}</div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ width: '100%', height: '10px', backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: '5px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ width: `${value}%`, height: '100%', backgroundColor: barColor, borderRadius: '5px' }} />
        </div>
      </div>
    </div>
  );

  // 通用的可愛字體堆疊
  const cuteFontFamily = '"Arial Rounded MT Bold", "Comic Sans MS", "Microsoft JhengHei", sans-serif';

  return (
    <div className="flex flex-col items-center w-full">
      {/* 截圖外層 Wrapper：給予 padding 避免卡片本身的陰影被切掉 */}
      <div style={{ padding: '0px', width: '100%', display: 'flex', justifyContent: 'center' }}> 
        <div 
          ref={ref}
          style={{
            width: '540px',
            height: '340px',
            backgroundColor: bgColor,
            borderRadius: '24px',
            overflow: 'hidden',
            fontFamily: cuteFontFamily,
            lineHeight: '1.3', 
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.15)',
            position: 'relative',
            display: 'flex',
            border: '4px solid white',
            flexShrink: 0,
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale'
          }}
        >
          {/* === 背景豐富化 === */}
          {/* 這一層疊加了通用的可愛波點和光暈效果 */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            opacity: 0.15, pointerEvents: 'none',
            backgroundImage: `
                radial-gradient(circle at 20% 30%, rgba(255,255,255,0.8) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(255,255,255,0.6) 0%, transparent 40%),
                radial-gradient(rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 100% 100%, 20px 20px' // 最後一個控制波點密度
          }} />

          {/* === 左側區域：照片 === */}
          <div style={{ 
            width: '40%', 
            position: 'relative', 
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            padding: '20px',
            borderRight: '3px dashed rgba(255,255,255,0.4)'
          }}>
            {/* 照片容器，用於定位 */}
            <div style={{ position: 'relative', width: '140px', height: '140px' }}>
                {/* 使用者照片 (大圓) */}
                <div style={{ 
                  width: '100%', height: '100%', 
                  borderRadius: '50%', overflow: 'hidden', 
                  border: '5px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  backgroundColor: '#fff'
                }}>
                  <img src={userPhoto} alt="User" crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                
                {/* === 角色照片 (修改位置到右下角) === */}
                <div style={{
                    position: 'absolute',
                    bottom: '-15px', // 稍微突出邊界
                    right: '-15px',  // 稍微突出邊界
                    width: '80px',
                    height: '80px',
                    zIndex: 10,
                    borderRadius: '50%',
                    border: '4px solid white', // 加上白邊讓它跳出來
                    backgroundColor: '#fff',
                    overflow: 'hidden',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                }}>
                    <img src={generatedImage} alt="Agent" crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
            </div>
          </div>

          {/* === 右側區域：文字資訊 === */}
          <div style={{ 
            flex: 1, 
            padding: '24px 28px 24px 16px', 
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
          }}>
            
            {/* Header */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                        {/* 強制 margin: 0 避免跑版 */}
                        <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 900, color: '#1F2937', lineHeight: 1.1 }}>
                            {agent.name}
                        </h2>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#059669', letterSpacing: '1px' }}>
                           {agent.title.toUpperCase()} PASSPORT
                        </span>
                    </div>
                    {/* 使用者名稱泡泡 */}
                    <div style={{ 
                        backgroundColor: '#0E705D', padding: '6px 14px', borderRadius: '20px', 
                        fontSize: '12px', fontWeight: 'bold', color: 'white', whiteSpace: 'nowrap',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        Name: {userName}
                    </div>
                </div>

                {/* Hashtags (可愛泡泡樣式) */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                {agent.tags.map(tag => (
                    <span key={tag} style={{ 
                    fontSize: '11px', color: '#0E705D', backgroundColor: 'rgba(255,255,255,0.85)', 
                    padding: '4px 10px', borderRadius: '12px', fontWeight: 700,
                    border: '1px solid rgba(14, 112, 93, 0.2)'
                    }}>
                    {tag}
                    </span>
                ))}
                </div>

                {/* Ability Bars (更粗更清楚) */}
                <div style={{ marginBottom: '12px' }}>
                    {renderAbilityBar('嚴謹度', strictness, <Leaf size={16} strokeWidth={2.5} color="#059669"/>, '#10B981')}
                    {renderAbilityBar('美食力', foodieLevel, <Heart size={16} strokeWidth={2.5} color="#D97706" />, '#F59E0B')}
                    {renderAbilityBar('行動力', ecoPower, <Zap size={16} strokeWidth={2.5} color="#DC2626" />, '#EF4444')}
                </div>
            </div>

            {/* Footer: Diet Advice (獨立區塊樣式) */}
            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.9)', 
              padding: '8px 12px', 
              borderRadius: '12px',
              fontSize: '11px',
              position: 'relative',
              border: '2px solid rgba(255,255,255,1)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
            }}>
              <div style={{ 
                  position: 'absolute', top: '-10px', left: '12px',
                  backgroundColor: '#FCD34D', color: '#78350F',
                  fontSize: '10px', fontWeight: 900, padding: '2px 8px', borderRadius: '8px'
              }}>
                  Diet Advice
              </div>
              {/* 明確設定 margin 和 line-height */}
              <p style={{ 
                color: '#059669', fontWeight: 'bold',
                fontStyle: 'italic', margin: '4px 0 0 0', lineHeight: '1.4', textAlign: 'center'
              }}>
                「{agent.quote}」
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  }
);

PassportCard.displayName = 'PassportCard';