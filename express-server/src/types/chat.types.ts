export interface ChatRequest {
  query: string;
}

export interface ChatResponse {
  answer: string;
  matchedQuestion?: string;
  distance?: number;
}

// API 응답 타입들
export interface MenuResponse {
  items: Array<{
    id: string;
    name: string;
    price: number;
    category: string;
    isAvailable: boolean;
  }>;
}

export interface BusinessHoursResponse {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  description?: string;
}

export interface FacilitiesResponse {
  parking: {
    available: boolean;
    description: string;
  };
  wifi: {
    available: boolean;
    name?: string;
    password?: string;
  };
  power: {
    available: boolean;
    description: string;
  };
}
