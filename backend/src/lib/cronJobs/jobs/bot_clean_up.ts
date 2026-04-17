// import axios from "axios";
// import { webhook_type } from "../../types/botTypes.js";

// export const clean_up = async (webhook: webhook_type) => {
//   console.log("Clearing bot cache...");

//   if (!webhook) {
//     console.log("No bot webhook found");
//   }

//   let cbUrl = `${webhook.baseurl}${webhook.endpoint.survertask}`;
//   try {
//     let response = await axios.post(cbUrl, {
//       type: "cleaupcache",
//     });
//     if (response.status === 200) {
//       console.log("Bot cache cleared successfully");
//     } else {
//       console.error("Failed to clear bot cache", response.data);
//     }
//   } catch (error) {
//     console.error("Error clearing bot cache:", error);
//   }
// };
