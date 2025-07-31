import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import ClientHeader from "../../components/ClientHeader";
import toast from "react-hot-toast";

const ClientDashboard = () => {
  const location = useLocation();
  const isMessagesPage = location.pathname.includes("/ws/client/messages");
  const [userId, setUserId] = useState(null);
  const [chatSocket, setChatSocket] = useState(null);

  useEffect(() => {
    // Fetch current user
    fetch("/api/auth/current-user/", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user && data.user._id) {
          setUserId(data.user._id);
        }
      });
  }, []);

  useEffect(() => {
    if (!userId) return;
    // For demo: listen to all rooms for this user (in production, fetch room list from API)
    // Here, just listen to a generic user channel for notifications
    const ws = new WebSocket(`ws://localhost:5000/ws/notify/${userId}/`);
    setChatSocket(ws);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (location.pathname.startsWith("/ws/messages")) return; // Don't show toast if already in chat
      if (data.system) {
        toast((t) => (
          <span>
            {data.message}
            <button
              style={{
                marginLeft: 12,
                color: "#007674",
                border: "none",
                background: "none",
                cursor: "pointer",
              }}
              onClick={() => {
                // Go to chat
                const roomId = data.room_id;
                window.location.href = `/ws/messages?room=${roomId}&user=${data.sender}`;
                toast.dismiss(t.id);
              }}
            >
              Go to chat
            </button>
          </span>
        ));
      }
    };
    return () => ws.close();
  }, [userId, location.pathname]);

  return (
    <>
      {!isMessagesPage && <ClientHeader />}
      <div>
        <Outlet />
      </div>
    </>
  );
};

export default ClientDashboard;
