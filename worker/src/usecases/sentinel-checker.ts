import { Credentials } from "../domain/sentinel-models.js";
import { loginAndGetPage } from "./sentinel-login.js";
import { isButtonEnabled } from "./sentinel-parser.js";

export async function loginAndCheckButton(baseUrl: string, credentials: Credentials): Promise<boolean> {
  const pageHtml = await loginAndGetPage(baseUrl, credentials);
  return isButtonEnabled(pageHtml);
}
