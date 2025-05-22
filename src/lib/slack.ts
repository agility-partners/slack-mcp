import { WebClient } from '@slack/web-api';

/**
 * Create and export a Slack client instance
 * @constant slackClient - The configured Slack client
 * Uses environment variable:
 * - SLACK_BOT_TOKEN: Authentication token for the Slack service
 */
export const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);