import { Router } from "express";
import { chatController } from "../controllers/chat.controller";

const router = Router();

router.post("/query", chatController.handleQuery);

export default router;
