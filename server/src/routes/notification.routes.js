import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    getMyNotifications,
    getUnreadCount,
    markAsRead,
    markOneAsRead
} from "../controllers/notification.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/").get(getMyNotifications);
router.route("/unread-count").get(getUnreadCount);
router.route("/read-all").patch(markAsRead);
router.route("/read/:id").patch(markOneAsRead);

export default router;
