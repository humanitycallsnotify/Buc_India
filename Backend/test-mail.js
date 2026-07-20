import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), "..", ".env") });

import { sendOTP } from "./utils/mailSender.js";

async function run() {
  try {
    await sendOTP("test@example.com", "123456", "signup");
    console.log("Success");
  } catch (error) {
    console.error("Test failed:");
    console.error(error);
  }
}

run();
