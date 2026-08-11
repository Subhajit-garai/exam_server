import rateLimit from "express-rate-limit";
import { RedisManager } from "@/lib/redis/redisManager.js";
import { RedisReply, RedisStore, SendCommandFn } from "rate-limit-redis";
import { logger } from "@/utils/logger.js";

let otpLimiter_count = parseInt(process.env.OTP_RATE_LIMIT as string) || 5;
let signinLimiter_count =
  parseInt(process.env.SIGNIN_RATE_LIMIT as string) || 5;
let passwordResetLimiter_count =
  parseInt(process.env.PASSWORD_RESET_RATE_LIMIT as string) || 5;

logger.info(
  `Rate limits — OTP: ${otpLimiter_count} | Signin: ${signinLimiter_count} | Password reset: ${passwordResetLimiter_count}`,
);

const getClientIp = (req: any) => {
  // X-Forwarded-For can contain a comma-separated list of IPs
  const forwardedFor = req.headers["x-forwarded-for"];
  const realIp = req.headers["x-real-ip"];

  logger.debug("forwardedFor", forwardedFor);
  logger.debug("realIp", realIp);

  if (forwardedFor) {
    const ips = forwardedFor.split(","); // get list of IPs
    return ips[0]; // Return the first one (the original client IP)
  }

  logger.debug("req.connection.remoteAddress", req.connection.remoteAddress);
  return req.connection.remoteAddress; // Fall back to the connection IP
};

const redisClient = RedisManager.getInstance().getclient();

const sendCommand: SendCommandFn = (
  command: string,
  ...args: (string | number)[]
): Promise<RedisReply> => {
  return redisClient.call(command, ...args) as Promise<RedisReply>;
};

// Rate limiter configuration
export const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: otpLimiter_count, // Limit each IP to 3 OTP requests per windowMs
  message: {
    success: false,
    message: "Too many requests, please try again after 5 minutes",
  },

  // for storing data into redis catch
  store: new RedisStore({
    prefix: "otp_limit:",
    sendCommand: sendCommand, // (...args: string[]) => redisClient.call(...args),
  }),
  keyGenerator: getClientIp,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export const signinLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: signinLimiter_count, // Limit each IP to 3 OTP requests per windowMs
  message: {
    success: false,
    message: "Too many requests, please try again after 5 minutes",
  },
  store: new RedisStore({
    prefix: "signin_limit:",
    sendCommand: sendCommand,
  }),
  keyGenerator: getClientIp,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export const passwordResetLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 15 minutes
  max: passwordResetLimiter_count, // Limit each IP to 5 password reset requests per windowMs
  message: {
    success: false,
    message:
      "Too many password reset attempts, please try again after 5 minutes",
  },
  store: new RedisStore({
    prefix: "pwd_reset_limit:",
    sendCommand: sendCommand,
  }),
  keyGenerator: getClientIp,
  standardHeaders: true,
  legacyHeaders: false,
});
