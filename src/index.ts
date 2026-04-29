import "dotenv/config";
import connectDB from "./db/index";
import { app } from "./app";

connectDB()
  .then(() => {
    const server = app.listen(process.env.PORT || 8000, () => {
      console.log(
        `⚙️  SERVER IS RUNNING ON PORT ⚙️  ${process.env.PORT || 8000}`,
      );
    });

    server.on("error", (error: Error) => {
      console.log("!!! SERVER ERROR !!!: ", error);
      throw error;
    });
  })
  .catch((e: Error) => console.log("!!! MONGODB CONNECTION FAILED !!!: ", e));
