import { Credentials } from "../domain/sentinel-models.js";
import { TelegramClient } from "../infrastructure/telegram.js";
import { loginAndCheckButton } from "../usecases/sentinel-checker.js";

export async function handleSentinelCheck(
  baseUrl: string,
  credentials: Credentials,
  telegramClient: TelegramClient,
  chatId: string
): Promise<void> {
  console.log("Starting sentinel surveillance...");

  try {
    const buttonEnabled = await loginAndCheckButton(baseUrl, credentials);

    if (buttonEnabled) {
      console.log("ALERT: Button is enabled! Sending notification...");
      
      const message =
        "BOT EM TESTES, IGNORE ESTA MENSAGEM\n" +
        "⚔️ RELATÓRIO DE VIGILÂNCIA\n" +
        "Status do Botão: LIBERADO\n" +
        "Ação Requerida: O robô detectou que o botão não está mais desabilitado. " +
        "Entre no sistema imediatamente para evitar ineficiências.";

      await telegramClient.sendMessage(parseInt(chatId), message);
      console.log("Notification sent!");
    } else {
      console.log("All normal. Button is disabled.");
    }
  } catch (error) {
    console.error("Sentinel error:", error);
    throw error;
  }
}
