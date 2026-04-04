import { MESSAGES } from "../config/constants.js";
import { StorageRepository } from "../infrastructure/storage.js";
import { TelegramClient } from "../infrastructure/telegram.js";
import { buildKeyboard } from "./keyboard-builder.js";

export async function handleMenuCommand(
  telegramClient: TelegramClient,
  storageRepository: StorageRepository,
  chatId: number
): Promise<void> {
  const itemStatus = await storageRepository.getItemStatus();
  const keyboard = buildKeyboard(itemStatus);

  await telegramClient.sendMessage(chatId, MESSAGES.CONTROL_PANEL, keyboard);

  console.log("Control panel sent to chat:", chatId);
}
