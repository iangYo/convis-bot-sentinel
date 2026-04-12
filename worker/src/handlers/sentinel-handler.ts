import { STORAGE_KEYS } from "../config/constants.js";
import { Credentials } from "../domain/sentinel-models.js";
import { StorageRepository } from "../infrastructure/storage.js";
import { TelegramClient } from "../infrastructure/telegram.js";
import { loginAndCheckButton } from "../usecases/sentinel-checker.js";

function getCurrentDateInSaoPaulo(): string {
  const now = new Date();
  // São Paulo timezone is UTC-3
  const saoPauloDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  return saoPauloDate.toISOString().split("T")[0]; // Returns YYYY-MM-DD
}

export async function handleSentinelCheck(
  baseUrl: string,
  credentials: Credentials,
  telegramClient: TelegramClient,
  chatId: string,
  storageRepository: StorageRepository,
): Promise<void> {
  console.log("Starting sentinel surveillance...");

  try {
    const currentDate = getCurrentDateInSaoPaulo();
    console.log(`Current date in São Paulo: ${currentDate}`);

    // Check if already notified today
    const lastNotificationDate = await storageRepository.get(STORAGE_KEYS.NOTIFICATION_DATE);

    if (lastNotificationDate === currentDate) {
      console.log("Already notified today. Aborting execution.");
      return;
    }

    console.log(`Last notification date: ${lastNotificationDate || "never"}`);

    const buttonEnabled = await loginAndCheckButton(baseUrl, credentials);

    if (buttonEnabled) {
      console.log("ALERT: Button is enabled! Sending notification...");

      const message =
        "⚔️ *RELATÓRIO DE VIGILÂNCIA*\n\n" +
        "🟢 *Status do Botão:* LIBERADO\n\n" +
        "🚨 *Ação Requerida:*\n" +
        "A emissão de senha já está disponível! Acesse o sistema agora e realize o agendamento.";

      await telegramClient.sendMessage(parseInt(chatId), message);

      // Update last notification date
      await storageRepository.put(STORAGE_KEYS.NOTIFICATION_DATE, currentDate);
      console.log("Notification sent and date saved!");
    } else {
      console.log("All normal. Button is disabled.");
    }
  } catch (error) {
    console.error("Sentinel error:", error);
    throw error;
  }
}
