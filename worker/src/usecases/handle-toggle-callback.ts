import { StorageRepository } from "../infrastructure/storage.js";
import { TelegramClient } from "../infrastructure/telegram.js";
import { buildKeyboard, getStorageKeyFromCallback } from "./keyboard-builder.js";

export async function handleToggleCallback(
  telegramClient: TelegramClient,
  storageRepository: StorageRepository,
  callbackData: string,
  chatId: number,
  messageId: number,
  callbackId: string
): Promise<void> {
  const storageKey = getStorageKeyFromCallback(callbackData);

  if (!storageKey) {
    console.warn("Unknown callback data:", callbackData);
    return;
  }

  // Toggle the item in storage
  await storageRepository.toggleItem(storageKey);

  // Acknowledge the callback (removes loading indicator)
  await telegramClient.answerCallbackQuery(callbackId);

  // Get updated status and rebuild keyboard
  const itemStatus = await storageRepository.getItemStatus();
  const newKeyboard = buildKeyboard(itemStatus);

  await telegramClient.editMessageKeyboard(chatId, messageId, newKeyboard);

  console.log(`Toggled ${storageKey} for chat:`, chatId);
}
