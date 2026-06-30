import cron from 'node-cron';
import { Company } from '../../models/Company.model.js';
// We would import the actual engine here to trigger generation
import { bulkGeneratePayroll } from '../../controllers/payroll.controller.js'; // This is a mock import for illustration

const activeJobs = new Map();

/**
 * Starts a Cron job that runs on a specific day of the month for a specific company
 */
export const scheduleCompanyPayroll = (companyId, runOnDay) => {
    // Clean up existing job if any
    if (activeJobs.has(companyId)) {
        activeJobs.get(companyId).stop();
    }

    // Schedule to run at 1:00 AM on the specified day of the month
    // Syntax: 0 1 {runOnDay} * *
    const cronExpression = `0 1 ${runOnDay} * *`;

    const job = cron.schedule(cronExpression, async () => {
        console.log(`[SCHEDULER] Triggering automated payroll cycle for Company: ${companyId}`);
        try {
            // Note: In real implementation, we would call the Service layer directly, 
            // not the controller, passing system admin credentials.
            // await generatePayrollBulkService(companyId, 'SYSTEM', ...);
            
            console.log(`[SCHEDULER] Successfully executed batch for ${companyId}`);
        } catch (error) {
            console.error(`[SCHEDULER] Failed execution for ${companyId}:`, error);
            // Trigger Retry or Notification service
        }
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });

    activeJobs.set(companyId, job);
    console.log(`[SCHEDULER] Job configured for Company ${companyId} on day ${runOnDay} of every month.`);
    
    return { status: 'Scheduled', expression: cronExpression };
};

/**
 * System initialization: Load all schedules from PayrollSettings on boot
 */
export const initializeAllSchedules = async () => {
    console.log("[SCHEDULER] Initializing company payroll schedules...");
    // Ideally query PayrollSetting for all where isPayrollEnabled = true
    // Loop through them and call scheduleCompanyPayroll(settings.companyId, settings.payrollGenerationDay);
};
