import express from "express";
import { deleteEducation, updateEducation, userEducation } from "../controllers/educations.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { addEducationSchema, updateEducationSchema } from "../validations/education.validation.js";

const router = express.Router();

router.use(verifyJWT);

router.route('/create').post(validate(addEducationSchema), userEducation);
router.route('/:id')
    .put(validate(updateEducationSchema), updateEducation)
    .delete(deleteEducation);


export default router;