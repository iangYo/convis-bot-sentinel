import { Credentials } from "../domain/sentinel-models.js";
import { extractRedirectUrl, extractViewState, isButtonEnabled } from "./sentinel-parser.js";

export async function loginAndCheckButton(
  baseUrl: string,
  credentials: Credentials
): Promise<boolean> {
  const loginUrl = `${baseUrl}/login.xhtml`;

  // Get login page
  const loginPageResponse = await fetch(loginUrl);
  const loginHtml = await loginPageResponse.text();
  const viewState = extractViewState(loginHtml);

  // Submit login
  const payload = new URLSearchParams({
    "javax.faces.partial.ajax": "true",
    "javax.faces.source": "formLogin:btnEmitir",
    "javax.faces.partial.execute": "@all",
    "javax.faces.partial.render": "formLogin",
    "formLogin:btnEmitir": "formLogin:btnEmitir",
    "formLogin": "formLogin",
    "formLogin:cpfCampo": credentials.cpf,
    "formLogin:carteirinha": credentials.cardNumber,
    "javax.faces.ViewState": viewState,
  });

  const loginResponse = await fetch(loginUrl, {
    method: "POST",
    headers: {
      "Faces-Request": "partial/ajax",
      "X-Requested-With": "XMLHttpRequest",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: payload.toString(),
  });

  const loginResponseText = await loginResponse.text();

  // Follow redirect
  const redirectUrl = extractRedirectUrl(loginResponseText, baseUrl);
  const pageResponse = await fetch(redirectUrl);
  const pageHtml = await pageResponse.text();

  return isButtonEnabled(pageHtml);
}
