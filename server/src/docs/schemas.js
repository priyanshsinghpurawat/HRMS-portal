/**
 * @swagger
 * components:
 *   schemas:
 *     LeavePolicy:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         code:
 *           type: string
 *         annualAllocation:
 *           type: number
 *         isActive:
 *           type: boolean
 * 
 *     Holiday:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         date:
 *           type: string
 *           format: date
 *         type:
 *           type: string
 * 
 *     PayrollSnapshot:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         employeeId:
 *           type: string
 *         payrollMonth:
 *           type: number
 *         payrollYear:
 *           type: number
 *         status:
 *           type: string
 *         grossSalary:
 *           type: number
 *         netSalary:
 *           type: number
 * 
 *     SystemAudit:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         action:
 *           type: string
 *         module:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 */
