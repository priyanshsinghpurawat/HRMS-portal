import express from "express";
import { deleteEducation, updateEducation, userEducation } from "../controllers/educations.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.use(verifyJWT);

router.route('/create').post(userEducation);
router.route('/:id').put(updateEducation)
    .delete(deleteEducation);

export default router;