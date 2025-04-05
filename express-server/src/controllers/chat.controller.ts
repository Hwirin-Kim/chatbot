import { Request, Response } from "express";
import { ChatRequest } from "../types/chat.types";
import { chatService } from "../services/chat.service";

export const chatController = {
  async handleQuery(req: Request, res: Response) {
    try {
      const { query } = req.body as ChatRequest;

      if (!query) {
        return res.status(400).json({
          error: "Query is required",
        });
      }

      const response = await chatService.handleQuery(query);

      return res.json(response);
    } catch (error) {
      console.error("Error in chat controller:", error);
      return res.status(500).json({
        error: "Internal server error",
      });
    }
  },
};
