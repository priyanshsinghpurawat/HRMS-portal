import { SystemAudit } from "../../models/SystemAudit.model.js";

/**
 * Logs a system-level audit event.
 * Uses a fire-and-forget pattern to prevent blocking the main request cycle.
 */
export const logSystemEvent = (companyId, userId, action, module, details = {}, req = null) => {
    // We execute this asynchronously without awaiting to avoid latency in the main thread
    Promise.resolve().then(async () => {
        try {
            const auditData = {
                companyId,
                userId,
                action,
                module,
                details
            };

            if (req) {
                auditData.ipAddress = req.ip || req.connection.remoteAddress;
                auditData.userAgent = req.get('User-Agent');
            }

            await SystemAudit.create(auditData);
        } catch (error) {
            console.error(`[AUDIT ERROR] Failed to log system event: ${error.message}`);
        }
    });
};
