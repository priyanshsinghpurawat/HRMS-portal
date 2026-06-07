import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { blockSchema } from "../validations/admin.validation.js";

import {
  getAllUsers,
  getSingleUser,
  getAllCompanies,
  getSingleCompany,
  getAllHRs,
  getSingleHR,
  blockCompany,
  unblockCompany,
  deleteCompany,
  getActiveCompanies,
  getActiveUsers,
  getBlockedCompanies
} from "../controllers/admin.controller.js";

const router = Router();

// Protect all admin routes - only role = admin can access
router.use(
  verifyJWT,
  authorizeRoles("admin")
);

// User Management
router.get("/users", getAllUsers);
router.get("/users/active", getActiveUsers); // Must be before /users/:id
router.get("/users/:id", getSingleUser);

// HR Management
router.get("/hrs", getAllHRs);
router.get("/hrs/:id", getSingleHR);

// Company Management
router.get("/companies", getAllCompanies);
router.get("/companies/active", getActiveCompanies); // Must be before /companies/:id
router.get("/companies/blocked", getBlockedCompanies); // Must be before /companies/:id
router.get("/companies/:id", getSingleCompany);
router.patch("/companies/block/:id", validate(blockSchema), blockCompany);
router.patch("/companies/unblock/:id", unblockCompany);
router.delete("/companies/:id", deleteCompany);

export default router;