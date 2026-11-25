import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { analyticsQuerySchema } from "../validators/common.validator.js";
import { dashboard, weekly, monthly, activityDistribution, overview } from "../controllers/analytics.controller.js";

const router = Router();
router.use(protect, validate(analyticsQuerySchema, "query"));

router.get("/dashboard", dashboard);
router.get("/weekly", weekly);
router.get("/monthly", monthly);
router.get("/activity-distribution", activityDistribution);
router.get("/overview", overview);

export default router;
