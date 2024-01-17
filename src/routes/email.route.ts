import express from "express"
import { sendMessages } from "../controller/email.controller";

const router = express.Router();

router.get("/", sendMessages);

export default router;