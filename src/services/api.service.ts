import axios, { AxiosInstance } from "axios";
import { config } from "../config";
import { APIResponse } from "../types";

export class APIService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.apiUrl,
    });
  }

  async fetchData(): Promise<APIResponse[]> {
    try {
      const { data } = await this.client.get<APIResponse[]>("");
      return data;
    } catch (error) {
      if (error instanceof Error) {
        console.error("API Error:", error.message);
      }
      return [];
    }
  }
  async createNotification(
    title: string,
    description: string
  ): Promise<APIResponse | null> {
    try {
      const { data } = await this.client.post<APIResponse>("/notifications", {
        title,
        description,
      });
      return data;
    } catch (error) {
      console.error(
        "API Error:",
        error instanceof Error ? error.message : error
      );
      return null;
    }
  }
}
