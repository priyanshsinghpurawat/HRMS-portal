import express from "express";
import { companyProfile } from "../controllers/company.controller.js";

const companyRouter = express.Router();

companyRouter.route("/companyprofile").post(companyProfile);

export {companyRouter};