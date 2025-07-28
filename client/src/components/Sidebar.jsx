function Sidebar({
  chats,
  onNewChat,
  activeChatId,
  onSelectChat,
  onDeleteChat,
}) {
  return (
    <div style={styles.sidebar}>
      <button onClick={onNewChat} style={styles.newChat}>
        New chat
      </button>
      <ul style={styles.chatList}>
        {chats.map((chat) => (
          <li
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            style={{
              ...styles.chatItem,
              backgroundColor:
                chat.id === activeChatId ? "#ddd" : "transparent",
            }}
          >
            <span>{chat.title || "New Chat"}</span>
            <button
              style={styles.deleteBtn}
              onClick={(e) => {
                e.stopPropagation();
                onDeleteChat(chat.id);
              }}
            >
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "250px",
    borderRight: "1px solid #ccc",
    padding: "1rem",
    height: "100%",
    overflowY: "auto",
    boxSizing: "border-box",
  },
  newChat: {
    width: "100%",
    padding: "10px",
    marginBottom: "1rem",
    cursor: "pointer",
  },
  chatList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  chatItem: {
    padding: "10px",
    cursor: "pointer",
    borderRadius: "4px",
  },
  deleteBtn: {
    background: "none",
    border: "none",
    color: "red",
    cursor: "pointer",
    fontSize: "1rem",
    marginLeft: "0.5rem",
  },
};

export default Sidebar;
