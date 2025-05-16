import rateLimit from "express-rate-limit";
import { Request, Response } from "express";
import { RedisProvider } from "./radisProvider";
import { RedisReply, RedisStore, SendCommandFn } from 'rate-limit-redis'

let otpLimiter_count = parseInt(process.env.OTP_RATE_LIMIT as string) || 5;
let signinLimiter_count =
  parseInt(process.env.SIGNIN_RATE_LIMIT as string) || 5;
let passwordResetLimiter_count =
  parseInt(process.env.PASSWORD_RESET_RATE_LIMIT as string) || 5;

console.log(
  `limits are --> otp ->  ${otpLimiter_count} signin ->${signinLimiter_count}  passwordReset ${passwordResetLimiter_count}`
);

const getClientIp = (req: any) => {
  // X-Forwarded-For can contain a comma-separated list of IPs
  const forwardedFor = req.headers['x-forwarded-for'];
  const realIp = req.headers['x-real-ip'];

  console.log("forwardedFor" , forwardedFor);
  console.log("realIp" , realIp);
  
  if (forwardedFor) {
    const ips = forwardedFor.split(',');  // get list of IPs
    return ips[0];  // Return the first one (the original client IP)
  }

  console.log("req.connection.remoteAddress" , req.connection.remoteAddress);
  return req.connection.remoteAddress;  // Fall back to the connection IP
};

const redisClient = RedisProvider.getInstance().getclient();

const sendCommand: SendCommandFn = (command: string, ...args: (string | number)[]): Promise<RedisReply> => {
    return redisClient.call(command, ...args) as  Promise<RedisReply>;
  };
  

// Rate limiter configuration
export const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: otpLimiter_count, // Limit each IP to 3 OTP requests per windowMs
  message: "Too many requests, please try again after 5 minutes",

  // for storing data into redis catch
  store: new RedisStore({
    prefix: "otp_limit:",
    sendCommand: sendCommand ,// (...args: string[]) => redisClient.call(...args),
}),
  keyGenerator: getClientIp,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export const signinLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: signinLimiter_count, // Limit each IP to 3 OTP requests per windowMs
  message: "Too many requests, please try again after 5 minutes",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: passwordResetLimiter_count, // Limit each IP to 5 password reset requests per windowMs
  message:
    "Too many password reset attempts, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});
