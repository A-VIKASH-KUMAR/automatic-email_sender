import { google } from "googleapis";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const tokenPath = path.resolve(__dirname, 'token.json');

const googleConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URL,
};

export const getGoogleConsentLink = (req: any, res: any) => {
  const oauth2Client = new google.auth.OAuth2(
    googleConfig.clientId,
    googleConfig.clientSecret,
    googleConfig.redirectUri
  );
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: process.env.GOOGLE_SCOPES,
  });

  res.status(200).json({ consentUrl: url });
};

export const getGmailCredentials = async (req: any, res: any) => {
  const oauth2Client = new google.auth.OAuth2(
    googleConfig.clientId,
    googleConfig.clientSecret,
    googleConfig.redirectUri
  );
  const authorizationCode = req.query.code;
  const { tokens } = await oauth2Client.getToken(authorizationCode);
  
  console.log("tokens", tokens);
  oauth2Client.setCredentials(tokens);
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: googleConfig.clientId,
    client_secret: googleConfig.clientSecret,
    refresh_token: tokens.refresh_token,
    access_token:tokens.access_token,
    expiry_date:tokens.expiry_date
  });
  await fs.writeFileSync(tokenPath, payload);
  res.status(200).json({ message: 'Login successful! You can now go back to the app.' });
};
