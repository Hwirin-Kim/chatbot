import { Router } from "express";
import { cafeController } from "../controllers/cafe.controller";

const router = Router();

// 메뉴 관련 라우트
router.get("/menu", cafeController.getAllMenu);
router.get("/menu/available", cafeController.getAvailableMenu);

// 영업시간 관련 라우트
router.get("/business-hours", cafeController.getBusinessHours);

// 시설 정보 관련 라우트
router.get("/facilities", cafeController.getFacilities);

export default router;
