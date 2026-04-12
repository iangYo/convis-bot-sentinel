import { VisitInfo } from "../domain/visit-models.js";

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractParentTable(html: string, startIndex: number): string | null {
  let depth = 0;
  let i = startIndex;

  while (i < html.length) {
    const openTag = html.indexOf("<table", i);
    const closeTag = html.indexOf("</table>", i);

    if (closeTag === -1) return null;

    if (openTag !== -1 && openTag < closeTag) {
      depth++;
      i = openTag + 6;
    } else {
      depth--;
      if (depth === 0) {
        return html.slice(startIndex, closeTag + "</table>".length);
      }
      i = closeTag + "</table>".length;
    }
  }

  return null;
}

export function parseVisitInfo(html: string, targetSector: string, targetCell: string): VisitInfo | null {
  // Find span with matching sector and cell number
  const spanRegex = new RegExp(
    `<span[^>]*class="[^"]*Fs14[^"]*FontVoltSemiBold[^"]*"[^>]*>[^<]*${escapeRegex(targetSector)}[^<]*Celas:[^<]*\\b${escapeRegex(targetCell)}\\b[^<]*<\\/span>`,
    "i",
  );

  const spanMatch = html.match(spanRegex);
  if (!spanMatch || spanMatch.index === undefined) return null;

  // Extract surrounding table HTML, tracking nesting to find the correct closing tag
  const beforeSpan = html.slice(0, spanMatch.index);
  const tableStartIndex = beforeSpan.lastIndexOf("<table");
  if (tableStartIndex === -1) return null;

  const tableHtml = extractParentTable(html, tableStartIndex);
  if (!tableHtml) return null;

  // Extract visit date
  const dateMatch = tableHtml.match(/<div[^>]*class="[^"]*FontRobotoLight[^"]*Fs16[^"]*"[^>]*>\s*([^<]+)\s*<\/div>/i);
  if (!dateMatch) return null;
  const date = dateMatch[1].trim();

  // Find the <td> that contains the "Hora Entrada" column title span,
  // then extract all its text content (same as BeautifulSoup's td.get_text())
  const entryTimeTdMatch = tableHtml.match(
    /<td\b[^>]*>(?:(?!<\/td>)[\s\S])*?<span[^>]*class="ui-column-title"[^>]*>Hora Entrada<\/span>[\s\S]*?<\/td>/i,
  );
  if (!entryTimeTdMatch) return null;

  const tdText = entryTimeTdMatch[0]
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const entryTime = tdText.replace(/Hora Entrada/i, "").trim();

  return { sector: targetSector, cell: targetCell, date, entryTime };
}
