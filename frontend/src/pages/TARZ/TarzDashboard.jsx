import React, { useState, useRef, useEffect } from "react";
import tarzLogo from "../../assets/2.png";
import axios from "axios";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import ReactMarkdown from "react-markdown";
import Header2 from "../../components/Header2";
import { FaRegCopy } from "react-icons/fa6";
import { LuMessageCircleDashed } from "react-icons/lu";
import { FaTrash } from "react-icons/fa";

const API_URL = "http://localhost:5000/api";

const TarzDashboard = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false); // Changed to false for faster initial load
  const [sessionLoading, setSessionLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState(null);
  const [hoveredSession, setHoveredSession] = useState(null);
  const [deletingSession, setDeletingSession] = useState(null);
  const chatEndRef = useRef(null);

  // Optimized user fetch - only fetch if not already loaded
  useEffect(() => {
    const fetchUser = async () => {
      if (userId) return; // Skip if already loaded

      try {
        const userRes = await axios.get(`${API_URL}/auth/current-user/`, {
          withCredentials: true,
        });
        const user = userRes.data.user;
        setUserId(user._id);

        // Fetch sessions in parallel
        fetchSessions(user._id);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchUser();
  }, []);

  // Separate function for fetching sessions
  const fetchSessions = async (user_id) => {
    try {
      const sessRes = await axios.get(
        `${API_URL}/tarzbot/sessions/?user_id=${user_id}`
      );
      const sessionList = sessRes.data.sessions || [];
      setSessions(sessionList);

      if (sessionList.length > 0) {
        setSelectedSessionId(sessionList[0].session_id);
      } else {
        // Create a new session if none exist
        const newSess = await axios.post(`${API_URL}/tarzbot/new_session/`, {
          user_id: user_id,
        });
        setSelectedSessionId(newSess.data.session_id);
      }
    } catch (err) {
      console.error("Error fetching sessions:", err);
    }
  };

  // Optimized message fetching with caching
  useEffect(() => {
    if (!userId || !selectedSessionId) return;

    setSessionLoading(true);
    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/tarzbot/history/?user_id=${userId}&session_id=${selectedSessionId}`
        );
        const msgs = (res.data.messages || []).map((m) => ({
          id: m._id,
          text: m.content,
          sender: m.from_ai ? "ai" : "user",
          timestamp: m.timestamp,
        }));
        setMessages(msgs);
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setSessionLoading(false);
      }
    };

    fetchMessages();
  }, [userId, selectedSessionId]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Function to generate chat title based on conversation
  const generateChatTitle = async (conversation) => {
    try {
      const titlePrompt = `Based on this conversation, generate a short, descriptive title (max 50 characters) that captures the main topic or purpose. Return only the title, nothing else.

Conversation:
${conversation}

Title:`;

      const response = await axios.post(`${API_URL}/tarzbot/generate-title/`, {
        conversation: conversation,
        prompt: titlePrompt,
      });

      return response.data.title || "New Chat";
    } catch (err) {
      console.error("Error generating title:", err);
      return "New Chat";
    }
  };

  // Function to update session title
  const updateSessionTitle = async (sessionId, newTitle) => {
    try {
      await axios.put(`${API_URL}/tarzbot/update-session-title/`, {
        session_id: sessionId,
        title: newTitle,
      });

      // Update local sessions state
      setSessions((prev) =>
        prev.map((session) =>
          session.session_id === sessionId
            ? { ...session, title: newTitle }
            : session
        )
      );
    } catch (err) {
      console.error("Error updating session title:", err);
    }
  };

  // Function to delete session
  const deleteSession = async (sessionId) => {
    if (!sessionId) return;

    setDeletingSession(sessionId);

    try {
      // Delete session and all its messages from database
      await axios.post(`${API_URL}/tarzbot/delete-session/`, {
        session_id: sessionId,
        user_id: userId,
      });

      // Remove from local state
      setSessions((prev) =>
        prev.filter((session) => session.session_id !== sessionId)
      );

      // If deleted session was selected, select first available session or create new one
      if (selectedSessionId === sessionId) {
        const remainingSessions = sessions.filter(
          (session) => session.session_id !== sessionId
        );
        if (remainingSessions.length > 0) {
          setSelectedSessionId(remainingSessions[0].session_id);
        } else {
          // Create a new session if none remain
          const newSess = await axios.post(`${API_URL}/tarzbot/new_session/`, {
            user_id: userId,
          });
          setSelectedSessionId(newSess.data.session_id);
        }
        setMessages([]);
      }
    } catch (err) {
      console.error("Error deleting session:", err);
    } finally {
      setDeletingSession(null);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !userId || !selectedSessionId) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      text: input,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Add typing indicator
    const typingId = `typing-${Date.now()}`;
    setTypingMessageId(typingId);
    setIsTyping(true);

    try {
      const res = await axios.post(`${API_URL}/tarzbot/message/`, {
        user_id: userId,
        message: userMessage.text,
        session_id: selectedSessionId,
      });

      const { user_message, ai_message } = res.data;

      // Remove typing indicator and add actual messages
      setIsTyping(false);
      setTypingMessageId(null);

      const updatedMessages = [
        ...messages.filter((m) => m.id !== userMessage.id),
        {
          id: user_message._id,
          text: user_message.content,
          sender: "user",
          timestamp: user_message.timestamp,
        },
        {
          id: ai_message._id,
          text: ai_message.content,
          sender: "ai",
          timestamp: ai_message.timestamp,
        },
      ];

      setMessages(updatedMessages);

      // Generate title if this is the first meaningful exchange
      const currentSession = sessions.find(
        (s) => s.session_id === selectedSessionId
      );
      if (
        currentSession &&
        (!currentSession.title || currentSession.title === "New Chat")
      ) {
        const conversation = updatedMessages
          .map(
            (msg) => `${msg.sender === "user" ? "User" : "TARZ"}: ${msg.text}`
          )
          .join("\n");

        const newTitle = await generateChatTitle(conversation);
        await updateSessionTitle(selectedSessionId, newTitle);
      }

      // Update session list
      const sessRes = await axios.get(
        `${API_URL}/tarzbot/sessions/?user_id=${userId}`
      );
      setSessions(sessRes.data.sessions || []);
    } catch (err) {
      setIsTyping(false);
      setTypingMessageId(null);
      console.error("Error sending message:", err);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    setTimeout(() => {
      document.getElementById("tarz-input").focus();
    }, 100);
  };

  const handleNewChat = async () => {
    if (!userId) return;
    setSessionLoading(true);
    try {
      const res = await axios.post(`${API_URL}/tarzbot/new_session/`, {
        user_id: userId,
      });
      setSelectedSessionId(res.data.session_id);
      setMessages([]);
      // Refetch sessions
      const sessRes = await axios.get(
        `${API_URL}/tarzbot/sessions/?user_id=${userId}`
      );
      setSessions(sessRes.data.sessions || []);
    } finally {
      setSessionLoading(false);
    }
  };

  // Typing indicator component
  const TypingIndicator = () => (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        marginBottom: "24px",
        animation: "fadeIn 0.4s",
      }}
    >
      <div
        style={{
          maxWidth: "70%",
          background: "#f8f9fa",
          color: "#495057",
          borderRadius: "18px",
          padding: "16px 20px",
          fontSize: "16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          border: "1px solid #e9ecef",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "4px",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#007476",
              animation: "typing 1.4s infinite ease-in-out",
            }}
          />
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#007476",
              animation: "typing 1.4s infinite ease-in-out 0.2s",
            }}
          />
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#007476",
              animation: "typing 1.4s infinite ease-in-out 0.4s",
            }}
          />
        </div>
        <span style={{ color: "#6c757d", fontSize: "14px" }}>
          TARZ is typing...
        </span>
      </div>
    </div>
  );

  // Helper to render code blocks in AI messages with copy button and markdown for text
  function renderMessageWithCode(text) {
    const regex = /```([a-z]*)\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;
    const elements = [];
    let key = 0;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        const before = text.slice(lastIndex, match.index);
        elements.push(<ReactMarkdown key={key++}>{before}</ReactMarkdown>);
      }
      const code = match[2];
      const lang = match[1] || "python";
      elements.push(
        <div key={key++} style={{ position: "relative", margin: "8px 0" }}>
          <button
            onClick={() => {
              navigator.clipboard.writeText(code);
            }}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              background: "#f8f9fa",
              border: "1px solid #e9ecef",
              borderRadius: 4,
              padding: "2px 8px",
              fontSize: 14,
              cursor: "pointer",
              zIndex: 2,
              color: "#6c757d",
            }}
            title="Copy code"
          >
            <FaRegCopy />
          </button>
          <SyntaxHighlighter
            language={lang}
            style={oneLight}
            customStyle={{ borderRadius: 8, margin: 0, paddingTop: 28 }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      );
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
      const after = text.slice(lastIndex);
      elements.push(<ReactMarkdown key={key++}>{after}</ReactMarkdown>);
    }
    return elements;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f7f2fa" }}>
      <Header2 />

      <div className="container-fluid" style={{ paddingTop: "80px" }}>
        <div className="row">
          {/* Sidebar */}
          <div className="col-lg-3 col-md-4">
            <div
              style={{
                background: "#fff",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                padding: "24px",
                height: "calc(100vh - 80px)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <button
                onClick={handleNewChat}
                style={{
                  width: "100%",
                  padding: "12px 20px",
                  borderRadius: "12px",
                  border: "2px solid #007476",
                  background: "#007476",
                  color: "#fff",
                  fontWeight: "600",
                  fontSize: "16px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  marginBottom: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#007476";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#007476";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                <span style={{ fontSize: "18px" }}>+</span>
                New Chat
              </button>

              <div style={{ flex: 1, overflowY: "auto" }}>
                <h6
                  style={{
                    color: "#6c757d",
                    fontSize: "14px",
                    fontWeight: "600",
                    marginBottom: "16px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Recent Chats
                </h6>

                {sessions.length === 0 && !loading && (
                  <div
                    style={{
                      color: "#adb5bd",
                      fontSize: "14px",
                      textAlign: "center",
                      marginTop: "40px",
                    }}
                  >
                    No chats yet. Start a conversation!
                  </div>
                )}

                {sessions.map((session) => (
                  <div
                    key={session.session_id}
                    onMouseEnter={() => setHoveredSession(session.session_id)}
                    onMouseLeave={() => setHoveredSession(null)}
                    style={{
                      padding: "12px 16px",
                      background:
                        selectedSessionId === session.session_id
                          ? "#f8f9ff"
                          : "transparent",
                      borderRadius: "12px",
                      border:
                        selectedSessionId === session.session_id
                          ? "2px solid #e9ecef"
                          : "2px solid transparent",
                      fontWeight:
                        selectedSessionId === session.session_id
                          ? "600"
                          : "400",
                      color:
                        selectedSessionId === session.session_id
                          ? "#007476"
                          : "#495057",
                      fontSize: "14px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      transition: "all 0.3s ease",
                      marginBottom: "8px",
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                    onClick={() => setSelectedSessionId(session.session_id)}
                  >
                    <span
                      style={{
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {session.title || "New Chat"}
                    </span>

                    {/* Delete button - appears on hover */}
                    {hoveredSession === session.session_id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            window.confirm(
                              "Are you sure you want to delete this chat? This action cannot be undone."
                            )
                          ) {
                            deleteSession(session.session_id);
                          }
                        }}
                        disabled={deletingSession === session.session_id}
                        style={{
                          background:
                            deletingSession === session.session_id
                              ? "#f8f9fa"
                              : "#ff4757",
                          color: "#f8f9fa",
                          border: "none",
                          borderRadius: "6px",
                          padding: "6px 8px",
                          fontSize: "14px",
                          cursor:
                            deletingSession === session.session_id
                              ? "not-allowed"
                              : "pointer",
                          transition: "all 0.2s ease",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          opacity:
                            deletingSession === session.session_id ? 0.6 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (deletingSession !== session.session_id) {
                            e.target.style.background = "#ff3742";
                            // e.target.style.transform = "scale(1.05)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (deletingSession !== session.session_id) {
                            e.target.style.background = "#ff4757";
                            // e.target.style.transform = "scale(1)";
                          }
                        }}
                        title="Delete chat"
                      >
                        {deletingSession === session.session_id ? (
                          <div
                            style={{
                              width: "12px",
                              height: "12px",
                              border: "2px solid #fff",
                              borderTop: "2px solid transparent",
                              borderRadius: "50%",
                              animation: "spin 1s linear infinite",
                            }}
                          />
                        ) : (
                          <FaTrash style={{ fontSize: "10px" }} />
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="col-lg-9 col-md-8">
            <div
              style={{
                background: "#fff",
                height: "calc(100vh - 80px)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {/* Chat Header */}
              <div
                style={{
                  padding: "24px 32px",
                  borderBottom: "1px solid #e9ecef",
                  background: "#fff",
                  borderRadius: "16px 16px 0 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <img
                  src={tarzLogo}
                  alt="TARZ"
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "#f8f9ff",
                    padding: "8px",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h4
                    style={{
                      fontWeight: "600",
                      color: "#121212",
                      margin: "0",
                      fontSize: "20px",
                    }}
                  >
                    TARZ AI Assistant
                  </h4>
                  <p
                    style={{
                      color: "#4d5ff8",
                      fontWeight: "500",
                      margin: "0",
                      fontSize: "14px",
                    }}
                  >
                    Online • Ready to help
                  </p>
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#4d5ff8",
                    fontWeight: "600",
                    background: "#f8f9ff",
                    borderRadius: "20px",
                    padding: "4px 12px",
                    border: "1px solid #e9ecef",
                  }}
                >
                  BETA
                </span>
              </div>

              {/* Chat Messages */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "24px 32px",
                  background: "#fff",
                }}
              >
                {sessionLoading ? (
                  <div
                    style={{
                      textAlign: "center",
                      marginTop: "80px",
                      color: "#6c757d",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        border: "3px solid #f3f3f3",
                        borderTop: "3px solid #007476",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                        margin: "0 auto 16px",
                      }}
                    />
                    Conversations Loading...
                  </div>
                ) : messages.length === 0 && !isTyping ? (
                  <div
                    style={{
                      textAlign: "center",
                      color: "#adb5bd",
                      marginTop: "80px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "48px",
                        marginBottom: "16px",
                        opacity: "0.5",
                      }}
                    >
                      <LuMessageCircleDashed />
                    </div>
                    <h5 style={{ color: "#6c757d", marginBottom: "8px" }}>
                      Start a conversation
                    </h5>
                    <p style={{ color: "#adb5bd", fontSize: "14px" }}>
                      Ask TARZ anything and get instant help!
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.map((message, idx) => (
                      <div
                        key={message.id}
                        style={{
                          display: "flex",
                          flexDirection:
                            message.sender === "user" ? "row-reverse" : "row",
                          alignItems: "flex-start",
                          gap: "12px",
                          marginBottom: "24px",
                          animation: "fadeIn 0.4s",
                        }}
                      >
                        {/* Message Bubble */}
                        <div
                          style={{
                            maxWidth: "70%",
                            background:
                              message.sender === "user" ? "#007476" : "#f8f9fa",
                            color:
                              message.sender === "user" ? "#fff" : "#495057",
                            borderRadius: "18px",
                            padding: "10px 20px",
                            fontSize: "16px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                            wordBreak: "break-word",
                            display: "flex",
                            flexDirection: "column",
                            position: "relative",
                            border:
                              message.sender === "ai"
                                ? "1px solid #e9ecef"
                                : "none",
                          }}
                        >
                          {message.sender === "ai" ? (
                            renderMessageWithCode(message.text)
                          ) : (
                            <ReactMarkdown>{message.text}</ReactMarkdown>
                          )}
                        </div>
                      </div>
                    ))}
                    {isTyping && <TypingIndicator />}
                  </>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div
                style={{
                  padding: "24px 32px",
                  borderTop: "1px solid #e9ecef",
                  background: "#fff",
                  borderRadius: "0 0 16px 16px",
                }}
              >
                <form
                  onSubmit={handleSend}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    background: "#f8f9fa",
                    border: "2px solid #e9ecef",
                    borderRadius: "24px",
                    padding: "8px 8px 8px 20px",
                    transition: "all 0.3s ease",
                  }}
                  onFocus={(e) => {
                    e.target.parentElement.style.borderColor = "#007476";
                    e.target.parentElement.style.boxShadow =
                      "0 0 0 3px rgba(77, 95, 248, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.parentElement.style.borderColor = "#e9ecef";
                    e.target.parentElement.style.boxShadow = "none";
                  }}
                >
                  <input
                    id="tarz-input"
                    type="text"
                    placeholder="Ask TARZ anything..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    style={{
                      flex: 1,
                      border: "none",
                      outline: "none",
                      fontSize: "16px",
                      padding: "12px 0",
                      background: "transparent",
                      color: "#495057",
                    }}
                    autoComplete="off"
                    disabled={isTyping}
                  />

                  <button
                    type="submit"
                    style={{
                      background: input && !isTyping ? "#007476" : "#e9ecef",
                      color: "#fff",
                      border: "none",
                      borderRadius: "50%",
                      width: "44px",
                      height: "44px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                      cursor: input && !isTyping ? "pointer" : "not-allowed",
                      transition: "all 0.3s ease",
                    }}
                    disabled={!input || isTyping}
                    onMouseEnter={(e) => {
                      if (input && !isTyping) {
                        e.target.style.background = "#007476";
                        e.target.style.transform = "scale(1.05)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (input && !isTyping) {
                        e.target.style.background = "#007476";
                        e.target.style.transform = "scale(1)";
                      }
                    }}
                    aria-label="Send"
                  >
                    ➤
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes typing {
          0%,
          60%,
          100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }

        .row > * {
          padding-left: 0px !important;
          padding-right: 0px !important;
        }

        p {
          margin-bottom: 0px !important;
        }
      `}</style>
    </div>
  );
};

export default TarzDashboard;
