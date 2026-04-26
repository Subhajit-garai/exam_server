import { logger } from "@/utils/logger.js";

export function catchAsyncSocket(
    originalMethod: Function,
    context: any
) {
    return async function (this: any, ...args: any[]) {
        try {
            return await originalMethod.apply(this, args);
        } catch (error: any) {
            const methodName = String(this?.constructor?.name || "Method");
            logger.error(`[SOCKET_ERROR] Error in ${methodName}: ${error?.message || error}`);

            if (typeof this.error === 'function') {
                this.error(error?.message || "Internal Server Error");
            }
        }
    };
}
