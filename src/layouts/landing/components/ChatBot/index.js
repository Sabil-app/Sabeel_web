import { useState, useRef, useEffect } from "react";
import Box from "@mui/material/Box";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import { useTranslation } from "i18n/LanguageContext";
import { chatWithAi, chatWithAiPublic } from "api/aiApi";

const chatStyles = `
@keyframes chatbot-pop {
  0% { transform: scale(0.6) translateY(20px); opacity: 0; }
  60% { transform: scale(1.04) translateY(-2px); opacity: 1; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

@keyframes chatbot-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(76,175,80,0.55); }
  50% { box-shadow: 0 0 0 14px rgba(76,175,80,0); }
}

@keyframes chatbot-fab-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

@keyframes chatbot-typing-dot {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.35; }
  30% { transform: translateY(-4px); opacity: 1; }
}

.chatbot-fab {
  animation: chatbot-pulse 2.4s ease-out infinite, chatbot-fab-float 4s ease-in-out infinite;
}

.chatbot-panel {
  animation: chatbot-pop 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  transform-origin: bottom right;
}

.chatbot-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #7dd87f;
  display: inline-block;
  margin: 0 2px;
  animation: chatbot-typing-dot 1.1s infinite;
}
.chatbot-dot:nth-child(2) { animation-delay: 0.15s; }
.chatbot-dot:nth-child(3) { animation-delay: 0.3s; }
`;

