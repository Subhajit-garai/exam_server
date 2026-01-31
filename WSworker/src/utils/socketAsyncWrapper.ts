import { logger } from "@repo/utils/logger.js";
import { BaseSocketHandler } from "@repo/socket/handlers/base.socket.handler.js";

/**
 * Wraps an async socket handler method to catch errors automatically.
 * Standard Stage 3 Decorator Implementation
 * @param originalMethod The method being decorated
 * @param context Decorator context
 */
export function catchAsyncSocket(
    originalMethod: Function,
    context: any // Using 'any' for context to avoid typing issues with ClassMethodDecoratorContext
) {
    return async function (this: any, ...args: any[]) {
        try {
            return await originalMethod.apply(this, args);
        } catch (error: any) {
            const context = this as BaseSocketHandler;
            const methodName = String(context?.constructor?.name || "Method");
            logger.error(`[SOCKET_ERROR] Error in ${methodName}: ${error?.message || error}`);

            if (typeof (this as any).error === 'function') {
                (this as any).error(error?.message || "Internal Server Error");
            }
        }
    };
}
