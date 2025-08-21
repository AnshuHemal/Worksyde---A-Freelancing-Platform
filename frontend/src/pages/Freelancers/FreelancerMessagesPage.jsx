import React, { useState, useRef, useEffect } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { BsType, BsPaperclip, BsSun } from "react-icons/bs";
import { LuSendHorizontal } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import notificationSound from "../../assets/notification.wav";
import Modal from "react-modal";
import { LiaFileDownloadSolid } from "react-icons/lia";
import { FiSmile } from "react-icons/fi";
import {
  FaRegFilePdf,
  FaRegFileWord,
  FaRegFileExcel,
  FaRegFileAlt,
} from "react-icons/fa";
import { FiLink } from "react-icons/fi";
import UserStatusIndicator from "../../components/UserStatusIndicator";

axios.defaults.baseURL = "http://localhost:5173";

// Filter out number emojis (0-9) from emoji-mart data
const filteredData = {
  ...data,
  emojis: Object.fromEntries(
    Object.entries(data.emojis).filter(([key, emoji]) => {
      const numberShortcodes = [
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
      ];
      if (numberShortcodes.includes(key)) return false;
      if (
        emoji.skins &&
        emoji.skins.some((skin) => /\u003[0-9]\ufe0f\u20e3/.test(skin.unified))
      )
        return false;
      return true;
    })
  ),
};

const FileIcon = ({ type }) => {
  const ext = (type || "").toLowerCase();
  if (ext === "link") return <FiLink size={20} color="#fff" />;
  if (ext === "pdf") return <FaRegFilePdf size={20} color="#fff" />;
  if (ext === "doc" || ext === "docx")
    return <FaRegFileWord size={20} color="#fff" />;
  if (ext === "xls" || ext === "xlsx")
    return <FaRegFileExcel size={20} color="#fff" />;
  if (ext === "csv") return <FaRegFileExcel size={20} color="#fff" />;
  return <FaRegFileAlt size={20} color="#fff" />;
};

const TABS = ["All", "Files", "Links"];

function getStatusIcon(status) {
  if (!status) return null;
  return null;
}

// 1. Add a helper to get attachment label for chat list
const getAttachmentLabel = (msg) => {
  if (!msg) return "";
  const type = msg.attachment?.type || msg.attachment_type;
  if (type === "image") return "Photo";
  if (type === "video") return "Video";
  if (type === "file") {
    const name = msg.attachment?.name || msg.attachment_name || "";
    if (name.match(/\.(pdf|docx?|xlsx?|csv|txt)$/i)) return "Document";
    return "Document";
  }
  return msg.content || "";
};

