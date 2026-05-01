import "dotenv/config";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

import connectDB from "./db/index";
import { app } from "./app";

connectDB()
  .then(() => {
    const port = process.env.PORT || 5000;
    const server = app.listen(port, () => {
      console.log(
        `⚙️  SERVER IS RUNNING ON PORT ⚙️  ${port}`,
      );
    });

    server.on("error", (error: Error) => {
      console.log("!!! SERVER ERROR !!!: ", error);
      throw error;
    });
  })
  .catch((e: Error) => console.log("!!! MONGODB CONNECTION FAILED !!!: ", e));
