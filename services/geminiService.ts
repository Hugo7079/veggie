import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { AGENTS } from "../data/agents";
import { createPcmBlob, base64ToUint8Array, decodeAudioData } from "../utils/audioUtils";
import { AgentProfile } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// --- Han Han (Sorting Hat) Service ---

const HAN_HAN_SYSTEM_INSTRUCTION = `
你現在是「韓韓」(Han Han)，一個可愛、活潑且友善的 AI 蔬食分類帽。
你的目標是透過輕鬆像朋友般的聊天，將使用者分類到以下 7 種素食風格之一：

1. VEGAN (純素) - 嚴謹、環保、動物權
2. LACTO_OVO (蛋奶素) - 快樂、大眾化、愛甜點
3. LACTO (奶素) - 溫柔、拿鐵控、不吃蛋
4. OVO (蛋素) - 健身、蛋白質、不喝奶
5. PESCATARIAN (魚素) - 海鮮、精緻、健康
6. FLEXITARIAN (彈性素/鍋邊素) - 隨和、方便、社交
7. FIVE_PUNGENT (五辛素) - 重口味、愛蔥蒜、美食家

**互動流程 (請嚴格遵守):**
1. **開場**: 熱情地歡迎使用者來到「蔬食分類儀式」，並詢問他們的名字(如果還沒提供)。
2. **提問**: 請**逐一**問以下 5 個關鍵問題。不要一次問完，等待使用者回答後再問下一題。對話要像在聊天，可以用 emoji。
   - **問題 1 (動機)**: 為什麼想嘗試素食？(健康/環保/動物權/還願/體重...)
   - **問題 2 (蛋奶依賴)**: 對蛋和奶的喜愛程度？(完全離不開/可以不吃蛋/不喝奶/都不要)
   - **問題 3 (五辛接受度)**: 會介意蔥、蒜、韭菜嗎？(很愛/因為宗教不能吃/不喜歡)
   - **問題 4 (生活型態)**: 平常是外食族還是自己煮？
   - **問題 5 (彈性度)**: 希望循序漸進(彈性)還是一步到位(嚴格)？

3. **分析**: 在收到第 5 個問題的答案後，綜合分析使用者的回答。
4. **結果**: 最後一句話必須包含一個 JSON 區塊，格式如下，不要包含其他 markdown 標記在 JSON 裡面：
\`\`\`json
{
  "type": "VEGAN", 
  "reason": "簡單說明為什麼適合這個類型的理由(繁體中文)"
}
\`\`\`
請使用上述定義的英文 Enum Key (如 VEGAN, LACTO_OVO)。
`;

let chatSession: any = null;

export const startAssessment = async (userName: string) => {
  const model = 'gemini-2.5-flash';
  chatSession = ai.chats.create({
    model,
    config: {
      systemInstruction: HAN_HAN_SYSTEM_INSTRUCTION,
      temperature: 0.7,
    },
  });

  // Start the conversation with context
  const response = await chatSession.sendMessage({ message: `嗨！我是 ${userName}，我準備好開始測驗了！` });
  return response.text;
};

export const sendAssessmentMessage = async (message: string) => {
  if (!chatSession) throw new Error("Session not started");
  const response = await chatSession.sendMessage({ message });
  return response.text;
};

// --- Agent Chat Service ---

export const startAgentChat = async (agentId: string, history: any[]) => {
  const agent = AGENTS[agentId];
  if (!agent) throw new Error("Agent not found");

  const SYSTEM_PROMPT = `
    你現在是 **${agent.name}**。
    稱號: ${agent.title}
    描述: ${agent.description}
    特質: ${agent.tags.join(', ')}
    口頭禪: ${agent.quote}
    靈魂食物: ${agent.soulFood.join(', ')}
    
    你正在跟一位剛被分類為「${agent.title}」的使用者聊天。
    請恭喜他們，並根據你的角色設定(如上)解釋為什麼這個風格適合他們。
    請用你的專屬語氣給出 ${agent.advice} 建議。
    
    保持對話有趣、簡短且充滿角色個性。請使用繁體中文。
  `;

  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: { systemInstruction: SYSTEM_PROMPT },
    history: history
  });

  // Send initial greeting (internal trigger)
  const response = await chat.sendMessage({ message: "你好！我是你的素食夥伴。" });
  return { chat, initialText: response.text };
};

export const sendAgentMessage = async (chat: any, message: string) => {
  const response = await chat.sendMessage({ message });
  return response.text;
};

// --- Passport Generation Service (Image Background Only) ---

