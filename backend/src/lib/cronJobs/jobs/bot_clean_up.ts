import { logger } from "@repo/lib/helper/logger.js";
// import axios from "axios";
// import { webhook_type } from "../../types/botTypes.js";

// export const clean_up = async (webhook: webhook_type) => {
//   logger.info("Clearing bot cache...");

//   if (!webhook) {
//     logger.info("No bot webhook found");
//   }

//   let cbUrl = `${webhook.baseurl}${webhook.endpoint.survertask}`;
//   try {
//     let response = await axios.post(cbUrl, {
//       type: "cleaupcache",
//     });
//     if (response.status === 200) {
//       logger.info("Bot cache cleared successfully");
//     } else {
//       logger.error("Failed to clear bot cache", response.data);
//     }
//   } catch (error) {
//     logger.error("Error clearing bot cache:", error);
//   }
// };
