import express from "express";
import userRouter from "./routes/user";

const app = express();

const PORT = 3000;

app.use("/api/users", userRouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
