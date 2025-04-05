import { Router } from "express";
import { embeddingRouter } from "./embedding.routes";

const router = Router();

// API routes
router.use("/embedding", embeddingRouter);

// 추후 다른 라우트들도 여기에 추가
// router.use('/chat', chatRouter);
// router.use('/auth', authRouter);

export const apiRouter = router;
