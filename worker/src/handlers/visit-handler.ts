import { MESSAGES } from "../config/constants.js";
import { VisitConfig, VisitInfo } from "../domain/visit-models.js";
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
  visitConfig: VisitConfig,
  telegramClient: TelegramClient,
  chatId: number,
  replyOnNotFound = false,
): Promise<void> {
  console.log("Checking next available visit...");

  const calendarUrl = `${visitConfig.baseUrl}/diasdevisita.xhtml`;
  const visitInfo = await fetchAndParseVisit(calendarUrl, visitConfig.targetSector, visitConfig.targetCell);

  if (!visitInfo) {
    console.log("No matching visit found for the given sector/cell.");
    if (replyOnNotFound) {
      await telegramClient.sendMessage(chatId, MESSAGES.NO_VISIT_FOUND);
    }
    return;
  }

  console.log(`Visit found: ${visitInfo.date} at ${visitInfo.entryTime}`);
  await telegramClient.sendMessage(chatId, createVisitMessage(visitInfo));
  console.log("Visit notification sent.");
}
