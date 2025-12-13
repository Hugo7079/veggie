import React from 'react';
import { Cookie, Egg, Flame, Fish, Leaf, Milk, Shuffle } from 'lucide-react';
import { AgentProfile, VeggieType } from '../types';

import styles from './PassportCard.module.css';

interface PassportCardProps {
  generatedImage: string; // 素食角色的圖片
  userPhoto: string;      // 使用者的照片
  agent: AgentProfile;
  userName: string;
}

export const PassportCard = React.forwardRef<HTMLDivElement, PassportCardProps>(
  ({ generatedImage, userPhoto, agent, userName }, ref) => {

  const getPassportSuffix = (type: VeggieType): string => {
    switch (type) {
      case 'VEGAN':
        return 'V-Pass';
      case 'LACTO_OVO':
        return 'Classic-Pass';
      case 'FIVE_PUNGENT':
        return 'Spicy-Pass';
      case 'PESCATARIAN':
        return 'Ocean-Pass';
      case 'FLEXITARIAN':
        return 'Flow-Pass';
      case 'LACTO':
        return 'Milky-Pass';
      case 'OVO':
        return 'Sunny-Pass';
      default:
        return 'Pass';
    }
  };

  const getStampIcon = (type: VeggieType) => {
    switch (type) {
      case 'VEGAN':
        return Leaf;
      case 'LACTO_OVO':
        return Cookie;
      case 'LACTO':
        return Milk;
      case 'OVO':
        return Egg;
      case 'PESCATARIAN':
        return Fish;
      case 'FLEXITARIAN':
        return Shuffle;
      case 'FIVE_PUNGENT':
        return Flame;
      default:
        return Leaf;
    }
  };
  
  // 生成假的能力值 (為了視覺效果)
  const getRandomValue = (seed: number) => 50 + (seed % 50); 
  const strictness = getRandomValue(agent.name.length * 7);
  const foodieLevel = getRandomValue(agent.name.length * 3);
  const ecoPower = getRandomValue(agent.name.length * 9);

  const renderAbilityBar = (
    label: string,
    value: number,
    colorClass: string
  ) => (
    <div className="flex items-center gap-2 mb-1">
      <div className="w-[48px] text-[11px] font-black text-black/55 leading-none">{label}</div>
      <progress className={`${styles.progress} ${colorClass}`} value={value} max={100} />
    </div>
  );

  const passportSuffix = getPassportSuffix(agent.id);
  const StampIcon = getStampIcon(agent.id);

  return (
    <div className="flex flex-col items-center w-full">
      {/* 截圖外層 Wrapper：給予 padding 避免卡片本身的陰影被切掉 */}
      <div className="w-full flex justify-center">
        <div
          ref={ref}
          className={`${agent.color} ${styles.card} w-[540px] h-[320px] rounded-[24px] overflow-hidden relative flex border-4 border-white shadow-xl`}
        >
          <div
            className={`${styles.overlay} ${styles[`pattern_${agent.id}` as keyof typeof styles] ?? ''}`}
            aria-hidden
          />

          <div className="relative flex w-full h-full">
            {/* 左側：角色插畫 + 左上頭像 */}
            <div className="w-[44%] relative p-4">
              <div className="absolute top-6 left-6 w-[120px] h-[120px] rounded-full overflow-hidden border-4 border-white/95 shadow-xl bg-white/90 z-20">
                <img
                  src={userPhoto}
                  alt="User"
                  crossOrigin="anonymous"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="absolute left-4 right-4 top-[78px] bottom-4 flex items-center justify-center">
                <div className="w-[190px] h-[190px] rounded-2xl overflow-hidden bg-white/60 border-[3px] border-white/90 shadow-lg">
                  <img
                    src={generatedImage}
                    alt="Agent"
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* 右側：文字欄 */}
            <div className="flex-1 flex flex-col px-4 py-3 pl-3">
              <div className="mb-2">
                <div
                  className={`font-black text-black/80 leading-tight whitespace-nowrap overflow-hidden text-ellipsis ${
                    agent.id === 'FLEXITARIAN' ? 'text-[16px]' : 'text-[17px]'
                  }`}
                  title={`${agent.title} (${agent.id}) ${passportSuffix}`}
                >
                  {agent.title} ({agent.id}) {passportSuffix}
                </div>
                <div className="text-[11px] font-black text-black/55 mt-1 whitespace-nowrap overflow-hidden text-ellipsis">
                  Name: {userName}
                </div>
              </div>

              <div className="flex-1 bg-white/60 border-2 border-white/90 rounded-2xl px-3 py-2 shadow-sm min-h-0">
                <div className="text-[11px] font-black text-black/70 mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
                  Type: {agent.title} ({agent.id})
                </div>
                <div className={`text-[11px] font-extrabold text-black/65 mb-1.5 leading-snug ${styles.clamp2}`}>
                  Traits: {agent.description}
                </div>

                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {agent.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-[11px] font-black text-black/65 bg-white/75 px-2 py-0.5 rounded-full border border-black/5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="text-[11px] font-black text-black/70 mb-1">
                  Quote: <span className="font-extrabold text-black/65">「{agent.quote}」</span>
                </div>
                <div className={`text-[11px] font-black text-black/70 leading-snug ${styles.clamp2}`}>
                  Diet Advice: <span className="font-extrabold text-black/65">{agent.advice}</span>
                </div>
              </div>

              <div className="mt-2">
                {renderAbilityBar('嚴謹度', strictness, styles.progressGreen)}
                {renderAbilityBar('美食力', foodieLevel, styles.progressAmber)}
                {renderAbilityBar('行動力', ecoPower, styles.progressRed)}
              </div>
            </div>
          </div>

          <div className="absolute right-4 top-4 w-[50px] h-[50px] rounded-full bg-white/75 border-[3px] border-white/95 shadow-lg flex items-center justify-center text-black/55">
            <StampIcon size={26} strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </div>
  );
  }
);

PassportCard.displayName = 'PassportCard';