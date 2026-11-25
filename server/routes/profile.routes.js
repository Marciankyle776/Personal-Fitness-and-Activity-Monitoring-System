import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { profileSchema, changePasswordSchema } from "../validators/profile.validator.js";
import { getProfile, updateProfile, changePassword } from "../controllers/profile.controller.js";

const router = Router();
router.use(protect);

router.get("/", getProfile);
router.put("/", validate(profileSchema), updateProfile);
router.put("/change-password", validate(changePasswordSchema), changePassword);

export default router;
