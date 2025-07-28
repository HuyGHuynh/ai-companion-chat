import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api";
import ChatWindow from "../components/ChatWindow";
import MessageInput from "../components/MessageInput";
import { useCallback } from "react";
import { Navigate } from "react-router-dom";

function Home() {
  const [activeChatId, setActiveChatId] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  //Check auth on mount
  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api
      .get("/chats")
      .then((res) => setChats(res.data))
      .catch((err) => {
        console.error("Failed to load chats", err);
      });
  }, []);
  const handleLogout = async () => {
    await api.get("/auth/logout");
    setUser(null);
  };

  const handleDeleteChat = async (chatId) => {
    try {
      await api.delete(`/chats/${chatId}`);
      setChats((prev) => prev.filter((c) => c.id !== chatId));

      // If delete current active chat
      if (chatId === activeChatId) {
        setActiveChatId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error("Failed to delete chat", err);
    }
  };

  const handleSelectChat = (id) => {
    setActiveChatId(id);
  };
  const handleNewChat = async () => {
    const res = await api.post("/chats", {});
    setChats((prev) => [res.data, ...prev]);
    setActiveChatId(res.data.id);
  };
  const refreshMessages = useCallback(async () => {
    if (!activeChatId) return;
    try {
      const res = await api.get(`/chats/${activeChatId}`);
      setMessages(res.data.messages || []);

      const chat = chats.find((c) => c.id === activeChatId);
      if (chat && (!chat.title || chat.title === "New Chat")) {
        try {
          const titleRes = await api.post(`/chats/${activeChatId}/title`);
          const newTitle = titleRes.data.title;
          setChats((prev) =>
            prev.map((c) =>
              c.id === activeChatId ? { ...c, title: newTitle } : c
            )
          );
        } catch (err) {
          console.error("Failed to update title", err);
        }
      }
    } catch (err) {
      console.err("Failed to fetch message", err);
    }
  }, [activeChatId, chats]);

  useEffect(() => {
    refreshMessages();
  }, [refreshMessages, chats]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ height: "60px", flexShrink: 0 }}>
        <Navbar user={user} onLogout={handleLogout} />
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : user ? (
        <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
          <Sidebar
            chats={chats}
            onNewChat={handleNewChat}
            activeChatId={activeChatId}
            onSelectChat={handleSelectChat}
            onDeleteChat={handleDeleteChat}
          />
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            <ChatWindow chatId={activeChatId} messages={messages} />
            <MessageInput
              chatId={activeChatId}
              onMessageSent={refreshMessages}
            />
          </div>
        </div>
      ) : (
        <p>Log in to use the chat.</p>
      )}
    </div>
  );
}

export default Home;
