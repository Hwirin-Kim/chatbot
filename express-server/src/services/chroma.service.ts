import { ChromaClient, Collection, IncludeEnum } from "chromadb";
import {
  Answer,
  AnswerType,
  TextAnswer,
  FunctionAnswer,
  AnswerMetadata,
  QuestionMetadata,
  ChromaMetadata,
} from "../types/chroma.types";
import { openaiService } from "./openai.service";

interface DocumentEntry {
  document: string;
  embedding: number[];
  metadata: ChromaMetadata;
  id: string;
}

async function createDocumentEntries(
  document: string,
  questions: string[],
  answerType: AnswerType = "text",
  functionPath?: string,
  parameters?: Record<string, any>
): Promise<DocumentEntry[]> {
  const timestamp = Date.now();
  const answerId = `answer_${timestamp}`;
  const entries: DocumentEntry[] = [];

  // 1. 답변 엔트리 생성
  const documentEmbedding = await openaiService.createEmbedding(document);
  entries.push({
    document,
    embedding: documentEmbedding,
    metadata: {
      type: "answer",
      answerType: answerType.toString(),
      id: answerId,
      functionPath:
        answerType === "function" ? functionPath?.toString() : undefined,
      parameters:
        answerType === "function" ? JSON.stringify(parameters) : undefined,
    },
    id: answerId,
  });

  // 2. 질문 엔트리들 생성
  const questionEmbeddings = await Promise.all(
    questions.map((q) => openaiService.createEmbedding(q))
  );

  questions.forEach((question, index) => {
    entries.push({
      document: question,
      embedding: questionEmbeddings[index],
      metadata: {
        type: "question",
        answerId: answerId.toString(),
      },
      id: `question_${timestamp}_${index}`,
    });
  });

  return entries;
}

export class ChromaService {
  private client: ChromaClient;
  private collections: Map<string, Collection> = new Map();

  constructor() {
    this.client = new ChromaClient({
      path: process.env.CHROMA_HOST
        ? `http://${process.env.CHROMA_HOST}:${process.env.CHROMA_PORT}`
        : "http://localhost:8000",
    });
  }

  async getOrCreateCollection(name: string) {
    try {
      let collection = this.collections.get(name);
      if (!collection) {
        collection = await this.client.getOrCreateCollection({ name });
        this.collections.set(name, collection);
      }
      return collection;
    } catch (error) {
      console.error("Error getting/creating collection:", error);
      throw error;
    }
  }

  async addDocument(
    collectionName: string,
    document: string,
    questions: string[],
    answerType: AnswerType = "text",
    functionPath?: string,
    parameters?: Record<string, any>
  ) {
    try {
      const collection = await this.getOrCreateCollection(collectionName);

      // 문서 엔트리들 생성
      const entries = await createDocumentEntries(
        document,
        questions,
        answerType,
        functionPath,
        parameters
      );

      // ChromaDB에 저장
      await collection.add({
        documents: entries.map((e) => e.document),
        embeddings: entries.map((e) => e.embedding),
        metadatas: entries.map((e) => e.metadata),
        ids: entries.map((e) => e.id),
      });

      return { message: "Document and questions added successfully" };
    } catch (error) {
      console.error("Error adding document:", error);
      throw error;
    }
  }

  async queryCollection(
    collectionName: string,
    query: string,
    nResults: number = 5
  ): Promise<Answer[]> {
    try {
      const collection = await this.getOrCreateCollection(collectionName);

      // 쿼리 텍스트의 임베딩 생성
      const queryEmbedding = await openaiService.createEmbedding(query);

      const results = await collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: nResults * 2,
        include: [
          IncludeEnum.Documents,
          IncludeEnum.Metadatas,
          IncludeEnum.Distances,
        ],
      });
      console.log("results", results);
      // null 체크
      if (
        !results.documents?.[0] ||
        !results.metadatas?.[0] ||
        !results.distances?.[0]
      ) {
        return [];
      }

      console.log(
        "여기확인",
        results.documents[0].map((doc, i) => ({
          document: doc,
          metadata: results.metadatas![0][i] as ChromaMetadata,
          distance: results.distances![0][i],
        }))
      );

      // 질문들 중에서 가장 유사한 것을 찾음
      const questionsWithDistances = results.documents[0]
        .map((doc, i) => ({
          document: doc,
          metadata: results.metadatas![0][i] as ChromaMetadata,
          distance: results.distances![0][i],
        }))
        .filter((item) => {
          const metadata = item.metadata as QuestionMetadata;
          return metadata?.type === "question" && !!metadata?.answerId;
        });

      // 거리순으로 정렬
      questionsWithDistances.sort((a, b) => a.distance - b.distance);

      if (questionsWithDistances.length === 0) {
        return [];
      }

      // 가장 유사한 질문의 answerId로 해당하는 답변을 찾음
      const mostSimilarQuestion = questionsWithDistances[0];
      const metadata = mostSimilarQuestion.metadata as QuestionMetadata;
      const answerId = metadata.answerId;

      // 전체 문서에서 해당 answerId를 가진 답변을 찾음
      const allDocs = await collection.get({
        include: [IncludeEnum.Documents, IncludeEnum.Metadatas],
      });

      if (!allDocs.documents || !allDocs.metadatas) {
        return [];
      }

      // 해당하는 답변 찾기
      const answerIndex = allDocs.metadatas.findIndex((metadata) => {
        const answerMeta = metadata as AnswerMetadata;
        return answerMeta?.type === "answer" && answerMeta?.id === answerId;
      });

      if (answerIndex === -1) {
        return [];
      }

      const answerMetadata = allDocs.metadatas[answerIndex] as AnswerMetadata;
      const document = allDocs.documents[answerIndex];

      // 답변 타입에 따라 다른 응답 생성
      if (answerMetadata.answerType === "text") {
        const textAnswer: TextAnswer = {
          type: "text",
          content: document || "",
          distance: mostSimilarQuestion.distance,
          matchedQuestion: mostSimilarQuestion.document || "",
        };
        return [textAnswer];
      } else if (answerMetadata.answerType === "function") {
        const functionAnswer: FunctionAnswer = {
          type: "function",
          content: answerMetadata.functionPath || "",
          parameters: answerMetadata.parameters
            ? JSON.parse(answerMetadata.parameters)
            : undefined,
          distance: mostSimilarQuestion.distance,
          matchedQuestion: mostSimilarQuestion.document || "",
        };
        return [functionAnswer];
      }

      return [];
    } catch (error) {
      console.error("Error querying collection:", error);
      throw error;
    }
  }

  async getAllDocuments(collectionName: string) {
    try {
      const collection = await this.getOrCreateCollection(collectionName);

      const results = await collection.get({
        include: [
          IncludeEnum.Documents,
          IncludeEnum.Metadatas,
          IncludeEnum.Embeddings,
        ],
      });

      if (!results.documents || !results.metadatas) {
        return [];
      }

      return results.documents.map((doc, i) => ({
        document: doc,
        metadata: results.metadatas![i],
      }));
    } catch (error) {
      console.error("Error getting all documents:", error);
      throw error;
    }
  }
}

export const chromaService = new ChromaService();
