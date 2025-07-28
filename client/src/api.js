import axios from "axios";

const api = axios.create({
  baseURL: "https://ai-companion-chat.onrender.com/api",
  withCredentials: true,
});

export default api;
