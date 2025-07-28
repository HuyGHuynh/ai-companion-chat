import { useEffect, useRef } from "react";

function ChatWindow({ messages, chatId }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!chatId) return <p>Select a chat to begin</p>;
  return (
    <div style={styles.container}>
      {messages.map((message, i) => (
        <div
          key={i}
          style={message.role === "user" ? styles.user : styles.assistant}
        >
          {message.content}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

const styles = {
  container: {
    flex: 1,
    padding: "1rem",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
  },
  user: {
    alignSelf: "flex-end",
    backgroundColor: "#7b9aaaff",
    padding: "8px",
    margin: "4px",
    borderRadius: "10px",
    maxWidth: "70%",
  },
  assistant: {
    alignSelf: "flex-start",
    backgroundColor: "grey",
    padding: "8px",
    margin: "4px",
    borderRadius: "10px",
    maxWidth: "70%",
  },
};

export default ChatWindow;
