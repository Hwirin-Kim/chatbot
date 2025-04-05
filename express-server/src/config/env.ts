import dotenv from "dotenv";

dotenv.config();

interface EnvVariables {
  PORT: string;
  CHROMA_API_URL: string;
  OPENAI_API_KEY: string;
}

export const env: EnvVariables = {
  PORT: process.env.PORT || "3000",
  CHROMA_API_URL: process.env.CHROMA_API_URL || "http://localhost:8000",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
};

// OpenAI API 키가 없으면 에러
if (!env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required");
}
