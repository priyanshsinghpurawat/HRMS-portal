import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

import {
  getSingleUser,
  getAllUsers,
  getUserCount,
  blockUser,
  unblockUser,
  deleteUser,

  getSingleCompany,
  getAllCompanies,
  approveCompany,
  rejectCompany,
  getPendingCompanies,
  deleteCompany,

  getCompanyEmployeeCount,

  getSingleJob,
  getAllJobs,
  blockFraudJob,
  unblockJob,

  dashboardStats
} from "../controllers/admin.controller.js";

const router = Router();

// Protect all admin routes
router.use(
  verifyJWT,
  authorizeRoles("admin")
);

router.get("/users", getAllUsers);
router.get("/users/count", getUserCount);
router.get("/users/:id", getSingleUser);
router.patch("/users/block/:id", blockUser);
router.patch("/users/unblock/:id", unblockUser);
router.delete("/users/:id", deleteUser);

router.get("/companies", getAllCompanies);
router.get("/companies/:id", getSingleCompany);
router.patch("/companies/approve/:id", approveCompany);
router.patch("/companies/reject/:id", rejectCompany);
router.get("/dashboard/pending-companies", getPendingCompanies);
router.delete("/companies/:id", deleteCompany);
router.get("/companies/:companyId/employees/count", getCompanyEmployeeCount);

router.get("/jobs", getAllJobs);
router.get("/jobs/:id", getSingleJob);
router.patch("/jobs/block/:id", blockFraudJob);
router.patch("/jobs/unblock/:id", unblockJob);

router.get("/dashboard/stats", dashboardStats);

export default router;