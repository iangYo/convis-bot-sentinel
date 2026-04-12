import { COMMANDS } from "../config/constants.js";
import { TelegramUpdate } from "../domain/models.js";
import { StorageRepository } from "../infrastructure/storage.js";
import { TelegramClient } from "../infrastructure/telegram.js";
import { handleMenuCommand } from "../usecases/handle-menu-command.js";
import { handleToggleCallback } from "../usecases/handle-toggle-callback.js";
import { handleVisitCheck } from "./visit-handler.js";

interface VisitConfig {
  baseUrl: string;
  targetSector: string;
  targetCell: string;
}

export async function handlePostRequest(
  telegramClient: TelegramClient,
  storageRepository: StorageRepository,
  update: unknown,
  visitConfig: VisitConfig
): Promise<void> {
  const telegramUpdate = new TelegramUpdate(update as any);

  // Handle /menu command
  if (telegramUpdate.isCommand(COMMANDS.MENU)) {
    const chatId = telegramUpdate.getChatId();
    if (chatId) {
      await handleMenuCommand(telegramClient, storageRepository, chatId);
    }
    return;
  }

  // Handle /proxima_visita command
  if (telegramUpdate.isCommand(COMMANDS.NEXT_VISIT)) {
    const chatId = telegramUpdate.getChatId();
    if (chatId) {
      await handleVisitCheck(
        visitConfig.baseUrl,
        visitConfig.targetSector,
        visitConfig.targetCell,
        telegramClient,
        String(chatId)
      );
    }
    return;
  }

  // Handle callback (button clicks)
  if (telegramUpdate.isCallback()) {
    const callbackData = telegramUpdate.getCallbackData();
    const chatId = telegramUpdate.getChatId();
    const messageId = telegramUpdate.getMessageId();
    const callbackId = telegramUpdate.getCallbackId();

    if (callbackData && chatId && messageId !== undefined && callbackId) {
      await handleToggleCallback(
        telegramClient,
        storageRepository,
        callbackData,
        chatId,
        messageId,
        callbackId
      );
    }
    return;
  }

  console.log("Ignoring unhandled update");
}
