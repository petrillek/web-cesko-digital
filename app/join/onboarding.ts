import { getSlackUser, isRegularUser } from "lib/slack/user";
import { upsertSlackUser } from "lib/airtable/slack-user";
import { sendDirectMessage } from "lib/slack/message";
import { join, resolve } from "path";
import { readdirSync, readFileSync } from "fs";
import fs from "fs";
import {
  getUserProfileByMail,
  updateUserProfile,
} from "lib/airtable/user-profile";
import { map, normalizeEmailAddress } from "lib/utils";

const { SLACK_SYNC_TOKEN = "", SLACK_GREET_BOT_TOKEN = "" } = process.env;

/**
 * Confirm user account when user joins Slack
 *
 * To confirm the account, we have to create a new record in the Slack Users
 * table, link it to the record in the User Profiles table and mark the user
 * profile as confirmed.
 */
export async function confirmUserAccount(slackId: string) {
  // We need the full user object to get to the e-mail
  const slackUser = await getSlackUser(SLACK_SYNC_TOKEN, slackId);
  const normalizedEmail = map(slackUser.profile.email, normalizeEmailAddress);

  // Ignore non-regular “users” such as apps
  if (!isRegularUser(slackUser)) {
    console.info(
      `Received Slack team_join event for non-regular user ${slackId}, ignoring`
    );
    return;
  }

  // Save the new Slack user to the Slack Users DB table.
  // This makes sense even if the following steps fail.
  const slackUserInDB = await upsertSlackUser({
    slackId: slackUser.id,
    name: slackUser.real_name || slackUser.name,
    email: normalizedEmail,
    contactEmail: undefined,
    slackAvatarUrl: slackUser.profile.image_512,
    userProfileRelationId: undefined,
  });

  // Without an e-mail address we can’t confirm the account
  if (!normalizedEmail) {
    console.error(
      `Account confirmation failed, missing email addres for user ${slackId}`
    );
    return;
  }

  // Get the initial user profile we are trying to confirm
  const initialProfile = await getUserProfileByMail(normalizedEmail)
    // Return null on errors
    .catch(() => null);

  // The profile may not exist if the user skipped onboarding somehow
  if (!initialProfile) {
    console.error(
      `Account confirmation failed, user profile not found for user “${slackId}”`
    );
    return;
  }

  // Not sure how this could happen, but let’s keep the diagnostics tight here
  if (initialProfile.state === "confirmed" && initialProfile.slackId) {
    console.warn(`Account “${slackId}” already confirmed, skipping`);
    return;
  }

  // Flip account to confirmed and link the associated Slack user
  await updateUserProfile(initialProfile.id, {
    slackUserRelationId: slackUserInDB.id,
    state: "confirmed",
  });
}

/**
 * Send welcome message to Slack user
 *
 * The message is read from `content/welcome.txt`, see formatting spec here:
 * <https://api.slack.com/reference/surfaces/formatting>. Unfortunately it’s not
 * regular Markdown, not even close.
 */
export async function sendWelcomeMessage(
  slackId: string,
  message: string | undefined = undefined
) {
  const contentFolder = join(process.cwd(), "content", "welcome");
  const welcomeMessagePath = join(contentFolder, "day0.txt");
  const defaultMessage = fs.readFileSync(welcomeMessagePath, "utf-8");
  await sendDirectMessage(
    SLACK_GREET_BOT_TOKEN,
    slackId,
    message || defaultMessage
  );
}

/** Find all files named `dayXY.txt` under `content/welcome` and return a list of [day, message] pairs */
export function parseWelcomeMessages() {
  const dir = join(process.cwd(), "content", "welcome");
  const messages: [number, string][] = [];
  for (const entry of readdirSync(dir)) {
    if (!entry.startsWith("day")) {
      continue;
    }
    const matches = entry.match(/day(\d+)/);
    if (matches && matches.length > 1) {
      const [_, dayString] = matches;
      const path = resolve(dir, entry);
      const message = readFileSync(path, "utf-8");
      messages.push([parseInt(dayString), message]);
    }
  }
  return messages.sort(([a], [b]) => a - b);
}
