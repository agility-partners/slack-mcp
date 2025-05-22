import { z } from "zod";
import { slackClient } from "../../lib/slack";
import { slackService } from "../../services/slack.service";

/**
 * Slack Message Send Tool
 * POST /slack/chat.postMessage
 */
export const slackMessageSendTool = {
  name: "slack_message_send",
  description: "Send a message to a Slack channel.",
  schema: {
    channelId: z.string({ description: "Slack channel ID to send the message to." }),
    message: z.string({ description: "Text of the message to send." }),
    blocks: z.any().optional().describe("Optional Slack blocks for rich formatting."),
  },
  handler: async ({ channelId, message, blocks }: { channelId: string; message: string; blocks?: any }) => {
    const response = await slackClient.chat.postMessage({
      channel: channelId,
      text: message,
      ...(blocks && { blocks }),
    });
    return { content: [{ type: "text" as const, text: JSON.stringify(response) }] };
  }
};

/**
 * Slack Get Users Tool
 * GET /slack/users.list
 */
export const slackGetUsersTool = {
  name: "slack_get_users",
  description: "Get a list of all Slack users.",
  schema: {},
  handler: async () => {
    const users = await slackService.getAllUsers();
    return { content: [{ type: "text" as const, text: JSON.stringify(users) }] };
  }
};