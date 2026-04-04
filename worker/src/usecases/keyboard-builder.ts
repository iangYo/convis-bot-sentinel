import { CALLBACK_ACTIONS, EMOJIS, ITEM_LABELS, STORAGE_KEYS } from "../config/constants.js";
import { ItemStatus } from "../domain/models.js";

interface InlineKeyboardButton {
  text: string;
  callback_data: string;
}

interface InlineKeyboardMarkup {
  inline_keyboard: InlineKeyboardButton[][];
}

export function buildKeyboard(itemStatus: ItemStatus): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        {
          text: `${ITEM_LABELS.FOOD}: ${itemStatus.food ? EMOJIS.ENABLED : EMOJIS.DISABLED}`,
          callback_data: CALLBACK_ACTIONS.TOGGLE_FOOD,
        },
      ],
      [
        {
          text: `${ITEM_LABELS.HYGIENE}: ${itemStatus.hygiene ? EMOJIS.ENABLED : EMOJIS.DISABLED}`,
          callback_data: CALLBACK_ACTIONS.TOGGLE_HYGIENE,
        },
      ],
      [
        {
          text: `${ITEM_LABELS.BAG}: ${itemStatus.bag ? EMOJIS.ENABLED : EMOJIS.DISABLED}`,
          callback_data: CALLBACK_ACTIONS.TOGGLE_BAG,
        },
      ],
    ],
  };
}

export function getStorageKeyFromCallback(callbackData: string): string | undefined {
  const mapping: Record<string, string> = {
    [CALLBACK_ACTIONS.TOGGLE_FOOD]: STORAGE_KEYS.FOOD,
    [CALLBACK_ACTIONS.TOGGLE_HYGIENE]: STORAGE_KEYS.HYGIENE,
    [CALLBACK_ACTIONS.TOGGLE_BAG]: STORAGE_KEYS.BAG,
  };

  return mapping[callbackData];
}