export const generatePassportImage = async (userPhotoBase64: string, agent: AgentProfile, userName: string) => {
  // NOTE: We are intentionally NOT using the userPhotoBase64 here. 
  // We will generate a template background and composite the user photo in the DOM (App.tsx).
  
  const prompt = `
    Generate a vertical 'Card Background' for a character collection card.
    
    **Visual Style**:
    - Modern flat vector illustration.
    - Bold black outlines.
    - Solid color fills, no gradients.
    - Trendy vinyl toy aesthetic / Pop Art.
    
    **Content**:
    - Draw a cute character in the **bottom right corner**: ${agent.visualDescription}.
    - Background color theme: ${agent.colorDescription}.
    - Add subtle geometric patterns (triangles, circles) floating in the background.
    
    **Constraint (CRITICAL)**:
    - **NO TEXT**. Do not write any words, letters, or numbers.
    - **Leave the TOP LEFT area EMPTY** (solid color) for a user photo overlay.
    - **Leave the BOTTOM LEFT area EMPTY** for text overlay.
    - Make it look like a high-quality ID card background or trading card background.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: prompt }
      ]
    }
  });

  // Extract the generated image
  for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
      }
  }
  
  throw new Error("No image generated");
};

// --- Streaming Chat Service ---

export const streamChat = async (message: string, history: any[]) => {
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: history
    });
    return chat.sendMessageStream({ message });
};

// --- Vision Service ---

export const analyzeImage = async (base64Image: string, prompt: string) => {
    const matches = base64Image.match(/^data:(.+);base64,(.+)$/);
    if (!matches) throw new Error("Invalid base64 image data");
    
    const mimeType = matches[1];
    const data = matches[2];

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { inlineData: { mimeType, data } },
                { text: prompt }
            ]
        }
    });
    return response;
};

// --- Live API Service ---

export class LiveSession {
    private onVolumeChange: (vol: number) => void;
    private sessionPromise: Promise<any> | null = null;
    private audioContext: AudioContext | null = null;
    private inputContext: AudioContext | null = null;
    private streamer: ScriptProcessorNode | null = null;
    private nextStartTime = 0;
    private sourceRefs: Set<AudioBufferSourceNode> = new Set();
    private isConnected = false;

    constructor(onVolumeChange: (vol: number) => void) {
        this.onVolumeChange = onVolumeChange;
    }

    async connect(onClose: () => void) {
        if (this.isConnected) return;
        
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioContextClass({ sampleRate: 24000 });
        this.inputContext = new AudioContextClass({ sampleRate: 16000 });

        this.sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
                }
            },
            callbacks: {
                onopen: () => {
                    this.isConnected = true;
                    this.startAudioInput();
                },
                onmessage: (msg: LiveServerMessage) => {
                    this.handleMessage(msg);
                },
                onclose: () => {
                    this.cleanup();
                    onClose();
                },
                onerror: (err) => {
                    console.error("Live Session Error", err);
                    this.cleanup();
                    onClose();
                }
            }
        });
        await this.sessionPromise;
    }

    private async startAudioInput() {
        if (!this.inputContext) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const source = this.inputContext.createMediaStreamSource(stream);
            this.streamer = this.inputContext.createScriptProcessor(4096, 1, 1);
            
            this.streamer.onaudioprocess = (e) => {
                if (!this.isConnected) return;
                const inputData = e.inputBuffer.getChannelData(0);
                
                let sum = 0;
                for (let i = 0; i < inputData.length; i++) {
                    sum += inputData[i] * inputData[i];
                }
                const rms = Math.sqrt(sum / inputData.length);
                this.onVolumeChange(rms);
                
                const blob = createPcmBlob(inputData);
                this.sessionPromise?.then(session => {
                    session.sendRealtimeInput({ media: blob });
                });
            };
            source.connect(this.streamer);
            this.streamer.connect(this.inputContext.destination);
        } catch (err) {
            this.disconnect();
        }
    }

    private async handleMessage(msg: LiveServerMessage) {
        const data = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
        if (data && this.audioContext) {
            const bytes = base64ToUint8Array(data);
            const buffer = await decodeAudioData(bytes, this.audioContext, 24000);
            this.nextStartTime = Math.max(this.nextStartTime, this.audioContext.currentTime);
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(this.audioContext.destination);
            source.addEventListener('ended', () => this.sourceRefs.delete(source));
            this.sourceRefs.add(source);
            source.start(this.nextStartTime);
            this.nextStartTime += buffer.duration;
        }
        if (msg.serverContent?.interrupted) {
            this.sourceRefs.forEach(s => { try { s.stop(); } catch(e) {} });
            this.sourceRefs.clear();
            this.nextStartTime = 0;
        }
    }

    disconnect() {
        this.isConnected = false;
        if (this.sessionPromise) {
            this.sessionPromise.then(session => { try { session.close(); } catch(e) {} });
        }
        this.cleanup();
    }

    private cleanup() {
        this.streamer?.disconnect();
        this.inputContext?.close();
        this.audioContext?.close();
        this.sourceRefs.clear();
        this.streamer = null;
        this.inputContext = null;
        this.audioContext = null;
        this.sessionPromise = null;
        this.isConnected = false;
    }
}