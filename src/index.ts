import express from "express";
import authRoute from "./routes/auth.route";
import emailRoute from "./routes/email.route";
import dotenv from "dotenv";
import bodyParser from "body-parser";
dotenv.config();

const app = express();

const port = 3001;
app.use(bodyParser.json());

app.get("/", function (req: any, res: any) {
  res.send("Hello World");
});

app.use(express.json());

app.listen(port, () => {
  console.log("server is running on port http://localhost:" + port);
});

app.use("/auth", authRoute);
app.use("/send", emailRoute);
