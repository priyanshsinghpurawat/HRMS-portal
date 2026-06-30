/**
 * Exponential backoff retry mechanism for resilient background jobs
 */
export const executeWithRetry = async (operation, maxRetries = 3, baseDelayMs = 1000) => {
    let attempt = 1;

    while (attempt <= maxRetries) {
        try {
            return await operation();
        } catch (error) {
            console.error(`[RETRY] Operation failed on attempt ${attempt}. Error: ${error.message}`);
            
            if (attempt === maxRetries) {
                console.error(`[RETRY] Max retries (${maxRetries}) reached. Operation permanently failed.`);
                throw error;
            }

            // Exponential backoff
            const delay = baseDelayMs * Math.pow(2, attempt - 1);
            console.log(`[RETRY] Waiting ${delay}ms before next attempt...`);
            
            await new Promise(resolve => setTimeout(resolve, delay));
            attempt++;
        }
    }
};
