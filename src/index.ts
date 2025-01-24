import cron from "node-cron";
import { APIService } from "./services/api.service";
import { TelegramService } from "./services/telegram.service";
import { APIResponse, NotificationMessage } from "./types";

class Application {
  private apiService: APIService;
  private telegramService: TelegramService;

  constructor() {
    this.apiService = new APIService();
    this.telegramService = new TelegramService();
    this.setupCronJob();

    // Immediate check on startup
    setTimeout(() => {
      this.checkAndNotify();
    }, 2000);
  }

  private setupCronJob(): void {
    cron.schedule("*/5 * * * *", () => {
      this.checkAndNotify();
    });
  }

  private async checkAndNotify(): Promise<void> {
    try {
      const data = await this.apiService.fetchData();
      const lastCheck = this.telegramService.getLastCheck();

      const newItems = data.filter(
        (item) => new Date(item.timestamp) > lastCheck
      );

      for (const item of newItems) {
        await this.telegramService.sendNotification({
          title: item.title,
          description: item.description,
          timestamp: new Date(item.timestamp),
        });
      }

      this.telegramService.updateLastCheck();
    } catch (error) {
      console.error(
        "Error in check and notify:",
        error instanceof Error ? error.message : error
      );
    }
  }
}

// Start the application
new Application();
