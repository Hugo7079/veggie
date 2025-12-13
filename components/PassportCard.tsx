import React from 'react';
import { Cookie, Egg, Flame, Fish, Heart, Leaf, Milk, Shuffle, Zap } from 'lucide-react';
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
    <div className="flex items-center gap-2 mb-1.5">
      <div className="w-[52px] text-[12px] font-black text-black/55">{label}</div>
      <progress className={`${styles.progress} ${colorClass}`} value={value} max={100} />
    </div>
  );

  const passportSuffix = getPassportSuffix(agent.id);
  const StampIcon = getStampIcon(agent.id);

  const getPassportLabel = (type: VeggieType): string => {
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

  return (
    <div className="flex flex-col items-center w-full">
      {/* 截圖外層 Wrapper：給予 padding 避免卡片本身的陰影被切掉 */}
      <div className="w-full flex justify-center">
        <div
          ref={ref}
          className={`${agent.color} ${styles.card} w-[540px] h-[340px] rounded-[24px] overflow-hidden relative flex border-4 border-white shadow-xl`}
        >
          <div
            className={`${styles.overlay} ${styles[`pattern_${agent.id}` as keyof typeof styles] ?? ''}`}
            aria-hidden
          />

          <div className="relative flex w-full h-full">
            {/* 左側：角色插畫 + 左上頭像 */}
            <div className="w-[44%] relative p-4">
              <div className="absolute top-4 left-4 w-[74px] h-[74px] rounded-full overflow-hidden border-4 border-white/95 shadow-lg bg-white/90 z-10">
                <img
                  src={userPhoto}
                  alt="User"
                  crossOrigin="anonymous"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="absolute left-4 right-4 top-[74px] bottom-4 flex items-center justify-center">
                <div className="w-[200px] h-[200px] rounded-2xl overflow-hidden bg-white/60 border-[3px] border-white/90 shadow-lg">
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
            <div className="flex-1 flex flex-col pr-5 pl-0 py-4 pb-16">
              {/* 標題列：改成參考圖的兩行，避免 Flow-Pass 斷行 */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[34px] font-black text-black/80 leading-none truncate">
                    {agent.name}
                  </div>
                  <div className="mt-2 text-[20px] font-black text-veggie-green whitespace-nowrap">
                    {agent.title} PASSPORT
                  </div>
                  <div className="mt-1 text-[12px] font-black text-black/55 whitespace-nowrap">
                    {getPassportLabel(agent.id)}
                  </div>
                </div>

                <div className="shrink-0 bg-veggie-green text-white font-black px-5 py-2 rounded-full shadow-lg whitespace-nowrap">
                  Name: {userName}
                </div>
              </div>

              {/* Hashtags */}
              <div className="mt-4 flex flex-wrap gap-3">
                {agent.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-[16px] font-black text-veggie-green bg-white/80 px-5 py-2 rounded-full border-2 border-white/90 shadow-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Ability bars（確保三條都可見） */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Leaf className="text-veggie-green" size={28} strokeWidth={2.5} />
                  <progress className={`${styles.progress} ${styles.progressGreen}`} value={strictness} max={100} />
                </div>
                <div className="flex items-center gap-3">
                  <Heart className="text-amber-600" size={28} strokeWidth={2.5} />
                  <progress className={`${styles.progress} ${styles.progressAmber}`} value={foodieLevel} max={100} />
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="text-red-600" size={28} strokeWidth={2.5} />
                  <progress className={`${styles.progress} ${styles.progressRed}`} value={ecoPower} max={100} />
                </div>
              </div>

              {/* Diet Advice pill */}
              <div className="mt-auto pt-6">
                <div className="relative bg-white/95 rounded-3xl shadow-lg px-8 py-5">
                  <div className="absolute -top-4 left-6 bg-amber-300 text-amber-900 font-black px-5 py-2 rounded-full shadow-sm">
                    Diet Advice
                  </div>
                  <div className="text-center text-[20px] font-black text-veggie-green">
                    「{agent.quote}」
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute right-4 bottom-4 w-[48px] h-[48px] rounded-full bg-white/75 border-[3px] border-white/95 shadow-lg flex items-center justify-center text-black/55 pointer-events-none">
            <StampIcon size={24} strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </div>
  );
  }
);

PassportCard.displayName = 'PassportCard';