import { logger, schedules, wait } from "@trigger.dev/sdk/v3";
import { slackService } from "../services/slack.service";
import { prisma } from "../lib/prisma";

export const slackUserCacheTask = schedules.task({
  id: "slack-user-cache",
  // Every hour
  cron: "0 * * * *",
  // Set an optional maxDuration to prevent tasks from running indefinitely
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  run: async (payload, { ctx }) => {
    try {
      const users = await slackService.getAllUsers();
      logger.info(`Retrieved ${users.length} users from Slack`);
      
      // Process each user individually
      const savedUsers = [];
      for (const user of users) {
        try {
          // Log each user being processed
          logger.info(`Processing user: ${user.profile.email} (${user.real_name || user.name})`);
          
          // Save user to database directly in the cron job
          const savedUser = await prisma.userCache.upsert({
            where: { email: user.profile.email.toLowerCase() },
            update: {
              slackId: user.id,
              name: user.real_name || user.name,
            },
            create: {
              email: user.profile.email.toLowerCase(),
              slackId: user.id,
              name: user.real_name || user.name,
            }
          });
          savedUsers.push(savedUser);
        } catch (err) {
          logger.error(`Failed to save user ${user.profile?.email}:`);
        }
      }
      
      logger.info(`Saved ${savedUsers.length} users to database`);
      return {
        success: true,
        usersProcessed: savedUsers.length
      };
    } catch (error) {
      logger.error("Failed to cache Slack users:");
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }
});