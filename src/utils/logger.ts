// src/utils/logger.ts
export const logger = {
  info: (...msg: any[]) => console.log("ℹ️ ", ...msg),
  success: (...msg: any[]) => console.log("✅ ", ...msg),
  error: (...msg: any[]) => console.error("❌ ", ...msg),
  warn: (...msg: any[]) => console.warn("⚠️ ", ...msg),
  debug: (...msg: any[]) => console.log("🔍 ", ...msg),
};

