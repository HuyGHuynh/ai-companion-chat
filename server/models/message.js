const pool = require("../db/db.js");

const getMessagesByChatId = async (chatId) => {
  try {
    const result = await pool.query(
      "SELECT role, content FROM messages WHERE chat_id = $1 ORDER BY created_at ASC",
      [chatId]
    );
    return result.rows;
  } catch (err) {
    throw err;
  }
};

const addMessage = async (chatId, role, content) => {
  try {
    await pool.query(
      "INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3)",
      [chatId, role, content]
    );
  } catch (err) {
    throw err;
  }
};

module.exports = { getMessagesByChatId, addMessage };
