export function extractViewState(html: string): string {
  const match = html.match(/name="javax\.faces\.ViewState".*?value="([^"]+)"/);
  if (!match) {
    throw new Error("ViewState not found in HTML");
  }
  return match[1];
}

export function extractRedirectUrl(responseText: string, baseUrl: string): string {
  const match = responseText.match(/<redirect url="([^"]+)"/);
  if (!match) {
    throw new Error("Login failed: No redirect URL found");
  }

  const url = match[1];
  return url.startsWith("http") ? url : baseUrl + url;
}

export function extractAddress(html: string): string {
  // Find the span containing "Lotação:" then grab the text of the very next span
  const match = html.match(/Lota(?:[çc]|&ccedil;)(?:[ãa]|&atilde;)o:<\/span>[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/i);
  if (!match) {
    throw new Error('Address label "Lotação" not found in HTML');
  }
  return match[1].trim();
}

export function isButtonEnabled(html: string): boolean {
  // Regex-based parsing for Cloudflare Workers
  const buttonMatch = html.match(/<button[^>]*id="[^"]*btnEmitir"[^>]*>/i);

  if (!buttonMatch) {
    throw new Error('Button not found with id containing "btnEmitir"');
  }

  const buttonTag = buttonMatch[0];
  return !buttonTag.includes("disabled");
}
