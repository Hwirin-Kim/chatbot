import { Router } from "express";
import { embeddingController } from "../controllers/embedding.controller";

const router = Router();

router.post("/add", embeddingController.addDocument);
router.post("/query", embeddingController.queryCollection);
router.get("/:collectionName/all", embeddingController.getAllDocuments);

export const embeddingRouter = router;
