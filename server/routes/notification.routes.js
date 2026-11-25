import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { listQuerySchema } from "../validators/common.validator.js";
import { list, markRead, markAllRead } from "../controllers/notification.controller.js";

const router = Router();
router.use(protect);

router.get("/", validate(listQuerySchema, "query"), list);
router.put("/read-all", markAllRead);
router.put("/:id/read", markRead);

export default router;
