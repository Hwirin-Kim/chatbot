export interface ChatbotDocument {
  document: string; // 실제 답변 내용
  metadata: {
    type: "answer";
    questions: string[]; // 예상되는 질문들의 배열
  };
}

// 답변 타입 정의
export type AnswerType = "text" | "function";

// 메타데이터 타입 정의
export interface BaseMetadata {
  type: string;
  [key: string]: any; // ChromaDB의 Metadata 타입과 호환을 위한 인덱스 시그니처
}

export interface AnswerMetadata extends BaseMetadata {
  type: "answer";
  answerType: string;
  id: string;
  functionPath?: string;
  parameters?: string;
}

export interface QuestionMetadata extends BaseMetadata {
  type: "question";
  answerId: string;
}

export type ChromaMetadata = AnswerMetadata | QuestionMetadata;

// 응답 타입 정의
export interface BaseAnswer {
  type: AnswerType;
  content: string;
  distance: number;
  matchedQuestion: string;
}

export interface TextAnswer extends BaseAnswer {
  type: "text";
}

export interface FunctionAnswer extends BaseAnswer {
  type: "function";
  parameters?: Record<string, any>;
}

export type Answer = TextAnswer | FunctionAnswer;

export interface AddDocumentRequest {
  collectionName: string;
  document: string;
  questions: string[];
  answerType?: AnswerType;
  functionPath?: string;
  parameters?: Record<string, any>;
}

export interface QueryRequest {
  collectionName: string;
  query: string;
  limit?: number;
}
