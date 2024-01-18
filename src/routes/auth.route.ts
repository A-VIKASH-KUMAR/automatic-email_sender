import express from "express";
import {
  getGoogleConsentLink,
  getGmailCredentials,
} from "../controller/auth.controller";

const router = express.Router();

router.get("/google", getGoogleConsentLink);
router.get("/google/callback", getGmailCredentials);

export default router;
