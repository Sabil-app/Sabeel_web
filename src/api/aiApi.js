import apiClient from "./apiClient";

export const chatWithAi = async (prompt, lang) => {
  try {
    const data = await apiClient("/ai/chat", {
      method: "POST",
      body: { prompt, lang },
    });
    return data.response;
  } catch (error) {
    console.error("AI Chat Error:", error);
    throw error;
  }
};

export const chatWithAiPublic = async (prompt, lang) => {
  try {
    const data = await apiClient("/ai/chat-public", {
      method: "POST",
      body: { prompt, lang },
    });
    return data.response;
  } catch (error) {
    console.error("AI Public Chat Error:", error);
    throw error;
  }
};
