import { z } from "zod";
import { slackClient } from "../../lib/slack";
import { slackService } from "../../services/slack.service";
import { prisma } from "../../lib/prisma";
import { generateObject, generateText } from "ai";
import { registry } from "../../lib/registry";

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
    const { object } = await generateObject({
      model: registry.languageModel('azure:gpt-4o'),
      schema: z.object({
        channel: z.string().describe("The Slack channel ID or user ID to send the message to."),
        text: z.string().describe("The text of the message to send."),
        blocks: z.any().optional().describe("Optional Slack blocks for rich formatting."),
      }),
      system:
        'You are an AI Agent for sending customized Slack messages to users or channels. ' +
        'Your task is to format a professional message to be sent via Slack. ' +
        'The message should incorporate the provided details and reference any sources when applicable. ' +
        'Keep the message concise but comprehensive. ' +
        'Keep the message short. Leverage tables and other compact concepts where appropriate. ' +
        'Display information side by side where possible, using Slack Block Kit section blocks with fields or markdown tables for compactness. ' +
        'Always include a meaningful heading with emojis that matter.\n' +
        '\n\nIMPORTANT SLACK FORMATTING RULES:\n' +
        '- Use *text* for bold (NOT **text**)\n' +
        '- Use _text_ for italic (NOT __text__)\n' +
        '- Use `text` for inline code\n' +
        '- Use > for quotes\n' +
        '- Use simple bullet points with • or -\n' +
        '- Use line breaks for spacing\n' +
        '- Do NOT use ## headers or complex markdown\n' +
        '- Keep formatting simple and clean\n\n' +
        'Maintain a professional tone throughout all communications. ' +
        'Always understand and consider the context of the conversation when crafting your response. ' +
        'Do not sign your name at the end of messages, add any signature, or include closings like "Best regards," "Sincerely," etc. ' +
        'Never ask the recipient to provide additional information or follow up, as this system does not have interactive capabilities. ' +
        'The recipient can be either a user ID or a channel ID - the system will look up the appropriate destination in the database.',
      prompt:
        `Please create a Slack message for recipient "${channelId}" (which may be a user or channel ID).\n\n` +
        `Here is the message text:\n${message}\n\n` +
        (blocks ? `Blocks: ${JSON.stringify(blocks)}\n\n` : "") +
        `Please parse through this data, extract the key information, and organize it in a clear and readable format appropriate for Slack.\n\n` +
        `If you find any links in the content, make them into Slack buttons with appropriate labels and actions.\n\n` +
        `Format your response as a JSON object with keys: channel, text, and optionally blocks.`,
    });

    const postMessagePayload = {
      channel: object.channel,
      text: object.text,
      ...(object.blocks && { blocks: object.blocks }),
    };
    const response = await slackClient.chat.postMessage(postMessagePayload);
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