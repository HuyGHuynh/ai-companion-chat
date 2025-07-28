import { useState } from "react";
import api from "../api";

function MessageInput({ chatId, onMessageSent }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post(`chats/${chatId}/message`, { message });
      setMessage("");
      onMessageSent();
    } catch (err) {
      console.error("Message send failed", err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSend} style={styles.form}>
      <input
        style={styles.input}
        type="text"
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
      />
      <button type="submit" disabled={loading} style={styles.button}>
        {loading ? "..." : "Send"}
      </button>
    </form>
  );
}

const styles = {
  form: {
    display: "flex",
    padding: "1rem",
    borderTop: "1px solid #ccc",
  },
  input: {
    flex: 1,
    padding: "1rem",
    fontSize: "1rem",
  },
  button: {
    padding: "10px",
    marginLeft: "8px",
  },
};

export default MessageInput;
