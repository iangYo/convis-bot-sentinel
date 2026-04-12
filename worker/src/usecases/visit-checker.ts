import { VisitInfo } from "../domain/visit-models.js";
import { parseVisitInfo } from "./visit-parser.js";

export async function fetchAndParseVisit(
  calendarUrl: string,
  targetSector: string,
  targetCell: string,
): Promise<VisitInfo | null> {
  const response = await fetch(calendarUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch calendar page: ${response.status}`);
  }

  const html = await response.text();
  return parseVisitInfo(html, targetSector, targetCell);
}