const FreelancerMessagesPage = () => {
  // All hooks at the top
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [search, setSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState("All");
  const [showFilesSidebar, setShowFilesSidebar] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [message, setMessage] = useState("");
  const inputRef = useRef(null);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const navigate = useNavigate();
  const languages = ["English", "Hindi", "Gujarati"];
  const languageCodes = {
    English: "en",
    Hindi: "hi",
    Gujarati: "gu",
  };
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [attachmentType, setAttachmentType] = useState(null);
  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [suggestion, setSuggestion] = useState("");

  // New state for real messages
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [errorMessages, setErrorMessages] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [chatList, setChatList] = useState([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [errorChats, setErrorChats] = useState(null);
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [selectedClientName, setSelectedClientName] = useState("");
  const [selectedClientTitle, setSelectedClientTitle] = useState("");

  // Add state for context menu
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
  });

  // Add state for attachment modal
  const [imageModal, setImageModal] = useState({ open: false, url: null });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [highlightedMsgId, setHighlightedMsgId] = useState(null);
  const messageRefs = useRef({});
  const [filesSearch, setFilesSearch] = useState("");
  const [userOnlineStatus, setUserOnlineStatus] = useState({});
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    axios
      .get("/api/auth/current-user/", { withCredentials: true })
      .then((res) => {
        const data = res.data;
        if (data.success && data.user && data.user._id) {
          setCurrentUserId(data.user._id);
        }
      });
  }, []);

  // Fetch chat list on mount
  useEffect(() => {
    if (!currentUserId) return;
    setLoadingChats(true);
    setErrorChats(null);
    axios
      .get(`/api/chats/rooms/?user_id=${currentUserId}`)
      .then((res) => {
        const data = res.data;
        if (data.success && Array.isArray(data.rooms)) {
          setChatList(data.rooms);
        } else {
          setChatList([]);
        }
        setLoadingChats(false);
      })
      .catch((err) => {
        setErrorChats(err.message);
        setChatList([]);
        setLoadingChats(false);
      });
  }, [currentUserId]);

  // Always fetch the client name from /api/auth/client/profile/<user_id>/, and use the latest job post title as the subtitle
  useEffect(() => {
    if (!chatList || chatList.length === 0 || !currentUserId) return;
    chatList.forEach((chat, idx) => {
      if (
        chat.other_user_id &&
        (!chat.display_name || typeof chat.subtitle === "undefined")
      ) {
        // Step 1: Always fetch the client name
        axios
          .get(`/api/auth/client/profile/${chat.other_user_id}/`)
          .then((clientRes) => {
            const name = clientRes.data.name || "";
            const hasPhoto = clientRes.data && (clientRes.data.photograph === true || clientRes.data.avatar === true);
            const avatarUrl = hasPhoto ? `/api/auth/profile-image/${chat.other_user_id}/` : "";
            // Step 2: Try to fetch the client profile for photo (optional, can be skipped if not needed)
            // Step 3: Fetch latest job post title for this client
            axios
              .get(`/api/auth/jobposts/client/${chat.other_user_id}/`)
              .then((jobRes) => {
                let jobTitle = "";
                if (
                  jobRes.data &&
                  jobRes.data.data &&
                  jobRes.data.data.length > 0
                ) {
                  const sorted = jobRes.data.data.sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                  );
                  jobTitle = sorted[0].title || "";

                  // Step 4: Fetch online status for the client
                  axios
                    .get(`/api/auth/user-status/${chat.other_user_id}/`, {
                      withCredentials: true,
                    })
                    .then((statusRes) => {
                      if (statusRes.data.success) {
                        setUserOnlineStatus((prev) => ({
                          ...prev,
                          [chat.other_user_id]:
                            statusRes.data.user.onlineStatus,
                        }));
                      }
                    })
                    .catch((statusError) => {
                      console.error("Error fetching user status:", statusError);
                    });
                }
                setChatList((prev) => {
                  const updated = [...prev];
                  updated[idx] = {
                    ...updated[idx],
                    display_name: name,
                    display_avatar: avatarUrl || "", // fallback to initials
                    is_client: true,
                    subtitle: jobTitle, // Only the job post title
                  };
                  return updated;
                });
              })
              .catch(() => {
                setChatList((prev) => {
                  const updated = [...prev];
                  updated[idx] = {
                    ...updated[idx],
                    display_name: name,
                    display_avatar: avatarUrl || "",
                    is_client: true,
                    subtitle: "",
                  };
                  return updated;
                });
              });
          })
          .catch(() => {
            // Fallback: just use initials
            setChatList((prev) => {
              const updated = [...prev];
              updated[idx] = {
                ...updated[idx],
                display_name: "",
                display_avatar: "",
                is_client: true,
                subtitle: "",
              };
              return updated;
            });
          });
      }
    });
  }, [chatList, currentUserId]);

  // Periodically update online status for all users in chat list
  useEffect(() => {
    if (!chatList || chatList.length === 0) return;

    const updateOnlineStatus = () => {
      chatList.forEach((chat) => {
        if (chat.other_user_id) {
          axios
            .get(`/api/auth/user-status/${chat.other_user_id}/`, {
              withCredentials: true,
            })
            .then((statusRes) => {
              if (statusRes.data.success) {
                setUserOnlineStatus((prev) => ({
                  ...prev,
                  [chat.other_user_id]: statusRes.data.user.onlineStatus,
                }));
              }
            })
            .catch((statusError) => {
              console.error("Error fetching user status:", statusError);
            });
        }
      });
    };

    // Update every 30 seconds
    const interval = setInterval(updateOnlineStatus, 30000);

    return () => clearInterval(interval);
  }, [chatList]);

  // Check for inactive users periodically
  useEffect(() => {
    const checkInactiveUsers = async () => {
      try {
        await axios.get("/api/auth/inactive-users/", { withCredentials: true });
      } catch (error) {
        console.error("Error checking inactive users:", error);
      }
    };

    // Check every 5 minutes
    const interval = setInterval(checkInactiveUsers, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Helper to get initials from name
  const getInitials = (name) => {
    if (!name) return "";
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0][0].toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };
  // Helper to get a random color from name
  const getColorFromName = (name) => {
    if (!name) return "#e0f7f6";
    // Simple hash to pick a color
    const colors = [
      "#e57373",
      "#f06292",
      "#ba68c8",
      "#64b5f6",
      "#4dd0e1",
      "#81c784",
      "#ffd54f",
      "#ffb74d",
      "#a1887f",
      "#90a4ae",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const otherUserId = selectedChat && selectedChat.other_user_id;

  // Fetch messages when selectedChat changes
  useEffect(() => {
    if (!currentUserId || !otherUserId) return;
    const participants = [currentUserId, otherUserId].sort();
    const room_id = participants.join("_");
    setLoadingMessages(true);
    setErrorMessages(null);
    axios
      .get(`/api/chats/?sender=${currentUserId}&receiver=${otherUserId}`)
      .then((res) => {
        const data = res.data;
        if (data.success && Array.isArray(data.messages)) {
          setMessages(data.messages);
        } else {
          setMessages([]);
        }
        setLoadingMessages(false);
      })
      .catch((err) => {
        setErrorMessages(err.message);
        setMessages([]);
        setLoadingMessages(false);
      });
  }, [currentUserId, otherUserId]);

  // The notification WebSocket useEffect should be at the top level, not tied to selectedChat
  useEffect(() => {
    if (!currentUserId) return;
    const notifyWs = new window.WebSocket(
      `ws://localhost:5000/ws/notify/${currentUserId}/`
    );
    notifyWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.room_id && data.message && data.timestamp) {
        setChatList((prev) =>
          prev.map((chat) => {
            if (chat.room_id === data.room_id) {
              if (
                !chat.last_message ||
                new Date(data.timestamp) > new Date(chat.last_message.timestamp)
              ) {
                // Play notification sound and show toast only (no toast in per-room ws)
                if (
                  data.sender_id !== currentUserId &&
                  data.status !== "read"
                ) {
                  const audio = new Audio(notificationSound);
                  audio.play().catch(() => {});
                  // Dismiss any previous toast for this message
                  if (data._id) toast.dismiss(data._id);
                  // Show toast at bottom-right, only once per message
                  const senderName = chat.display_name || "New message";
                  const senderAvatar = chat.display_avatar;
                  toast.custom(
                    (t) => (
                      <div
                        style={{
                          background: "#fff",
                          color: "#007674",
                          padding: "16px 24px",
                          borderRadius: "12px",
                          boxShadow: "0 2px 12px rgba(0,118,116,0.13)",
                          fontWeight: 600,
                          fontSize: 16,
                          border: "1.5px solid #e3e3e3",
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          maxWidth: 340,
                        }}
                      >
                        {senderAvatar ? (
                          <img
                            src={senderAvatar}
                            alt={senderName}
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              objectFit: "cover",
                              border: "2px solid #e3e3e3",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              background: "#e0f7f6",
                              color: "#007674",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              fontSize: 18,
                              border: "2px solid #e3e3e3",
                            }}
                          >
                            {senderName
                              .split(" ")
                              .map((w) => w[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: 15,
                              color: "#007674",
                              marginBottom: 2,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {senderName}
                          </div>
                          <div
                            style={{
                              fontWeight: 500,
                              fontSize: 14,
                              color: "#222",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {data.message}
                          </div>
                        </div>
                      </div>
                    ),
                    {
                      position: "bottom-right",
                      duration: 4000,
                      id: data._id || undefined,
                    }
                  );
                }
                return {
                  ...chat,
                  last_message: {
                    _id: data._id,
                    content: data.message,
                    timestamp: data.timestamp,
                    sender_id: data.sender_id,
                    status:
                      data.status ||
                      (data.sender_id === currentUserId ? "read" : "sent"),
                  },
                };
              }
            }
            return chat;
          })
        );
      }
    };
    return () => notifyWs.close();
  }, [currentUserId]);

  // The per-room WebSocket should be closed only when selectedChat changes or is set to null
  useEffect(() => {
    if (!selectedChat || !currentUserId) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }
    const roomId = selectedChat.room_id;
    if (!roomId) return;
    const ws = new window.WebSocket(`ws://localhost:5000/ws/chat/${roomId}/`);
    wsRef.current = ws;
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.error) {
        toast.error(data.error);
        return;
      }
      // Handle new message event
      const newMsg = {
        _id: data._id, // must be provided by backend!
        room_id: roomId,
        sender_id: data.sender_id,
        receiver_id: data.receiver_id,
        content: data.message,
        timestamp: data.timestamp || new Date().toISOString(),
        system: null,
        attachment: data.attachment || null,
      };
      setMessages((prev) => {
        if (newMsg._id && prev.some((m) => m._id === newMsg._id)) {
          return prev;
        }
        // fallback: dedupe by timestamp/sender/content/attachment if no _id
        if (
          !newMsg._id &&
          prev.some(
            (m) =>
              m.timestamp === newMsg.timestamp &&
              m.sender_id === newMsg.sender_id &&
              m.content === newMsg.content &&
              JSON.stringify(m.attachment) === JSON.stringify(newMsg.attachment)
          )
        ) {
          return prev;
        }
        return [...prev, newMsg];
      });
      // Update chatList last_message in real time for any room, not just the selected one
      setChatList((prev) => {
        return prev.map((chat) => {
          if (chat.room_id === roomId) {
            // Only update if the message is newer
            if (
              !chat.last_message ||
              new Date(data.timestamp) > new Date(chat.last_message.timestamp)
            ) {
              return {
                ...chat,
                last_message: {
                  _id: data._id,
                  content: data.message,
                  timestamp: data.timestamp,
                  sender_id: data.sender_id,
                  status: data.sender_id === currentUserId ? "read" : "sent", // If I sent it, it's read for me
                },
              };
            }
          }
          return chat;
        });
      });
    };
    ws.onclose = () => {};
    return () => {
      ws.close();
    };
  }, [selectedChat, currentUserId, chatList]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, selectedChat]);

  useEffect(() => {
    if (!selectedChat) {
      setSelectedClientName("");
      setSelectedClientTitle("");
      return;
    }
    if (
      selectedChat.display_name &&
      typeof selectedChat.subtitle !== "undefined"
    ) {
      setSelectedClientName(selectedChat.display_name);
      setSelectedClientTitle(selectedChat.subtitle);
      return;
    }
    axios
      .get(`/api/auth/client/profile/${selectedChat.other_user_id}/`)
      .then((clientRes) => {
        const name = clientRes.data.name || "";
        setSelectedClientName(name);
        axios
          .get(`/api/auth/jobposts/client/${selectedChat.other_user_id}/`)
          .then((jobRes) => {
            let jobTitle = "";
            if (
              jobRes.data &&
              jobRes.data.data &&
              jobRes.data.data.length > 0
            ) {
              const sorted = jobRes.data.data.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
              );
              jobTitle = sorted[0].title || "";
            }
            setSelectedClientTitle(jobTitle);
            setChatList((prev) =>
              prev.map((c) =>
                c.room_id === selectedChat.room_id
                  ? { ...c, display_name: name, subtitle: jobTitle }
                  : c
              )
            );
          })
          .catch(() => setSelectedClientTitle(""));
      })
      .catch(() => {
        setSelectedClientName("");
        setSelectedClientTitle("");
      });
  }, [selectedChat]);

  // Add a global click handler to close the context menu
  useEffect(() => {
    if (!contextMenu.visible) return;
    const closeMenu = () => setContextMenu({ visible: false, x: 0, y: 0 });
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, [contextMenu.visible]);

  // When chat is closed, context menu should also close
  useEffect(() => {
    if (!selectedChat && contextMenu.visible) {
      setContextMenu({ visible: false, x: 0, y: 0 });
    }
  }, [selectedChat]);

  // When a chat is opened, mark all messages as read for that room and user
  useEffect(() => {
    if (selectedChat && selectedChat.room_id && currentUserId) {
      axios.post("/api/chats/mark-read/", {
        room_id: selectedChat.room_id,
        user_id: currentUserId,
      });
      // Update chatList in real time to remove badge
      setChatList((prev) =>
        prev.map((chat) =>
          chat.room_id === selectedChat.room_id && chat.last_message
            ? {
                ...chat,
                last_message: {
                  ...chat.last_message,
                  status: "read",
                },
              }
            : chat
        )
      );
    }
  }, [selectedChat, currentUserId]);

  // Now you can safely do the conditional render
  if (windowWidth < 1024) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Urbanist, sans-serif",
          fontSize: 20,
          color: "#007674",
          background: "#f6f8fa",
        }}
      >
        Please login with Desktop to have a chats.
      </div>
    );
  }

  const handleEmojiSelect = (emoji) => {
    const input = inputRef.current;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const newValue =
      message.substring(0, start) + emoji.native + message.substring(end);
    setMessage(newValue);
    setShowEmojiPicker(false);
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(
        start + emoji.native.length,
        start + emoji.native.length
      );
    }, 0);
  };

  const transliterate = async (word) => {
    let itc = null;
    if (selectedLanguage === "Hindi") itc = "hi-t-i0-und";
    else if (selectedLanguage === "Gujarati") itc = "gu-t-i0-und";
    if (!itc) return word;
    const url = `https://inputtools.google.com/request?text=${encodeURIComponent(
      word
    )}&itc=${itc}&num=1`;
    const res = await fetch(url);
    const data = await res.json();
    if (data[0] === "SUCCESS" && data[1][0][1].length > 0) {
      return data[1][0][1][0];
    }
    return word;
  };

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setMessage(value);
    if (selectedLanguage === "Hindi" || selectedLanguage === "Gujarati") {
      const words = value.split(" ");
      const lastWord = words[words.length - 1];
      if (lastWord) {
        const sug = await transliterate(lastWord);
        setSuggestion(sug !== lastWord ? sug : "");
      } else {
        setSuggestion("");
      }
    } else {
      setSuggestion("");
    }
  };

  const acceptSuggestion = () => {
    if (!suggestion) return;
    const words = message.split(" ");
    words[words.length - 1] = suggestion;
    const newMsg = words.join(" ");
    setMessage(newMsg + " ");
    setSuggestion("");
    setTimeout(() => {
      inputRef.current.focus();
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (
      (selectedLanguage === "Hindi" || selectedLanguage === "Gujarati") &&
      suggestion &&
      (e.key === "Tab" || e.key === "Enter")
    ) {
      e.preventDefault();
      acceptSuggestion();
    }
  };

  const handleAttachmentOption = (type) => {
    setAttachmentType(type);
    setShowAttachmentOptions(false);
    setTimeout(() => {
      if (fileInputRef.current) fileInputRef.current.click();
    }, 0);
  };

  // Handle file input change (for attachments)
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedChat) return;
    setUploading(true);
    setUploadProgress(0);
    try {

      const formData = new FormData();
      formData.append("file", file);

      // Use axios for progress
      const res = await axios.post("/api/chats/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percent);
        },
      });


      // Assume response: { url, type: 'image'|'file', name }
      const { url, type, name } = res.data;

      // Skip accessibility check for data URIs; otherwise, test with HEAD
      if (typeof url === "string" && !url.startsWith("data:")) {
        try {
          const testResponse = await fetch(url, { method: "HEAD" });
          if (!testResponse.ok) {
            console.warn("Uploaded file may not be accessible:", url);
          } else {
          }
        } catch (testErr) {
          console.warn("Could not verify uploaded file accessibility:", testErr);
        }
      }

      // Send message with attachment
      await axios.post("/api/chats/", {
        sender: currentUserId,
        receiver: selectedChat.other_user_id,
        message: "", // No text, just attachment
        attachment: { url, type, name },
      });

      setUploading(false);
      setUploadProgress(0);
      setSelectedFiles([]);

      // Optionally, trigger a refresh
      if (wsRef.current && wsRef.current.readyState === 1) {
        wsRef.current.send(
          JSON.stringify({
            attachment: { url, type, name },
            sender_id: currentUserId,
            receiver_id: selectedChat.other_user_id,
            timestamp: new Date().toISOString(),
          })
        );
      }
    } catch (err) {
      console.error("Upload error:", err);
      setUploading(false);
      setUploadProgress(0);
      alert("Failed to upload file: " + err.message);
    }
  };

  // Add handleSendMessage function
  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat) return;
    const newMsg = {
      room_id:
        selectedChat.room_id ||
        (currentUserId && selectedChat.other_user_id
          ? [currentUserId, selectedChat.other_user_id].sort().join("_")
          : ""),
      sender_id: currentUserId,
      receiver_id: selectedChat.other_user_id,
      content: message,
      timestamp: new Date().toISOString(),
      system: null,
    };
    try {
      await axios.post("/api/chats/", {
        sender: currentUserId,
        receiver: selectedChat.other_user_id,
        message: message,
      });
      setMessage("");
      setSuggestion("");
      // Send via WebSocket for real-time update
      if (wsRef.current && wsRef.current.readyState === 1) {
        wsRef.current.send(
          JSON.stringify({
            message: message,
            sender_id: currentUserId,
            receiver_id: selectedChat.other_user_id,
            timestamp: newMsg.timestamp,
          })
        );
      }
      // Do NOT optimistically add the message here (let WebSocket handle it)
      // Do NOT re-fetch after a delay; rely on WebSocket for real-time update
    } catch (err) {
      alert("Failed to send message: " + err.message);
    }
  };

  // Add a helper to format time as hh:mm
  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    // Always show time in IST (Asia/Kolkata)
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  };

  // Add a helper function for time formatting (if not already present)
  const formatTimeShort = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Add a helper to get full date and time in IST
  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  };

  // Helper to get date string in IST
  const getDateStringIST = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    // Get date in IST
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
  };
  // Helper to get 'Today', 'Yesterday', or date
  const getDateLabel = (dateString) => {
    if (!dateString) return "";
    const now = new Date();
    const date = new Date(dateString);
    // Convert both to IST midnight
    const toISTMidnight = (d) => {
      return new Date(
        d.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }).split(",")[0] +
          " 00:00:00"
      );
    };
    const todayIST = toISTMidnight(now);
    const msgIST = toISTMidnight(date);
    const diff = (todayIST - msgIST) / (1000 * 60 * 60 * 24);
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    return getDateStringIST(dateString);
  };

  // In the messages section, group by date and show date separators
  const groupedMessages = [];
  let lastDate = null;
  messages.forEach((msg, idx) => {
    const msgDate = getDateStringIST(msg.timestamp);
    if (msgDate !== lastDate) {
      groupedMessages.push({ type: "date", date: msg.timestamp });
      lastDate = msgDate;
    }
    groupedMessages.push({ type: "msg", msg, idx });
  });

  // Replace mockFiles with logic to extract files/links from messages for the selected chat
  // Add this above the return statement:
  const filesAndLinks = messages
    .filter((msg) => msg.attachment?.url || msg.attachment_url)
    .map((msg) => {
      // Determine sender name
      let user = "";
      if (msg.sender_id === currentUserId) {
        user = "You";
      } else if (selectedChat && selectedChat.display_name) {
        user = selectedChat.display_name;
      } else if (msg.sender_name) {
        user = msg.sender_name;
      } else {
        user = msg.sender_id;
      }
      // Format date/time
      const dateTime = msg.timestamp
        ? new Date(msg.timestamp).toLocaleString()
        : "";
      return {
        type: (() => {
          const url = msg.attachment?.url || msg.attachment_url || "";
          const name = msg.attachment?.name || msg.attachment_name || "";
          if (
            msg.attachment?.type === "image" ||
            msg.attachment_type === "image"
          )
            return "image";
          if (name.endsWith(".pdf")) return "pdf";
          if (name.endsWith(".doc") || name.endsWith(".docx")) return "doc";
          if (name.endsWith(".csv")) return "csv";
          if (url.startsWith("http")) return "link";
          return "file";
        })(),
        label: msg.attachment?.name || msg.attachment_name || "",
        url: msg.attachment?.url || msg.attachment_url,
        user,
        time: dateTime,
        size: "", // Optionally, fetch file size if available
      };
    });

  // When a file is clicked in the sidebar, highlight the corresponding message
  const handleFileClick = (file) => {
    const msg = messages.find(
      (m) =>
        (m.attachment?.url || m.attachment_url) === file.url &&
        (m.attachment?.name || m.attachment_name) === file.label
    );
    if (msg && msg._id) {
      setHighlightedMsgId(msg._id);
      setTimeout(() => setHighlightedMsgId(null), 2000);
      if (messageRefs.current[msg._id]) {
        messageRefs.current[msg._id].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  };

  return (
    <>
      <Toaster />
      <div
        style={{
          minHeight: "100vh",
          width: "100vw",
          maxWidth: "100vw",
          fontFamily: "Urbanist, sans-serif",
          background: "#f7f2fa",
          display: "flex",
          flexDirection: "row",
        }}
      >
        {/* Left Sidebar */}
        <div
          style={{
            width: 340,
            background: "#fff",
            borderRight: "1.5px solid #e9ecef",
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            minHeight: 0,
            boxSizing: "border-box",
            borderTopLeftRadius: 16,
            borderBottomLeftRadius: 16,
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "24px 24px 12px 24px",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 22, color: "#007476" }}>
              Messages
            </div>
            <button
              style={{
                background: "none",
                border: "none",
                fontSize: 22,
                color: "#007476",
                cursor: "pointer",
              }}
              onClick={() => {
                navigate(-1);
              }}
            >
              X
            </button>
          </div>
          {/* Search */}
          <div style={{ padding: "0 24px 18px 24px" }}>
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 12,
                border: "2px solid #e9ecef",
                fontSize: 16,
                background: "#f8f9fa",
                outline: "none",
                color: "#495057",
                fontWeight: 500,
                transition: "all 0.3s ease",
              }}
            />
          </div>
          {/* Chat List */}
          <div
            className="hide-scrollbar"
            style={{
              flex: 1,
              padding: "0 0 0 0",
              overflowY: "auto",
              overflowX: "hidden",
              minHeight: 0,
            }}
          >
            {loadingChats ? (
              <div
                style={{ color: "#007674", textAlign: "center", marginTop: 40 }}
              >
                Loading chats...
              </div>
            ) : errorChats ? (
              <div
                style={{ color: "#e53935", textAlign: "center", marginTop: 40 }}
              >
                {errorChats}
              </div>
            ) : chatList.length === 0 ? (
              <div
                style={{ color: "#888", textAlign: "center", marginTop: 40 }}
              >
                No chats yet.
              </div>
            ) : (
              chatList
                .filter((chat) => {
                  if (!search.trim()) return true;
                  const q = search.toLowerCase();
                  return (
                    (chat.display_name &&
                      chat.display_name.toLowerCase().includes(q)) ||
                    (chat.subtitle && chat.subtitle.toLowerCase().includes(q))
                  );
                })
                .map((chat, idx) => {
                  const isUnread =
                    chat.last_message &&
                    chat.last_message.sender_id !== currentUserId &&
                    chat.last_message.status !== "read";
                  return (
                    <div
                      key={chat.room_id}
                      onClick={() => setSelectedChat(chat)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 16px",
                        background:
                          selectedChat && selectedChat.room_id === chat.room_id
                            ? "#f8f9ff"
                            : "transparent",
                        borderRadius: "12px",
                        border:
                          selectedChat && selectedChat.room_id === chat.room_id
                            ? "2px solid #e9ecef"
                            : "2px solid transparent",
                        fontWeight:
                          selectedChat && selectedChat.room_id === chat.room_id
                            ? "600"
                            : "400",
                        color:
                          selectedChat && selectedChat.room_id === chat.room_id
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
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ position: "relative" }}>
                        {chat.display_avatar ? (
                          <img
                            src={chat.display_avatar}
                            alt={chat.display_name || "Client"}
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: "50%",
                              objectFit: "cover",
                              marginBottom: 0,
                              marginRight: 2,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: "50%",
                              background: getColorFromName(chat.display_name),
                              color: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              fontSize: 16,
                              marginBottom: 0,
                              marginRight: 2,
                              border: "2px solid #e9ecef",
                            }}
                          >
                            {getInitials(
                              chat.display_name || chat.other_user_id
                            )}
                          </div>
                        )}
                        {isUnread && (
                          <span
                            style={{
                              position: "absolute",
                              top: 2,
                              right: 2,
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              background: "#e53935",
                              border: "2px solid #fff",
                              display: "block",
                              zIndex: 2,
                            }}
                          />
                        )}
                        {/* Online Status Indicator */}
                        <div
                          style={{
                            position: "absolute",
                            bottom: 2,
                            right: 2,
                            zIndex: 2,
                          }}
                        >
                          <UserStatusIndicator
                            status={userOnlineStatus[chat.other_user_id]}
                            size={12}
                          />
                        </div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 14,
                            color:
                              selectedChat &&
                              selectedChat.room_id === chat.room_id
                                ? "#007476"
                                : "#495057",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {chat.display_name || "Loading..."}
                        </div>
                        <div
                          style={{
                            color:
                              selectedChat &&
                              selectedChat.room_id === chat.room_id
                                ? "#6c757d"
                                : "#6c757d",
                            fontSize: 12,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {chat.subtitle || ""}
                        </div>
                        <div
                          style={{
                            color:
                              selectedChat &&
                              selectedChat.room_id === chat.room_id
                                ? "#6c757d"
                                : "#495057",
                            fontSize: 12,
                            marginTop: 2,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {chat.last_message &&
                            getAttachmentLabel(chat.last_message)}
                        </div>
                      </div>
                      <div
                        style={{
                          color:
                            selectedChat &&
                            selectedChat.room_id === chat.room_id
                              ? "#007476"
                              : "#6c757d",
                          fontWeight: 500,
                          fontSize: 12,
                          marginLeft: 8,
                        }}
                      >
                        {chat.last_message && chat.last_message.timestamp
                          ? formatTimeShort(chat.last_message.timestamp)
                          : ""}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
        {/* Main Chat Area + Files Sidebar Container */}
        <div style={{ display: "flex", flex: 1, height: "100vh", minWidth: 0 }}>
          {/* Main Chat Area */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              background: "#fff",
              height: "100vh",
              transition: "all 0.4s cubic-bezier(.4,2,.6,1)",
              borderTopRightRadius: showFilesSidebar ? 0 : 16,
              borderBottomRightRadius: showFilesSidebar ? 0 : 16,
            }}
          >
            {/* Chat header */}
            {selectedChat ? (
              <div
                style={{
                  padding: "24px 32px",
                  borderBottom: "1px solid #e9ecef",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  background: "#fff",
                  borderRadius: "16px 16px 0 0",
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                  borderTopRightRadius: showFilesSidebar ? 0 : 16,
                }}
              >
                {selectedChat.display_avatar ? (
                  <img
                    src={selectedChat.display_avatar}
                    alt={selectedClientName || "Client"}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid #e9ecef",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: getColorFromName(selectedClientName),
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 20,
                      border: "2px solid #e9ecef",
                    }}
                  >
                    {getInitials(
                      selectedClientName || selectedChat.other_user_id
                    )}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <h4
                    style={{
                      fontWeight: "600",
                      color: "#121212",
                      margin: "0",
                      fontSize: "20px",
                    }}
                  >
                    {selectedClientName || "Client Name"}
                  </h4>
                  <p
                    style={{
                      color: "#4d5ff8",
                      fontWeight: "500",
                      margin: "0",
                      fontSize: "14px",
                    }}
                  >
                    {selectedClientTitle || "Client Title"}
                  </p>
                </div>
                <div
                  style={{
                    color: "#4d5ff8",
                    fontWeight: "600",
                    fontSize: "15px",
                    marginRight: 12,
                  }}
                >
                  ● Online
                </div>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  {/* Toggle Files Sidebar Button */}
                  <button
                    onClick={() => setShowFilesSidebar((v) => !v)}
                    style={{
                      background: showFilesSidebar
                        ? "linear-gradient(90deg, #007674 0%, #005a58 100%)"
                        : "#e0f7f6",
                      color: showFilesSidebar ? "#fff" : "#007674",
                      border: "none",
                      borderRadius: 14,
                      fontWeight: 700,
                      fontSize: 18,
                      padding: "8px 18px",
                      marginLeft: 8,
                      cursor: "pointer",
                      boxShadow: showFilesSidebar
                        ? "0 2px 8px rgba(0,118,116,0.13)"
                        : undefined,
                      transition: "all 0.3s cubic-bezier(.4,2,.6,1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    aria-label={showFilesSidebar ? "Hide Files" : "Show Files"}
                    title={showFilesSidebar ? "Hide Files" : "Show Files"}
                  >
                    {showFilesSidebar ? (
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          cx="11"
                          cy="11"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                        />
                        <path
                          d="M9 7l4 4-4 4"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          x="3"
                          y="7"
                          width="16"
                          height="10"
                          rx="2"
                          fill="currentColor"
                          fillOpacity="0.12"
                        />
                        <path
                          d="M3 7a2 2 0 012-2h3.5a2 2 0 011.6.8l.8 1.2A2 2 0 0012.5 8H19a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: "24px 32px",
                  borderBottom: "1px solid #e9ecef",
                  background: "#fff",
                  borderRadius: "16px 16px 0 0",
                  borderTopRightRadius: showFilesSidebar ? 0 : 16,
                  color: "#6c757d",
                  fontSize: 18,
                  textAlign: "center",
                  minHeight: 94,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                }}
              >
                Select a chat to start messaging
              </div>
            )}
            {/* Messages */}
            <div
              className="hide-scrollbar"
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                overflowX: "hidden",
                padding: "24px 32px",
                background: "#fff",
                display: "flex",
                flexDirection: "column",
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({ visible: true, x: e.clientX, y: e.clientY });
              }}
            >
              {selectedChat ? (
                loadingMessages ? (
                  <div
                    style={{
                      color: "#007674",
                      textAlign: "center",
                      marginTop: 40,
                    }}
                  >
                    Loading messages...
                  </div>
                ) : errorMessages ? (
                  <div
                    style={{
                      color: "#e53935",
                      textAlign: "center",
                      marginTop: 40,
                    }}
                  >
                    {errorMessages}
                  </div>
                ) : messages.length === 0 ? (
                  <div
                    style={{
                      color: "#888",
                      textAlign: "center",
                      marginTop: 40,
                    }}
                  >
                    No messages yet.
                  </div>
                ) : (
                  <>
                    {groupedMessages.map((item, i) => {
                      if (item.type === "date") {
                        return (
                          <div
                            key={"date-" + item.date}
                            style={{
                              textAlign: "center",
                              color: "#007476",
                              fontWeight: 700,
                              fontSize: 15,
                              margin: "18px 0 10px 0",
                              letterSpacing: 1,
                              opacity: 0.85,
                            }}
                          >
                            {getDateLabel(item.date)}
                          </div>
                        );
                      } else {
                        const msg = item.msg;
                        // Modern message bubble with attachment support
                        const isImage =
                          (msg.attachment && msg.attachment.type === "image") ||
                          (msg.attachment?.url &&
                            msg.attachment?.type === "image") ||
                          (msg.attachment_url &&
                            msg.attachment_type === "image") ||
                          (msg.attachment?.url &&
                            msg.attachment?.url.match(
                              /\.(jpg|jpeg|png|gif|webp|svg)$/i
                            )) ||
                          (msg.attachment_url &&
                            msg.attachment_url.match(
                              /\.(jpg|jpeg|png|gif|webp|svg)$/i
                            ));
                        const isFile =
                          (msg.attachment && msg.attachment.type === "file") ||
                          (msg.attachment?.url &&
                            msg.attachment?.type === "file") ||
                          (msg.attachment_url &&
                            msg.attachment_type === "file");
                        const attachmentUrl =
                          msg.attachment?.url || msg.attachment_url;
                        const attachmentName =
                          msg.attachment?.name || msg.attachment_name;

                      
                        return (
                          <div
                            key={msg._id || item.idx}
                            ref={(el) => {
                              if (msg._id) messageRefs.current[msg._id] = el;
                            }}
                            style={{
                              display: "flex",
                              flexDirection:
                                msg.sender_id === currentUserId
                                  ? "row-reverse"
                                  : "row",
                              alignItems: "flex-end",
                              gap: 14,
                              boxShadow:
                                highlightedMsgId === msg._id
                                  ? "0 0 0 3px #00767455"
                                  : undefined,
                              transition: "box-shadow 0.3s",
                            }}
                          >
                            <div style={{ maxWidth: "70%" }}>
                              <div
                                style={{
                                  background:
                                    msg.sender_id === currentUserId
                                      ? "#007476"
                                      : "#f8f9fa",
                                  color:
                                    msg.sender_id === currentUserId
                                      ? "#fff"
                                      : "#495057",
                                  borderRadius: "18px",
                                  padding: isImage ? 0 : "16px 20px",
                                  fontSize: 16,
                                  fontWeight: 500,
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                                  border:
                                    msg.sender_id === currentUserId
                                      ? "none"
                                      : "1px solid #e9ecef",
                                  marginBottom: 2,
                                  transition: "all 0.3s ease",
                                  position: "relative",
                                  overflow: isImage ? "hidden" : undefined,
                                  wordBreak: "break-word",
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                              >
                                {/* Image attachment */}
                                {isImage && (
                                  <>
                                    <div style={{ position: "relative" }}>
                                      <img
                                        src={attachmentUrl}
                                        alt={attachmentName || "Image"}
                                        style={{
                                          width: 180,
                                          height: 180,
                                          objectFit: "cover",
                                          borderRadius: 14,
                                          cursor: "pointer",
                                          display: "block",
                                        }}
                                        onClick={() =>
                                          setImageModal({
                                            open: true,
                                            url: attachmentUrl,
                                          })
                                        }
                                        onError={(e) => {
                                          console.error(
                                            "Image failed to load:",
                                            attachmentUrl
                                          );
                                          e.target.style.display = "none";
                                          // Show a fallback message
                                          const fallbackDiv =
                                            document.createElement("div");
                                          fallbackDiv.innerHTML = `
                                            <div style="
                                              width: 180px; 
                                              height: 180px; 
                                              background: #f8f9fa; 
                                              border: 2px dashed #dee2e6; 
                                              border-radius: 14px; 
                                              display: flex; 
                                              align-items: center; 
                                              justify-content: center; 
                                              color: #6c757d; 
                                              font-size: 14px;
                                              text-align: center;
                                              padding: 10px;
                                            ">
                                              <div>
                                                <div style="font-size: 24px; margin-bottom: 8px;">📷</div>
                                                <div>Image not available</div>
                                                <div style="font-size: 12px; margin-top: 4px;">${
                                                  attachmentName ||
                                                  "Unknown file"
                                                }</div>
                                              </div>
                                            </div>
                                          `;
                                          e.target.parentNode.appendChild(
                                            fallbackDiv.firstElementChild
                                          );
                                        }}
                                        
                                      />
                                    </div>
                                    {msg.content && (
                                      <div style={{ padding: "10px 14px" }}>
                                        {msg.content}
                                      </div>
                                    )}
                                  </>
                                )}
                                {/* File attachment */}
                                {isFile && (
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 10,
                                      padding: "10px 0 10px 0",
                                      cursor: "pointer",
                                    }}
                                    onClick={() => {
                                      const link = document.createElement("a");
                                      link.href = attachmentUrl;
                                      link.download = attachmentName;
                                      link.target = "_blank";
                                      link.rel = "noopener noreferrer";
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                    }}
                                    title="Click to download file"
                                  >
                                    <FileIcon
                                      type={
                                        attachmentName?.split(".").pop() ||
                                        "file"
                                      }
                                    />
                                    <div
                                      style={{
                                        flex: 1,
                                        minWidth: 0,
                                        fontWeight: 600,
                                        fontSize: 15,
                                        color:
                                          msg.sender_id === currentUserId
                                            ? "#fff"
                                            : "#007476",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {attachmentName}
                                    </div>
                                  </div>
                                )}
                                {/* Text message (if not image/file only) */}
                                {!isImage && !isFile && msg.content}
                              </div>
                              <div
                                style={{
                                  color: "#6c757d",
                                  fontSize: 12,
                                  marginTop: 2,
                                  textAlign:
                                    msg.sender_id === currentUserId
                                      ? "right"
                                      : "left",
                                }}
                              >
                                {msg.timestamp ? formatTime(msg.timestamp) : ""}
                              </div>
                            </div>
                          </div>
                        );
                      }
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )
              ) : (
                <div
                  style={{ color: "#888", textAlign: "center", marginTop: 40 }}
                >
                  Select a chat to view messages.
                </div>
              )}
            </div>
            {/* Render the context menu if visible */}
            {contextMenu.visible && (
              <div
                style={{
                  position: "fixed",
                  top: contextMenu.y,
                  left: contextMenu.x,
                  background: "#fff",
                  border: "1.5px solid #e3e3e3",
                  borderRadius: 8,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.13)",
                  zIndex: 1000,
                  minWidth: 140,
                  padding: "6px 0",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  style={{
                    padding: "10px 18px",
                    cursor: "pointer",
                    color: "#e53935",
                    fontWeight: 600,
                    fontSize: 15,
                    borderRadius: 6,
                    transition: "background 0.2s",
                  }}
                  onClick={() => {
                    setSelectedChat(null);
                    setContextMenu({ visible: false, x: 0, y: 0 });
                  }}
                >
                  Close Chat
                </div>
              </div>
            )}
            {/* Message input */}
            <div
              style={{
                background: "#fff",
                borderTop: "1px solid #e9ecef",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderBottomRightRadius: showFilesSidebar ? 0 : 16,
                transition: "all 0.4s cubic-bezier(.4,2,.6,1)",
                minHeight: 80,
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  margin: "18px 24px",
                  borderRadius: 24,
                  background: "#f8f9fa",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                  border: "2px solid #e9ecef",
                  padding: "0 0 0 20px",
                  position: "relative",
                }}
              >
                {/* Input */}
                <div style={{ position: "relative" }}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={message}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      handleKeyDown(e);
                      if (e.key === "Enter" && !e.shiftKey && !suggestion) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={
                      selectedChat
                        ? "Send a message..."
                        : "Select a chat to start messaging..."
                    }
                    lang={languageCodes[selectedLanguage] || "en"}
                    style={{
                      border: "none",
                      outline: "none",
                      fontSize: 18,
                      fontWeight: 500,
                      padding: "12px 0",
                      borderRadius: 24,
                      background: "transparent",
                      color: "#495057",
                      width: "100%",
                    }}
                    disabled={!selectedChat}
                  />
                  {/* Show suggestion if available */}
                  {(selectedLanguage === "Hindi" ||
                    selectedLanguage === "Gujarati") &&
                    suggestion && (
                      <div
                        style={{
                          position: "absolute",
                          left: 30,
                          bottom: 12,
                          background: "#fff",
                          border: "1px solid #e3e3e3",
                          borderRadius: 8,
                          padding: "2px 10px",
                          color: "#007674",
                          fontWeight: 600,
                          cursor: "pointer",
                          zIndex: 10,
                          fontSize: 15,
                        }}
                        onClick={acceptSuggestion}
                      >
                        {suggestion}{" "}
                        <span style={{ fontSize: 12, color: "#888" }}>
                          (Tab/Enter)
                        </span>
                      </div>
                    )}
                </div>
                {/* Icon Row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "0 10px 10px 10px",
                    gap: 18,
                    width: "100%",
                    position: "relative",
                  }}
                >
                  {/* Left group */}
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <BsType
                      size={22}
                      color="#888"
                      style={{ cursor: "pointer" }}
                      onClick={() => setShowLanguagePicker((v) => !v)}
                    />
                    <span
                      style={{
                        fontSize: 12,
                        color: "#007674",
                        marginLeft: 4,
                        fontWeight: 600,
                      }}
                    >
                      {selectedLanguage}
                    </span>
                    {showLanguagePicker && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: 28,
                          left: 0,
                          background: "#fff",
                          border: "1.5px solid #e3e3e3",
                          borderRadius: 10,
                          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                          zIndex: 200,
                          minWidth: 120,
                          padding: "6px 0",
                        }}
                      >
                        {languages.map((lang) => (
                          <div
                            key={lang}
                            onClick={() => {
                              setSelectedLanguage(lang);
                              setShowLanguagePicker(false);
                            }}
                            style={{
                              padding: "7px 16px",
                              cursor: "pointer",
                              color:
                                lang === selectedLanguage ? "#fff" : "#222",
                              background:
                                lang === selectedLanguage
                                  ? "linear-gradient(90deg, #007674 0%, #005a58 100%)"
                                  : "#fff",
                              fontWeight: lang === selectedLanguage ? 700 : 500,
                              borderRadius: 6,
                              margin: "2px 6px",
                              fontSize: 14,
                              transition: "background 0.2s, color 0.2s",
                            }}
                          >
                            {lang}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <BsPaperclip
                      size={22}
                      color="#888"
                      style={{ cursor: "pointer" }}
                      onClick={() => setShowAttachmentOptions((v) => !v)}
                    />
                    {/* Attachment Options Dropup */}
                    {showAttachmentOptions && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: 28, // place above the icon
                          left: 0,
                          background: "#fff",
                          border: "1.5px solid #e3e3e3",
                          borderRadius: 10,
                          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                          zIndex: 200,
                          minWidth: 120,
                          padding: "6px 0",
                          fontFamily: "Urbanist, sans-serif",
                        }}
                      >
                        <div
                          onClick={() => handleAttachmentOption("media")}
                          style={{
                            padding: "7px 16px",
                            cursor: "pointer",
                            color: attachmentType === "media" ? "#fff" : "#222",
                            background:
                              attachmentType === "media"
                                ? "linear-gradient(90deg, #007674 0%, #005a58 100%)"
                                : "#fff",
                            fontWeight: attachmentType === "media" ? 700 : 500,
                            borderRadius: 6,
                            margin: "2px 6px",
                            fontSize: 14,
                            transition: "background 0.2s, color 0.2s",
                          }}
                        >
                          Photos & Videos
                        </div>
                        <div
                          onClick={() => handleAttachmentOption("document")}
                          style={{
                            padding: "7px 16px",
                            cursor: "pointer",
                            color:
                              attachmentType === "document" ? "#fff" : "#222",
                            background:
                              attachmentType === "document"
                                ? "linear-gradient(90deg, #007674 0%, #005a58 100%)"
                                : "#fff",
                            fontWeight:
                              attachmentType === "document" ? 700 : 500,
                            borderRadius: 6,
                            margin: "2px 6px",
                            fontSize: 14,
                            transition: "background 0.2s, color 0.2s",
                          }}
                        >
                          Document
                        </div>
                      </div>
                    )}
                    {/* Hidden File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      style={{ display: "none" }}
                      accept={
                        attachmentType === "media"
                          ? "image/*,video/*"
                          : attachmentType === "document"
                          ? ".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,text/plain"
                          : undefined
                      }
                      onChange={handleFileChange}
                    />
                  </div>
                  <BsSun size={22} color="#888" />
                  {/* Smiley with emoji picker */}
                  <div style={{ position: "relative" }}>
                    <FiSmile
                      size={22}
                      color="#888"
                      style={{ cursor: "pointer" }}
                      onClick={() => setShowEmojiPicker((v) => !v)}
                    />
                    {showEmojiPicker && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: 36,
                          left: 0,
                          zIndex: 100,
                        }}
                      >
                        <Picker
                          data={filteredData}
                          onEmojiSelect={handleEmojiSelect}
                          theme="light"
                        />
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1 }} />
                  <button
                    style={{
                      background: message && !isTyping ? "#007476" : "#e9ecef",
                      border: "none",
                      borderRadius: "50%",
                      width: 44,
                      height: 44,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                      cursor: message && !isTyping ? "pointer" : "not-allowed",
                      transition: "all 0.3s ease",
                    }}
                    disabled={!message || isTyping}
                    onMouseEnter={(e) => {
                      if (message && !isTyping) {
                        e.target.style.background = "#007476";
                        e.target.style.transform = "scale(1.05)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (message && !isTyping) {
                        e.target.style.background = "#007476";
                        e.target.style.transform = "scale(1)";
                      }
                    }}
                    aria-label="Send"
                    onClick={handleSendMessage}
                  >
                    <LuSendHorizontal size={22} color="#fff" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Right Sidebar (Files/Links) always rendered, animated */}
          <div
            style={{
              width: showFilesSidebar ? 340 : 0,
              opacity: showFilesSidebar ? 1 : 0,
              pointerEvents: showFilesSidebar ? "auto" : "none",
              overflow: showFilesSidebar ? "visible" : "hidden",
              background: "#fff",
              borderLeft: "1.5px solid #e3e3e3",
              display: "flex",
              flexDirection: "column",
              height: "100vh",
              boxSizing: "border-box",
              position: "relative",
              transition:
                "width 0.4s cubic-bezier(.4,2,.6,1), opacity 0.3s cubic-bezier(.4,2,.6,1)",
              zIndex: 10,
              boxShadow: "-2px 0 12px rgba(0,118,116,0.04)",
            }}
          >
            {showFilesSidebar && (
              <>
                {/* Header */}
                <div
                  style={{
                    padding: "22px 22px 0 22px",
                    fontWeight: 700,
                    fontSize: 18,
                    color: "#007674",
                  }}
                >
                  Files and links
                </div>
                {/* Search */}
                <div style={{ padding: "18px 22px 0 22px" }}>
                  <input
                    type="text"
                    placeholder="Search files"
                    value={filesSearch}
                    onChange={(e) => setFilesSearch(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 14px",
                      borderRadius: 10,
                      border: "1.5px solid #e3e3e3",
                      fontSize: 15,
                      background: "#f6f8fa",
                      outline: "none",
                      color: "#007674",
                      fontWeight: 500,
                    }}
                  />
                </div>
                {/* Tabs */}
                <div
                  style={{
                    display: "flex",
                    gap: 0,
                    margin: "18px 0 0 0",
                    borderBottom: "1.5px solid #e3e3e3",
                  }}
                >
                  {TABS.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setSelectedTab(tab)}
                      style={{
                        flex: 1,
                        background: selectedTab === tab ? "#e0f7f6" : "#fff",
                        border: "none",
                        borderBottom:
                          selectedTab === tab
                            ? "2.5px solid #007674"
                            : "2.5px solid transparent",
                        color: selectedTab === tab ? "#007674" : "#222",
                        fontWeight: 600,
                        fontSize: 15,
                        padding: "12px 0",
                        cursor: "pointer",
                        transition:
                          "color 0.2s, border-bottom 0.2s, background 0.2s",
                        borderTopLeftRadius: tab === "All" ? 10 : 0,
                        borderTopRightRadius: tab === "Links" ? 10 : 0,
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                {/* Files/Links List */}
                <div
                  style={{
                    flex: 1,
                    padding: "12px 0 0 0",
                    overflowY: "auto",
                    maxHeight: "calc(100vh - 210px)",
                  }}
                >
                  {filesAndLinks
                    .filter((file) => {
                      if (!filesSearch.trim()) return true;
                      const q = filesSearch.toLowerCase();
                      return (
                        (file.label && file.label.toLowerCase().includes(q)) ||
                        (file.user && file.user.toLowerCase().includes(q))
                      );
                    })
                    .filter((file) =>
                      selectedTab === "All"
                        ? true
                        : selectedTab === "Files"
                        ? file.type !== "link"
                        : file.type === "link"
                    )
                    .map((file, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleFileClick(file)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          padding: "14px 22px",
                          borderBottom: "1.5px solid #f2f2f2",
                          borderRadius: 10,
                          background: file.type === "link" ? "#e0f7f6" : "#fff",
                          boxShadow:
                            file.type === "link"
                              ? "0 1px 4px rgba(0,118,116,0.03)"
                              : undefined,
                          cursor: "pointer",
                          transition: "background 0.2s, box-shadow 0.2s",
                          color: "#007674",
                          fontWeight: 500,
                        }}
                      >
                        <FileIcon type={file.type} />
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: 15,
                              color: file.type === "link" ? "#007674" : "#222",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: "180px",
                            }}
                          >
                            {file.label}
                          </div>
                          <div style={{ color: "#888", fontSize: 13 }}>
                            {file.user} {file.time ? `· ${file.time}` : ""}
                          </div>
                        </div>
                        {/* <div style={{ color: "#888", fontSize: 13 }}>
                          {file.time}
                        </div> */}
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Image modal */}
      <Modal
        isOpen={imageModal.open}
        onRequestClose={() => setImageModal({ open: false, url: null })}
        style={{
          overlay: { background: "rgba(0,0,0,0.6)" },
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            border: "none",
            background: "none",
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
        }}
        ariaHideApp={false}
      >
        {imageModal.url && (
          <img
            src={imageModal.url}
            alt="Full"
            style={{
              maxWidth: "90vw",
              maxHeight: "80vh",
              borderRadius: 18,
              boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
            }}
          />
        )}
      </Modal>
      {/* Upload progress bar */}
      {uploading && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 12px rgba(0,118,116,0.13)",
            padding: "12px 32px",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <span style={{ color: "#007674", fontWeight: 700 }}>
            Uploading...
          </span>
          <div
            style={{
              width: 120,
              height: 8,
              background: "#e0f7f6",
              borderRadius: 6,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${uploadProgress}%`,
                height: "100%",
                background: "#007674",
                borderRadius: 6,
                transition: "width 0.2s",
              }}
            />
          </div>
          <span style={{ color: "#007674", fontWeight: 700 }}>
            {uploadProgress}%
          </span>
        </div>
      )}

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
    </>
  );
};

export default FreelancerMessagesPage;
