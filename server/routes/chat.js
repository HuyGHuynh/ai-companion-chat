const express = require("express");
const { getMessagesByChatId, addMessage } = require("../models/message");
const pool = require("../db/db");
const router = express.Router();
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});

// GET /api/chats - List all chat tab for current user
router.get("/", async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).send("Unauthorized");

  try {
    const result = await pool.query(
      "SELECT id, title, created_at FROM chats WHERE user_id = $1 ORDER BY created_at ASC",
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).send("Failed to fetch chat");
  }
});

// GET /api/chats/:id - Load full message for selected chat
router.get("/:id", async (req, res) => {
  const chatId = req.params.id;
  const userId = req.user?.id;

  try {
    const chat = await pool.query(
      "SELECT * FROM chats WHERE id = $1 AND user_id = $2",
      [chatId, userId]
    );
    if (chat.rows.length === 0) return res.status(403).send("Forbidden");

    const messages = await pool.query(
      "SELECT role, content, created_at FROM messages WHERE chat_id = $1",
      [chatId]
    );

    res.json({ chat: chat.rows[0], messages: messages.rows });
  } catch (err) {
    console.log(err);
    res.status(500).send("Failed to load message");
  }
});

// POST /api/chats - Create new chat tab
router.post("/", async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).send("Unauthorized");

  const title = req.body?.title?.trim() || "New Chat";

  try {
    const result = await pool.query(
      "INSERT INTO chats (user_id, title) VALUES ($1, $2) RETURNING *",
      [userId, title]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).send("Failed to create chat");
  }
});

// POST /api/chats/:id/title - Generate chat topic based on user initial input
router.post("/:id/title", async (req, res) => {
  const chatId = req.params.id;
  const userId = req.user?.id;

  try {
    const result = await pool.query(
      "SELECT * FROM messages WHERE chat_id = $1 AND role='user'",
      [chatId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Forbidden" });
    }

    // Get first message
    const firstMessage = result.rows[0].content;

    //Call ChatGPT
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant. Given a user's message, summarize it into a short chat title, 3 to 5 words max, no punctuation.",
        },
        {
          role: "user",
          content: firstMessage,
        },
      ],
    });

    const title = completion.choices[0].message.content;
    await pool.query(
      "UPDATE chats SET title = $1 WHERE id = $2 AND user_id = $3",
      [title, chatId, userId]
    );
    res.json({ title });
  } catch (err) {
    console.error("Error generating chat title", err);
    res.status(500).json({ error: "Failed to generate title" });
  }
});

// POST /api/chats/:id/message - Send message & get GPT reply
router.post("/:id/message", async (req, res) => {
  const chatId = req.params.id;
  const userId = req.user?.id;
  const { message } = req.body;

  try {
    // Check if this chat belongs to the user
    const chat = await pool.query(
      "SELECT * FROM chats WHERE id = $1 AND user_id = $2",
      [chatId, userId]
    );
    if (chat.rows.length === 0) return res.send(403).send("Forbidden");

    //Save user message
    await addMessage(chatId, "user", message);

    // Load chat history
    const history = await getMessagesByChatId(chatId);

    //Call ChatGPT
    const systemPrompt = {
      role: "system",
      content: `
You are a compassionate journaling companion.
Your role is to help the user reflect on their thoughts and feelings in a safe, non-judgmental space.

- Always respond with empathy and warmth.
- If the user expresses a problem, validate their feelings.
- Offer gentle follow-up questions or reflections.
- Never rush or pressure. You are a supportive presence.
`,
    };
    const messages = [systemPrompt, ...history];
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
    });

    //Save chat to database
    const reply = completion.choices[0].message.content;
    await addMessage(chatId, "assistant", reply);
    res.json({ reply });
  } catch (err) {
    console.log(err);
    res.status(500).send("Error processing message");
  }
});

// DELETE /api/chats/:id/ - Delete chat by id
router.delete("/:id", async (req, res) => {
  const chatId = req.params.id;
  const userId = req.user?.id;

  try {
    const result = await pool.query(
      "DELETE FROM chats WHERE id = $1 AND user_id = $2 RETURNING *",
      [chatId, userId]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Chat not found or unauthorized" });

    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error deleting chat");
  }
});

module.exports = router;
