import { FieldSet } from "airtable";
import { relationToOne, takeFirst } from "lib/decoding";
import {
  array,
  decodeType,
  field,
  optional,
  record,
  string,
} from "typescript-json-decoder";
import {
  volunteerManagementBase,
  unwrapRecords,
  createBatch,
  updateBatch,
} from "./request";

/** The Airtable schema of the Slack user table */
export interface Schema extends FieldSet {
  id: string;
  name: string;
  email: string;
  slackId: string;
  slackAvatarUrl: string;
  userProfile: ReadonlyArray<string>;
}

/** Slack Users table */
export const slackUsersTable =
  volunteerManagementBase<Schema>("Slack Users 2.0");

/** Slack user as stored in Airtable */
export type SlackUser = decodeType<typeof decodeSlackUser>;

/** Decode `SlackUser` from DB schema */
export const decodeSlackUser = record({
  id: string,
  slackId: string,
  name: string,
  email: optional(string),
  slackAvatarUrl: optional(string),
  userProfileRelationId: field("userProfile", relationToOne),
});

/** Encode `SlackUser` to DB schema */
export function encodeSlackUser(user: Partial<SlackUser>): Partial<Schema> {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    slackId: user.slackId,
    slackAvatarUrl: user.slackAvatarUrl,
    userProfile: user.userProfileRelationId
      ? [user.userProfileRelationId]
      : undefined,
  };
}

//
// API Calls
//

/** Get Slack user by Slack ID */
export async function getSlackUserBySlackId(
  slackId: string
): Promise<SlackUser> {
  return await slackUsersTable
    .select({
      filterByFormula: `{slackId} = "${slackId}"`,
      maxRecords: 1,
    })
    .all()
    .then(unwrapRecords)
    .then(takeFirst(decodeUsers));
}

/** Get all Slack users stored in Airtable */
export async function getAllSlackUsers(): Promise<SlackUser[]> {
  return await slackUsersTable
    .select()
    .all()
    .then(unwrapRecords)
    .then(decodeUsers);
}

/** Create new Slack users in Airtable */
export async function createSlackUsers(
  users: Omit<SlackUser, "id">[]
): Promise<SlackUser[]> {
  const records = users.map(encodeSlackUser);
  return await createBatch(slackUsersTable, records)
    .then(unwrapRecords)
    .then(decodeUsers);
}

/** Update Slack users in Airtable */
export async function updateSlackUsers(
  users: SlackUser[]
): Promise<SlackUser[]> {
  const records = users.map(encodeSlackUser);
  return await updateBatch(slackUsersTable, records)
    .then(unwrapRecords)
    .then(decodeUsers);
}

//
// Helpers
//

/** Decode an array of `SlackUser` objects */
const decodeUsers = array(decodeSlackUser);