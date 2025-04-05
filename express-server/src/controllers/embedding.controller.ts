import { Request, Response } from "express";
import { chromaService } from "../services/chroma.service";
import { AddDocumentRequest, QueryRequest } from "../types/chroma.types";

export const embeddingController = {
  async addDocument(req: Request<{}, {}, AddDocumentRequest>, res: Response) {
    try {
      const {
        collectionName,
        document,
        questions,
        answerType,
        functionPath,
        parameters,
      } = req.body;

      if (!collectionName || !document || !questions) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // ChromaDB에 문서와 질문들 저장
      const result = await chromaService.addDocument(
        collectionName,
        document,
        questions,
        answerType,
        functionPath,
        parameters
      );

      res.json({ success: true, message: result.message });
    } catch (error) {
      console.error("Error in addDocument:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async queryCollection(req: Request<{}, {}, QueryRequest>, res: Response) {
    try {
      const { collectionName, query, limit } = req.body;

      if (!collectionName || !query) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // ChromaDB에서 유사한 문서 검색
      const results = await chromaService.queryCollection(
        collectionName,
        query,
        limit
      );

      res.json(results);
    } catch (error) {
      console.error("Error in queryCollection:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async getAllDocuments(req: Request, res: Response) {
    try {
      const { collectionName } = req.params;

      if (!collectionName) {
        return res.status(400).json({ error: "Collection name is required" });
      }

      const documents = await chromaService.getAllDocuments(collectionName);
      res.json(documents);
    } catch (error) {
      console.error("Error in getAllDocuments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};
