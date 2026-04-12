import { Credentials } from "../domain/sentinel-models.js";
import { loginAndGetPage } from "./sentinel-login.js";
import { extractAddress } from "./sentinel-parser.js";

export async function loginAndGetAddress(baseUrl: string, credentials: Credentials): Promise<string> {
  const pageHtml = await loginAndGetPage(baseUrl, credentials);
  return extractAddress(pageHtml);
}
