import { slackClient } from '../lib/slack';

class SlackService {
  private client = slackClient;

  public async getAllUsers(): Promise<any[]> {
    try {
      const result = await this.client.users.list({});
      return (result.members || []).filter(user => !user.deleted && !user.is_bot && user.profile?.email);
    } catch (error) {
      console.error('Failed to get all users:', error);
      return [];
    }
  }

}

export const slackService = new SlackService();