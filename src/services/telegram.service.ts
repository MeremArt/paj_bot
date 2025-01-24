import TelegramBot from "node-telegram-bot-api";
import { config } from "../config";
import axios from "axios";
import { NotificationMessage, APIResponse } from "../types";
import { APIService } from "./api.service";

export class TelegramService {
  private bot: TelegramBot;
  private lastCheck: Date;
  private apiService: APIService;

  constructor() {
    this.bot = new TelegramBot(config.telegramToken, {
      polling: {
        autoStart: true,
        params: {
          timeout: 10,
        },
      },
    });
    this.lastCheck = new Date();
    this.apiService = new APIService();
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;

      try {
        await axios.post("http://localhost:3000/api/telegram/register", {
          chat_id: chatId,
        });
        console.log("User registered:", chatId);
      } catch (error) {
        console.error("Failed to register user:", error);
      }

      const welcomeMessage = `
🌟 Welcome to Paj.Cash Bot!

I'll keep you updated with real-time notifications about:
- 💰 Transaction updates
- 🔔 System alerts
- 🚀 Performance metrics

Type /help to see available commands.

Your Chat ID: ${chatId}`;

      this.bot.sendMessage(chatId, welcomeMessage);
    });

    this.bot.onText(/\/help/, (msg) => {
      const chatId = msg.chat.id;
      const helpMessage = `
Available Commands:
/start - Restart the bot
/status - Check system status
/latest - Get latest notification`;

      this.bot.sendMessage(chatId, helpMessage);
    });

    this.bot.onText(/\/status/, (msg) => {
      this.getSystemStatus(msg.chat.id.toString());
    });

    this.bot.onText(/\/latest/, (msg) => {
      this.getLatestNotification(msg.chat.id.toString());
    });

    this.bot.on("error", (error: Error) => {
      console.error("Telegram Bot Error:", error);
    });

    // Track all messages for user registration
    this.bot.on("message", async (msg) => {
      const chatId = msg.chat.id;
      try {
        await axios.post("http://localhost:3000/api/telegram/register", {
          chat_id: chatId,
        });
        console.log("User registered from message:", chatId);
      } catch (error) {
        console.error("Failed to register user from message:", error);
      }
    });
  }

  private transformApiResponse(response: APIResponse): NotificationMessage {
    return {
      title: response.title,
      description: response.description,
      timestamp: new Date(response.timestamp),
    };
  }

  private formatMessage({
    title,
    description,
    timestamp,
  }: NotificationMessage): string {
    return `
🔔 <b>${title}</b>
📝 ${description}
🕒 ${timestamp.toLocaleString()}`;
  }

  async sendNotification(message: NotificationMessage): Promise<void> {
    try {
      await this.bot.sendMessage(config.chatId, this.formatMessage(message), {
        parse_mode: "HTML",
      });
    } catch (error) {
      console.error(
        "Error sending message:",
        error instanceof Error ? error.message : error
      );
    }
  }

  async getLatestNotification(chatId: string): Promise<void> {
    const data = await this.apiService.fetchData();
    if (data.length > 0) {
      await this.sendNotification(this.transformApiResponse(data[0]));
    } else {
      await this.bot.sendMessage(chatId, "No notifications available");
    }
  }

  async getSystemStatus(chatId: string): Promise<void> {
    await this.bot.sendMessage(
      chatId,
      "✅ System operational\n🔄 Last check: " + this.lastCheck.toLocaleString()
    );
  }

  getLastCheck(): Date {
    return this.lastCheck;
  }

  updateLastCheck(): void {
    this.lastCheck = new Date();
  }
}
