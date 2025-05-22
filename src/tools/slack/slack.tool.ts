import { z } from "zod";
import { slackClient } from "../../lib/slack";
import { slackService } from "../../services/slack.service";
import { prisma } from "../../lib/prisma";

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
 * Slack Get User By Email Tool
 * GET /slack/user.byEmail
 */
export const slackGetUserByEmailTool = {
  name: "slack_get_user_by_email",
  description: "Get a Slack user by their email address.",
  schema: {
    email: z.string({ description: "Email address of the user to look up." }),
  },
  handler: async ({ email }: { email: string }) => {
    const normalizedEmail = email.toLowerCase();
    const user = await prisma.userCache.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      return { content: [{ type: "text" as const, text: JSON.stringify({ found: false, message: `No user found with email: ${normalizedEmail}` }) }] };
    }

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          found: true,
          id: user.id,
          email: user.email,
          name: user.name,
          slackId: user.slackId
        })
      }]
    };
  }
};