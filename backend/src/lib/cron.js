import { CronJob } from "cron";
import http from "node:https";
import https from "node:https";

// /14 every 14 minutes ,14 evry 14 min in hour
const job = new CronJob("*/14****", function () {
  const base = process.env.FRONTEND_URL;
  if (!base) {
    return;
  }
  const url = new URL("/health", base).href;
  const client = url.startsWith("https:") ? https : http;

  client
    .get(url, (res) => {
      if (res.statusCode === 200) {
        return console.log("GET REQUEST SENT SUCCESSFULLY");
      } else {
        return console.log("GET REQUEST FAILED", res.statusCode);
      }
    })
    .on("error", (e) => {
      return console.error("ERROR WHILE SENDING REQUEST", e);
    });
});

export default job;
