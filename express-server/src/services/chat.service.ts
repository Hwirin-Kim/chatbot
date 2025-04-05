import { chromaService } from "./chroma.service";
import { Answer, FunctionAnswer } from "../types/chroma.types";
import {
  ChatResponse,
  MenuResponse,
  BusinessHoursResponse,
  FacilitiesResponse,
} from "../types/chat.types";
import { cafeService } from "./cafe.service";
import { Menu, BusinessHours, Facilities } from "../types/cafe.types";

class ChatService {
  private readonly chromaService = chromaService;

  constructor() {}

  async handleQuery(query: string): Promise<ChatResponse> {
    try {
      // ChromaDB에서 유사한 답변 검색
      const answers = await this.chromaService.queryCollection(
        "chatbot_data",
        query
      );

      if (answers.length === 0) {
        return {
          answer: "죄송합니다. 질문을 이해하지 못했습니다.",
        };
      }

      const answer = answers[0];

      // 답변 타입에 따른 처리
      if (answer.type === "function") {
        const result = await this.handleFunctionCall(answer);
        return {
          answer: result,
          matchedQuestion: answer.matchedQuestion,
          distance: answer.distance,
        };
      }

      // text 타입인 경우 바로 반환
      return {
        answer: answer.content,
        matchedQuestion: answer.matchedQuestion,
        distance: answer.distance,
      };
    } catch (error) {
      console.error("Error in handleQuery:", error);
      return {
        answer: "죄송합니다. 오류가 발생했습니다.",
      };
    }
  }

  private async handleFunctionCall(functionAnswer: Answer): Promise<string> {
    if (functionAnswer.type !== "function") {
      throw new Error("Invalid answer type");
    }

    const { content: endpoint } = functionAnswer;

    try {
      // 서비스 직접 호출 및 응답 변환
      let responseData;
      switch (endpoint) {
        case "/api/cafe/menu/available": {
          const menuData = cafeService.getAvailableMenu();
          responseData = this.convertToMenuResponse(menuData);
          break;
        }
        case "/api/cafe/business-hours": {
          const hoursData = cafeService.getBusinessHours();
          responseData = this.convertToBusinessHoursResponse(hoursData);
          break;
        }
        case "/api/cafe/facilities": {
          const facilitiesData = cafeService.getFacilities();
          responseData = facilitiesData; // 이미 동일한 구조
          break;
        }
        default:
          throw new Error(`Unknown endpoint: ${endpoint}`);
      }

      // 응답을 사용자 친화적인 메시지로 변환
      return this.formatApiResponse(endpoint, responseData);
    } catch (error) {
      console.error("Service call failed:", error);
      return "죄송합니다. 요청을 처리하는 중에 오류가 발생했습니다.";
    }
  }

  private convertToMenuResponse(menuData: Menu): MenuResponse {
    const items = [
      ...menuData.coffee,
      ...menuData.tea,
      ...menuData.beverage,
      ...menuData.dessert,
    ].map((item) => ({
      id: item.name, // 임시로 name을 id로 사용
      name: item.name,
      price: item.price,
      category: item.category,
      isAvailable: item.isAvailable,
    }));

    return { items };
  }

  private convertToBusinessHoursResponse(
    hoursData: BusinessHours
  ): BusinessHoursResponse {
    const now = new Date();
    const dayOfWeek = now.toLocaleDateString("ko-KR", { weekday: "long" });
    const todayHours = hoursData.regular[dayOfWeek];

    return {
      openTime: todayHours.open,
      closeTime: todayHours.close,
      isOpen: this.checkIfOpen(todayHours),
      description: hoursData.specialNotes,
    };
  }

  private checkIfOpen(hours: { open: string; close: string }): boolean {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [openHour, openMinute] = hours.open.split(":").map(Number);
    const [closeHour, closeMinute] = hours.close.split(":").map(Number);

    const openTime = openHour * 60 + openMinute;
    const closeTime = closeHour * 60 + closeMinute;

    return currentTime >= openTime && currentTime <= closeTime;
  }

  private formatApiResponse(endpoint: string, data: any): string {
    switch (endpoint) {
      case "/api/cafe/menu/available": {
        const menuData = data as MenuResponse;
        const availableItems = menuData.items.filter(
          (item) => item.isAvailable
        );

        if (availableItems.length === 0) {
          return "현재 주문 가능한 메뉴가 없습니다.";
        }

        const menuList = availableItems
          .map((item) => `- ${item.name} (${item.price.toLocaleString()}원)`)
          .join("\n");

        return `현재 주문 가능한 메뉴입니다:\n${menuList}`;
      }

      case "/api/cafe/business-hours": {
        const hoursData = data as BusinessHoursResponse;
        let response = `영업시간은 ${hoursData.openTime}부터 ${hoursData.closeTime}까지입니다.`;

        if (hoursData.isOpen) {
          response += "\n현재 영업 중입니다.";
        } else {
          response += "\n현재는 영업 시간이 아닙니다.";
        }

        if (hoursData.description) {
          response += `\n${hoursData.description}`;
        }

        return response;
      }

      case "/api/cafe/facilities": {
        const facilitiesData = data as FacilitiesResponse;
        const facilities = [];

        if (facilitiesData.parking.available) {
          facilities.push(`주차: ${facilitiesData.parking.description}`);
        }

        if (facilitiesData.wifi.available) {
          const wifiInfo = facilitiesData.wifi.password
            ? `와이파이: ${facilitiesData.wifi.name} (비밀번호: ${facilitiesData.wifi.password})`
            : `와이파이: ${facilitiesData.wifi.name}`;
          facilities.push(wifiInfo);
        }

        if (facilitiesData.power.available) {
          facilities.push(`콘센트: ${facilitiesData.power.description}`);
        }

        return facilities.length > 0
          ? `매장 시설 안내입니다:\n${facilities.join("\n")}`
          : "죄송합니다. 문의하신 시설 정보가 없습니다.";
      }

      default:
        return "죄송합니다. 해당 정보를 조회할 수 없습니다.";
    }
  }
}

export const chatService = new ChatService();
