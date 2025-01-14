import { getAllUserProfiles } from "lib/airtable/user-profile";

export async function GET() {
  const userProfiles = await getAllUserProfiles("Confirmed Profiles");
  const nonEmptySkills = userProfiles
    .map((userProfile) => userProfile.skills)
    .filter((skill) => skill !== "");

  let response = `Má zadány dovednosti, ${nonEmptySkills.length}\n`;
  response += `Nemá zadané dovednosti, ${
    userProfiles.length - nonEmptySkills.length
  }\n`;

  return new Response(response, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
