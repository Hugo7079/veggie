import { AgentProfile } from "../types";

export const AGENTS: Record<string, AgentProfile> = {
  VEGAN: {
    id: 'VEGAN',
    name: '芽菜女孩',
    title: '純素',
    description: '嚴謹的成分偵探。對動物的愛爆棚，是行走的環境雷達。',
    color: 'bg-[#DCFCE7]', // Light Green
    textColor: 'text-[#14532D]',
    quote: '未來是綠色的！',
    soulFood: ['營養酵母', '天貝', '亞麻籽油'],
    advice: '維生素 B12 是我們的命門，別以為靠曬太陽就夠了，記得補充喔！',
    tags: ['#純素', '#環保', '#愛動物'],
    iconName: 'Leaf',
    visualDescription: 'A cute, energetic bean sprout character wearing a futuristic space suit, vibrant green theme',
    colorDescription: 'Fresh Light Green and White'
  },
  LACTO_OVO: {
    id: 'LACTO_OVO',
    name: '奶香起司犬',
    title: '蛋奶素',
    description: '快樂的烘焙鄰居。哪裡有奶香味，他就瞬間瞬移到那裡。',
    color: 'bg-[#FEF9C3]', // Light Yellow
    textColor: 'text-[#854D0E]',
    quote: '再來一塊蛋糕吧！',
    soulFood: ['歐姆蛋', '希臘優格', '起司'],
    advice: '雖然甜點很療癒，但膽固醇不會因為吃素就放過我們，多吃點深色蔬菜吧！',
    tags: ['#烘焙', '#蛋奶', '#快樂'],
    iconName: 'Cookie',
    visualDescription: 'A chubby, happy Shiba Inu dog character holding a cheese shield and an egg sword',
    colorDescription: 'Warm Yellow and Cream'
  },
  LACTO: {
    id: 'LACTO',
    name: '牧草乳牛',
    title: '奶素',
    description: '溫柔的拿鐵控。散步、喝牛奶、冥想三件事缺一不可。',
    color: 'bg-[#E0F2FE]', // Light Blue
    textColor: 'text-[#075985]',
    quote: '自然的流動，即是美味。',
    soulFood: ['帕尼爾乳酪', '鷹嘴豆', '薑黃奶'],
    advice: '牛奶雖好，但不能當水喝。記得飯後吃點維生素 C 水果幫助鐵質吸收。',
    tags: ['#拿鐵控', '#溫柔', '#奶製品'],
    iconName: 'Milk',
    visualDescription: 'A gentle, zen cow character doing yoga in a meditation pose, soft blue theme',
    colorDescription: 'Soft Blue and Pastel White'
  },
  OVO: {
    id: 'OVO',
    name: '活力蛋寶',
    title: '蛋素',
    description: '挑惕的健身教練。覺得沒有蛋就人格不完整，蛋白質精算師。',
    color: 'bg-[#FFEDD5]', // Orange tint
    textColor: 'text-[#9A3412]',
    quote: '這道菜加顆蛋才完美！',
    soulFood: ['水煮蛋', '板豆腐', '毛豆'],
    advice: '沒有牛奶沒關係，黑芝麻跟板豆腐是你的補鈣神器，練起來！',
    tags: ['#健身', '#蛋白質', '#蛋料理'],
    iconName: 'Egg',
    visualDescription: 'A strong, muscular egg character wearing a red headband and lifting dumbbells',
    colorDescription: 'Energetic Orange and White'
  },
  PESCATARIAN: {
    id: 'PESCATARIAN',
    name: '衝浪企鵝',
    title: '魚素',
    description: '精緻的海鮮饕客。跟海風一樣自由灑脫，大腦富含 Omega-3。',
    color: 'bg-[#DBEAFE]', // Blue
    textColor: 'text-[#1E40AF]',
    quote: '海是我家，浪是我媽。',
    soulFood: ['鯖魚', '蛤蜊', '海帶'],
    advice: '海鮮很棒，但重金屬很可怕。我們要吃得像個精明的海洋學家，多選小型魚類。',
    tags: ['#海鮮', '#自由', '#Omega3'],
    iconName: 'Fish',
    visualDescription: 'A cool penguin character wearing sunglasses and holding a surfboard',
    colorDescription: 'Ocean Blue and Cyan'
  },
  FLEXITARIAN: {
    id: 'FLEXITARIAN',
    name: '變色龍小隊',
    title: '彈性素',
    description: '隨和的社交達人。秉持「能素就素、不能素也不強求」的人生哲學。',
    color: 'bg-[#F3E8FF]', // Purple
    textColor: 'text-[#6B21A8]',
    quote: '方便就好，不用麻煩！',
    soulFood: ['各種菇類', '高纖蔬菜', '植物肉'],
    advice: '雖然很隨意，但肉邊菜通常油膩又沒營養。記得額外點一份豆腐補蛋白。',
    tags: ['#隨和', '#鍋邊素', '#社交'],
    iconName: 'Shuffle',
    visualDescription: 'A cute chameleon character blending into a pile of colorful vegetables',
    colorDescription: 'Trendy Purple and Pastel Green'
  },
  FIVE_PUNGENT: {
    id: 'FIVE_PUNGENT',
    name: '蒜頭小子',
    title: '五辛素',
    description: '重口味的美食評論家。認為蔥蒜是植物的靈魂。',
    color: 'bg-[#FEE2E2]', // Red tint
    textColor: 'text-[#991B1B]',
    quote: '加點辛香，風味更佳！',
    soulFood: ['大蒜', '青醬', '韭菜盒子'],
    advice: '五辛料理通常重油重鹹，吃完記得多喝水消水腫，並準備口香糖。',
    tags: ['#重口味', '#大蒜', '#辛香料'],
    iconName: 'Flame',
    visualDescription: 'A mischievous garlic bulb character wearing a ninja mask and skateboarding',
    colorDescription: 'Bold Red and White'
  }
};