/**
 * @swagger
 * tags:
 *   - name: Subscriptions
 *     description: Company Subscription management APIs
 *   - name: Payments
 *     description: Razorpay Payment processing and verification APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Subscription:
 *       type: object
 *       required:
 *         - companyId
 *         - paymentId
 *         - purchasedBy
 *         - plan
 *         - amount
 *         - startDate
 *         - expiresAt
 *       properties:
 *         _id:
 *           type: string
 *           example: "60d5ec49c6158e00155b4130"
 *         companyId:
 *           type: string
 *           description: ID of the company
 *           example: "60d5ec49c6158e00155b4123"
 *         paymentId:
 *           type: string
 *           description: Associated Payment ID
 *           example: "60d5ec49c6158e00155b4129"
 *         purchasedBy:
 *           type: string
 *           description: User ID of the company owner
 *           example: "60d5ec49c6158e00155b4122"
 *         plan:
 *           type: string
 *           enum: [1-month, 3-month, 6-month, 1-year]
 *           example: "1-month"
 *         amount:
 *           type: number
 *           example: 999
 *         startDate:
 *           type: string
 *           format: date-time
 *           example: "2026-06-14T10:15:00.000Z"
 *         startsAt:
 *           type: string
 *           format: date-time
 *           example: "2026-06-14T10:15:00.000Z"
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           example: "2026-07-14T10:15:00.000Z"
 *         status:
 *           type: string
 *           enum: [active, expired, cancelled, pending]
 *           example: "active"
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Create HR", "Manage HR", "Employees", "Attendance", "Payroll", "Recruitment", "Analytics", "Reports"]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     Payment:
 *       type: object
 *       required:
 *         - companyId
 *         - amount
 *         - razorpayOrderId
 *       properties:
 *         _id:
 *           type: string
 *           example: "60d5ec49c6158e00155b4129"
 *         companyId:
 *           type: string
 *           example: "60d5ec49c6158e00155b4123"
 *         amount:
 *           type: number
 *           description: Amount in INR
 *           example: 999
 *         currency:
 *           type: string
 *           default: "INR"
 *           example: "INR"
 *         paymentFor:
 *           type: string
 *           enum: [company-registration, subscription-renewal]
 *           example: "subscription-renewal"
 *         plan:
 *           type: string
 *           enum: [1-month, 3-month, 6-month, 1-year]
 *           example: "1-month"
 *         razorpayOrderId:
 *           type: string
 *           example: "order_KObt45xyzABC"
 *         razorpayPaymentId:
 *           type: string
 *           example: "pay_KObu34xyzEFG"
 *         razorpaySignature:
 *           type: string
 *           example: "abcdef1234567890"
 *         paymentGateway:
 *           type: string
 *           default: "razorpay"
 *           example: "razorpay"
 *         paymentStatus:
 *           type: string
 *           enum: [created, success, failed]
 *           example: "success"
 *         status:
 *           type: string
 *           enum: [created, paid, failed, refunded]
 *           example: "paid"
 *         paidAt:
 *           type: string
 *           format: date-time
 *           example: "2026-06-14T10:15:30.000Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/company/subscription/create-order:
 *   post:
 *     summary: Create Razorpay subscription order (Company Owner Only)
 *     description: Initializes a subscription payment flow by creating a Razorpay order and a pending Payment record.
 *     tags: [Subscriptions, Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - plan
 *             properties:
 *               plan:
 *                 type: string
 *                 enum: [1-month, 3-month, 6-month, 1-year]
 *                 description: Subscription plan duration
 *                 example: "1-month"
 *     responses:
 *       200:
 *         description: Razorpay order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Razorpay order created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: string
 *                       example: "order_KObt45xyzABC"
 *                     amount:
 *                       type: number
 *                       description: Amount in paise (e.g. 99900 paise = 999 INR)
 *                       example: 99900
 *                     currency:
 *                       type: string
 *                       example: "INR"
 *                     plan:
 *                       type: string
 *                       example: "1-month"
 *       400:
 *         description: Invalid plan selected, email not verified, or active subscription already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access Denied (Not a company owner role)
 *       404:
 *         description: Company profile not found
 *       500:
 *         description: Internal Server Error
 *
 * /api/v1/company/subscription/verify-payment:
 *   post:
 *     summary: Verify Razorpay subscription payment (Company Owner Only)
 *     description: Verifies the payment signature returned by Razorpay. If valid, updates the payment record to success, expires previous active subscriptions, and activates a new subscription.
 *     tags: [Subscriptions, Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - razorpay_order_id
 *               - razorpay_payment_id
 *               - razorpay_signature
 *               - plan
 *             properties:
 *               razorpay_order_id:
 *                 type: string
 *                 example: "order_KObt45xyzABC"
 *               razorpay_payment_id:
 *                 type: string
 *                 example: "pay_KObu34xyzEFG"
 *               razorpay_signature:
 *                 type: string
 *                 example: "a8f58b...5b38"
 *               plan:
 *                 type: string
 *                 enum: [1-month, 3-month, 6-month, 1-year]
 *                 example: "1-month"
 *     responses:
 *       200:
 *         description: Payment verified and subscription activated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Payment verified and subscription activated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Subscription'
 *       400:
 *         description: Payment verification failed (signature mismatch) or validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Company profile or pending payment record not found
 *       500:
 *         description: Internal Server Error
 *
 * /api/v1/company/subscription/current:
 *   get:
 *     summary: Get current active subscription details (Company Owner Only)
 *     description: Returns the details of the company's current active subscription, including remaining days.
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription status fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Current subscription details fetched successfully
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     plan:
 *                       type: string
 *                       example: "1-month"
 *                     status:
 *                       type: string
 *                       example: "active"
 *                     startsAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-06-14T10:15:00.000Z"
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-07-14T10:15:00.000Z"
 *                     remainingDays:
 *                       type: number
 *                       example: 30
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Company profile not found
 *       500:
 *         description: Internal Server Error
 */