function SabeelChatBot() {
  const { t, lang } = useTranslation();
  const quickReplies = t("chatbot.quickReplies") || [];
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing, open]);

  // Initial personalized analysis when opened
  useEffect(() => {
    if (open && !hasInitialized) {
      const triggerInitialAnalysis = async () => {
        setTyping(true);
        try {
          // Check if we have a token (logged in as agency/admin)
          const adminAuthRaw = localStorage.getItem("sabeel_admin_agence_auth");
          if (adminAuthRaw) {
            try {
              const authData = JSON.parse(adminAuthRaw);
              const agencyName = authData.user?.agencyName || authData.user?.fullName || "Agence";
              setMessages([
                {
                  from: "bot",
                  text: `Bonjour ${agencyName} ! Je prépare votre analyse personnalisée...`,
                },
              ]);
            } catch (e) {
              console.error("Error parsing auth data", e);
            }

            const response = await chatWithAi(
              "Analyse ma situation actuelle et donne-moi tes recommandations.",
              lang
            );
            setMessages([{ from: "bot", text: response }]);
          } else {
            // Fallback for landing page or unauthenticated
            const response = await chatWithAiPublic(
              t("chatbot.greeting_prompt") ||
                "Présente-toi et explique comment tu peux aider les pèlerins.",
              lang
            );
            setMessages([
              {
                from: "bot",
                text: response,
              },
            ]);
          }
          setHasInitialized(true);
        } catch (error) {
          console.error("Initial analysis failed", error);
          setMessages([
            {
              from: "bot",
              text:
                t("chatbot.greeting") ||
                "Assalamu alaykum ! Je suis l'assistant intelligent Sabeel. Comment puis-je vous aider aujourd'hui ?",
            },
          ]);
        } finally {
          setTyping(false);
        }
      };
      triggerInitialAnalysis();
    }
  }, [open, hasInitialized, lang, t]);

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Add user message
    setMessages((prev) => [...prev, { from: "user", text: trimmed }]);
    setInput("");
    setTyping(true);

    try {
      // Check if logged in to use private or public API
      const adminAuthRaw = localStorage.getItem("sabeel_admin_agence_auth");
      const response = adminAuthRaw
        ? await chatWithAi(trimmed, lang)
        : await chatWithAiPublic(trimmed, lang);

      setMessages((prev) => [...prev, { from: "bot", text: response }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text:
            t("chatbot.error") ||
            "Désolé, je rencontre des difficultés techniques. Veuillez réessayer plus tard.",
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      <style>{chatStyles}</style>

      {/* Chat Panel */}
      {open && (
        <Box
          className="chatbot-panel"
          sx={{
            position: "fixed",
            bottom: { xs: 88, md: 100 },
            right: { xs: 16, md: 28 },
            width: { xs: "calc(100vw - 32px)", md: 360 },
            height: { xs: 520, md: 540 },
            maxHeight: "calc(100vh - 120px)",
            borderRadius: "28px",
            overflow: "hidden",
            zIndex: 1400,
            background: "linear-gradient(180deg, #ffffff 0%, #f8fbf8 100%)",
            boxShadow: "0 28px 80px rgba(15,23,42,0.18)",
            display: "flex",
            flexDirection: "column",
            backdropFilter: "blur(14px)",
          }}
        >
          <Box
            sx={{
              px: 2.4,
              pt: 1.2,
              pb: 0.9,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              textAlign: "center",
              background: "rgba(255,255,255,0.35)",
              borderBottom: "1px solid rgba(15,23,42,0.04)",
            }}
          >
            <Box
              sx={{
                width: 124,
                height: 124,
                overflow: "hidden",
                mb: 0.35,
              }}
            >
              <Box
                component="img"
                src="/gif/bot.gif"
                alt="Sabeel Assistant"
                sx={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </Box>
            <MDTypography
              variant="h6"
              fontWeight="bold"
              sx={{
                color: "#1b1f23",
                fontSize: "0.95rem",
                lineHeight: 1.1,
                mb: 0.2,
              }}
            >
              Sabeel AI Assistant
            </MDTypography>
            <Box display="flex" alignItems="center" gap={0.55}>
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  bgcolor: "#56c271",
                  boxShadow: "0 0 0 3px rgba(86,194,113,0.16)",
                }}
              />
              <MDTypography
                variant="caption"
                sx={{ color: "#5b6574", fontWeight: 500, fontSize: "0.68rem" }}
              >
                {t("chatbot.online") || "En ligne (Powered by Gemini)"}
              </MDTypography>
            </Box>
          </Box>

          <Box
            ref={scrollRef}
            sx={{
              flex: 1,
              overflowY: "auto",
              px: 2,
              py: 1.8,
              background: "linear-gradient(180deg, #f7faf7 0%, #fcfdfc 100%)",
              display: "flex",
              flexDirection: "column",
              gap: 1.3,
            }}
          >
            {messages.map((msg, idx) => (
              <Box
                key={idx}
                sx={{
                  alignSelf: msg.from === "user" ? "flex-end" : "flex-start",
                  maxWidth: "82%",
                  background:
                    msg.from === "user"
                      ? "linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)"
                      : "rgba(255,255,255,0.95)",
                  color: msg.from === "user" ? "#ffffff !important" : "#2a2a2a",
                  borderRadius: msg.from === "user" ? "18px 18px 6px 18px" : "18px 18px 18px 6px",
                  px: 1.7,
                  py: 1.15,
                  boxShadow:
                    msg.from === "user"
                      ? "0 6px 18px rgba(27,94,32,0.18)"
                      : "0 10px 22px rgba(15,23,42,0.05)",
                  border: msg.from === "user" ? "none" : "1px solid rgba(27,94,32,0.08)",
                  fontSize: "0.84rem",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                  WebkitTextFillColor: msg.from === "user" ? "#ffffff" : "#2a2a2a",
                  "& *": {
                    color: msg.from === "user" ? "#ffffff !important" : "#2a2a2a",
                    WebkitTextFillColor: msg.from === "user" ? "#ffffff" : "#2a2a2a",
                  },
                }}
              >
                {msg.text}
              </Box>
            ))}

            {typing && (
              <Box
                sx={{
                  alignSelf: "flex-start",
                  bgcolor: "rgba(255,255,255,0.95)",
                  borderRadius: "18px 18px 18px 6px",
                  px: 1.6,
                  py: 1.1,
                  border: "1px solid rgba(27,94,32,0.08)",
                  boxShadow: "0 10px 22px rgba(15,23,42,0.05)",
                }}
              >
                <span className="chatbot-dot" />
                <span className="chatbot-dot" />
                <span className="chatbot-dot" />
              </Box>
            )}

            {messages.length === 1 && !typing && (
              <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 0.8 }}>
                <MDTypography
                  variant="caption"
                  sx={{ color: "rgba(0,0,0,0.5)", fontSize: "0.72rem", pl: 0.5, fontWeight: 600 }}
                >
                  {t("chatbot.suggestions") || "Suggestions :"}
                </MDTypography>
                {quickReplies.map((q) => (
                  <Box
                    key={q}
                    onClick={() => sendMessage(q)}
                    sx={{
                      px: 1.5,
                      py: 1,
                      borderRadius: "16px",
                      border: "1px solid rgba(27,94,32,0.12)",
                      bgcolor: "rgba(255,255,255,0.88)",
                      color: "#1b5e20",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.25s ease",
                      boxShadow: "0 8px 18px rgba(15,23,42,0.04)",
                      "&:hover": {
                        bgcolor: "#eef7ee",
                        transform: "translateX(3px)",
                        borderColor: "rgba(76,175,80,0.3)",
                      },
                    }}
                  >
                    {q}
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              p: 1.4,
              borderTop: "1px solid rgba(0,0,0,0.05)",
              bgcolor: "rgba(255,255,255,0.95)",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <TextField
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("chatbot.placeholder") || "Posez votre question ici..."}
              size="small"
              fullWidth
              autoComplete="off"
              InputProps={{
                sx: {
                  borderRadius: "16px",
                  fontSize: "0.85rem",
                  bgcolor: "white",
                  "& fieldset": { borderColor: "rgba(27,94,32,0.15)" },
                  "&:hover fieldset": { borderColor: "#4caf50 !important" },
                },
              }}
            />
            <IconButton
              type="submit"
              disabled={!input.trim() || typing}
              sx={{
                background: "linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)",
                color: "white !important",
                width: 44,
                height: 44,
                boxShadow: "0 10px 20px rgba(27,94,32,0.25)",
                "&:hover": { transform: "scale(1.05)" },
                "&.Mui-disabled": { opacity: 0.4, color: "white !important" },
                transition: "transform 0.2s ease",
              }}
              aria-label="Envoyer"
            >
              <Icon>send</Icon>
            </IconButton>
          </Box>
        </Box>
      )}

      {/* Floating Button */}
      <IconButton
        onClick={() => setOpen((o) => !o)}
        className="chatbot-fab"
        aria-label="Ouvrir le chat"
        sx={{
          position: "fixed",
          bottom: { xs: 20, md: 28 },
          right: { xs: 16, md: 28 },
          width: 68,
          height: 68,
          background: "linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)",
          color: "white !important",
          zIndex: 1401,
          border: "none",
          "&:hover": {
            transform: "scale(1.06)",
          },
          transition: "transform 0.25s ease, background 0.25s ease",
          boxShadow: "0 18px 40px rgba(27,94,32,0.28)",
          overflow: "hidden",
          p: 0,
        }}
      >
        {open ? (
          <Icon sx={{ fontSize: "28px !important", color: "white" }}>close</Icon>
        ) : (
          <Box
            component="img"
            src="/images/comment.png"
            alt="Ouvrir le chatbot"
            sx={{
              width: "34px",
              height: "34px",
              objectFit: "contain",
              filter: "brightness(0) invert(1)",
            }}
          />
        )}
      </IconButton>
    </>
  );
}

export default SabeelChatBot;
