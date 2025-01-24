import dotenv from "dotenv";
dotenv.config();

export const config = {
  telegramToken: process.env.TELEGRAM_BOT_TOKEN!,
  chatId: process.env.TELEGRAM_CHAT_ID!,
  apiUrl: "http://localhost:3000/api/notifications",
  //   apiToken: process.env.API_TOKEN,
} as const;
