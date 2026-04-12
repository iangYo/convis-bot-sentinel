import { VisitInfo } from "../domain/visit-models.js";
import { TelegramClient } from "../infrastructure/telegram.js";
import { fetchAndParseVisit } from "../usecases/visit-checker.js";

function createVisitMessage(info: VisitInfo): string {
  return (
    "📅 PRÓXIMA VISITA DISPONÍVEL\n\n" +
    `🏢 Setor: ${info.sector}\n` +
    `🔢 Cela: ${info.cell}\n` +
    `📆 Data: ${info.date}\n` +
    `🕐 Horário de Entrada: ${info.entryTime}\n\n` +
    "✅ Faça sua reserva o quanto antes!"
  );
}

export async function handleVisitCheck(
  baseUrl: string,
  targetSector: string,
  targetCell: string,
  telegramClient: TelegramClient,
  chatId: string,
): Promise<void> {
  console.log("Checking next available visit...");

  const calendarUrl = `${baseUrl}/diasdevisita.xhtml`;
  const visitInfo = await fetchAndParseVisit(calendarUrl, targetSector, targetCell);

  if (!visitInfo) {
    console.log("No matching visit found for the given sector/cell.");
    return;
  }

  console.log(`Visit found: ${visitInfo.date} at ${visitInfo.entryTime}`);
  await telegramClient.sendMessage(parseInt(chatId), createVisitMessage(visitInfo));
  console.log("Visit notification sent.");
}
