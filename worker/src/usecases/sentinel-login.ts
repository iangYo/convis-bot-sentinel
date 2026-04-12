import { Credentials } from "../domain/sentinel-models.js";
import { extractRedirectUrl, extractViewState } from "./sentinel-parser.js";

export async function loginAndGetPage(baseUrl: string, credentials: Credentials): Promise<string> {
  const loginUrl = `${baseUrl}/login.xhtml`;

  const loginPageResponse = await fetch(loginUrl);
  const loginHtml = await loginPageResponse.text();
  const viewState = extractViewState(loginHtml);

  const payload = new URLSearchParams({
    "javax.faces.partial.ajax": "true",
    "javax.faces.source": "formLogin:btnEmitir",
    "javax.faces.partial.execute": "@all",
    "javax.faces.partial.render": "formLogin",
    "formLogin:btnEmitir": "formLogin:btnEmitir",
    formLogin: "formLogin",
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

  const redirectUrl = extractRedirectUrl(loginResponseText, baseUrl);
  const pageResponse = await fetch(redirectUrl);

  return pageResponse.text();
}
