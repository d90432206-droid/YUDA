
import { GoogleGenAI } from "@google/genai";
import { Instrument, InstrumentStatus, Material, User } from "../types";

export const generateLabReport = async (
  prompt: string,
  data: { instruments: Instrument[]; materials: Material[]; userQualifications: string[]; users?: User[] }
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    你是一位精通 ISO 17025 規範的實驗室品質管理助理。
    你手頭上有實驗室目前的數據，包括儀器、標準物資與所有人員的資料與訓練紀錄。
    
    人員管理關鍵點：
    - 人員現有多重資格，且包含「教育訓練紀錄 (Training Logs)」。
    - 訓練分為「內訓」與「外訓」。
    - 每項訓練包含「上課日期」、「時數」、「受訓單位」、「回訓日期」與「資格期限」。
    - 當「回訓日期」或「資格期限」小於今日時，應視為能力缺失風險。

    請根據數據回答使用者的問題。如果使用者詢問關於訓練狀態或人員能力的分析，請詳細列出哪些人員需要安排回訓。
    請使用專業繁體中文，並在必要時使用 Markdown 表格。
    
    數據摘要：
    - 儀器總數：${data.instruments.length}
    - 待送校儀器：${data.instruments.filter(i => i.status === InstrumentStatus.PENDING_CALIBRATION).map(i => i.instrumentName).join(', ')}
    - 標準物資總數：${data.materials.length}
    - 人員總數：${data.users?.length || 0}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "抱歉，生成報告時發生錯誤，請稍後再試。";
  }
};
