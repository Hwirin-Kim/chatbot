import { Request, Response } from "express";
import { cafeService } from "../services/cafe.service";

class CafeController {
  async getAllMenu(req: Request, res: Response) {
    try {
      const menu = cafeService.getAllMenu();
      res.json({ success: true, data: menu });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, error: "메뉴 조회 중 오류가 발생했습니다." });
    }
  }

  async getAvailableMenu(req: Request, res: Response) {
    try {
      const menu = cafeService.getAvailableMenu();
      res.json({ success: true, data: menu });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, error: "메뉴 조회 중 오류가 발생했습니다." });
    }
  }

  async getBusinessHours(req: Request, res: Response) {
    try {
      const hours = cafeService.getBusinessHours();
      res.json({ success: true, data: hours });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "영업시간 조회 중 오류가 발생했습니다.",
      });
    }
  }

  async getFacilities(req: Request, res: Response) {
    try {
      const facilities = cafeService.getFacilities();
      res.json({ success: true, data: facilities });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "시설 정보 조회 중 오류가 발생했습니다.",
      });
    }
  }
}

export const cafeController = new CafeController();
