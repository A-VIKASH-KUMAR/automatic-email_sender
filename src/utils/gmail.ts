import { google } from "googleapis";
import fs from "fs/promises";
// Function to load saved access token after google signup
export const loadSavedCredentialsIfExist = async (TOKEN_PATH: string) => {
  try {
    const data = await fs.readFile(TOKEN_PATH, { encoding: "utf8" });
    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

// get unreplied emails
export const getUnrepliedMessages = async (auth: any) => {
  const gmail = google.gmail({ version: "v1", auth });
  const res = await gmail.users.messages.list({
    userId: "me",
    labelIds: ["INBOX", "UNREAD"],
    maxResults: 2,
    q: "from:angajalavikashkumar@gmail.com category:primary",
  });
  return res.data.messages || [];
};

// Get details of a specific email
export const getEmailDetails = async (auth: any, messageId: string) => {
  const gmail = google.gmail({ version: "v1", auth });
  const res = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "metadata",
    metadataHeaders: ["Subject", "From"],
  });
  return res;
};

// create raw message
const createRawMessage = (
  to: string,
  subject: string,
  messageText: string,
  messageId: string,
  threadId: string
) => {
  const messageParts = [
    `From: me`,
    `To: ${to}`,
    `Subject: ${subject}`,
    threadId,
    `In-Reply-To: ${messageId}`,
    `References: ${messageId}`,
    ``,
    messageText,
  ];

  const message = messageParts.join("\n");
  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "-")
    .replace(/=+$/, "");
};

/**
 * Generates the auto-reply message text.
 */
const getAutoReplyMessage = () => {
  return `
        Hi,

          I am currently on leave as of now, as i am out of station. I will return on 31-03-24.

        If this matter is urgent, please contact at 8798654235 for immediate assistance.

        Thank You,
        A Vikash Kumar
    `;
};

// Function to send email to the specific thread
export const sendEmail = async (
  auth: any,
  to: string,
  subject: string,
  messageId: string,
  threadId: string
) => {
  const gmail = google.gmail({ version: "v1", auth });
  const messageText = getAutoReplyMessage();
  const rawMessage = createRawMessage(
    to,
    subject,
    messageText,
    messageId,
    threadId
  );

  const emailSentResponse = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: rawMessage,
      threadId: threadId,
    },
  });
  return emailSentResponse;
};

/* Create label */

export const createLabel = async (auth: any) => {
  const LABEL_NAME = "PENDING";
  const gmail = google.gmail({ version: "v1", auth });
  try {
    const res = await gmail.users.labels.create({
      userId: "me",
      requestBody: {
        name: LABEL_NAME,
        labelListVisibility: "labelShow",
        messageListVisibility: "show",
      },
    });
    return res.data.id;
  } catch (err: any) {
    if (err.code === 409) {
      //label already exist
      const res: any = await gmail.users.labels.list({
        userId: "me",
      });
      const label = res.data.labels.find(
        (label: any) => label.name === LABEL_NAME
      );
      return label.id;
    } else {
      throw err;
    }
  }
};

/* Add label to the message and move it ot the label folder */
export const addLabel = async (auth: any, message: any, labelId: string) => {
  const gmail = google.gmail({ version: "v1", auth });
  const modifiedMessage = await gmail.users.messages.modify({
    id: message.id,
    userId: "me",
    requestBody: {
      addLabelIds: [labelId],
      removeLabelIds: ["INBOX"],
    },
  });
  return modifiedMessage;
};

// mark thread as replied
export const markThreadAsReplied = async (
  threadId: string,
  repliedThreadsFile: string
) => {
  try {
    const oldThreadIds:any = await fs.readFile(repliedThreadsFile,"utf8")
    let parsedIds = JSON.parse(oldThreadIds).threads
    parsedIds.push(threadId);
    await fs.writeFile(
      repliedThreadsFile,
      JSON.stringify({ threads: parsedIds })
    );
    return parsedIds;
  } catch (error) {
    console.error("Error marking thread as replied:", error);
  }
};

// check if the thread has been replied
export const hasThreadBeenReplied = async (
  threadId: string,
  repliedThreadsFile: string
) => {
  try {
    const repliedThreads: any = await fs.readFile(repliedThreadsFile, "utf-8");
    const repliedThreadsArray = JSON.parse(repliedThreads).threads;
    return repliedThreadsArray.includes(threadId)
      ? repliedThreadsArray.includes(threadId)
      : false;
  } catch (error) {
    console.error("Error checking if thread has been replied:", error);
    return false;
  }
};
