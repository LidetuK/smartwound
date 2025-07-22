import { Router } from "express";
import {
  register,
  login,
  verifyEmail,
} from "../controllers/authController.js";
import {
  registerValidation,
  loginValidation,
} from "../middleware/validation.middleware.js";

const router = Router();

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.get("/verify-email", verifyEmail);

export default router; 