import { Router } from "express";
import {
  getAllFaqs,
  getAllFaqsAdmin,
  createFaq,
  updateFaq,
  deleteFaq,
} from "../controllers/faq.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createFaqSchema,
  updateFaqSchema,
} from "../validations/faq.validation.js";

const router = Router();

// ─── Public Routes ──────────────────────────────────────────────────────────
// No auth required — anyone can read active FAQs

router.get("/", getAllFaqs);

// ─── Protected Routes ───────────────────────────────────────────────────────
// Admin/HR/Company only — requires JWT + role check

router.use(verifyJWT, authorizeRoles("company", "hr", "admin"));

router.get("/all", getAllFaqsAdmin);                        // GET all (incl. inactive)
router.post("/", validate(createFaqSchema), createFaq);    // CREATE
router.put("/:id", validate(updateFaqSchema), updateFaq);  // UPDATE
router.delete("/:id", deleteFaq);                          // DELETE

export default router;
