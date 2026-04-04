interface InlineKeyboardButton {
  text: string;
  callback_data: string;
}

interface InlineKeyboardMarkup {
  inline_keyboard: InlineKeyboardButton[][];
}

interface TelegramResponse {
  ok: boolean;
  description?: string;
  result?: unknown;
}

export class TelegramClient {
  private readonly baseUrl: string;

  constructor(private readonly botToken: string) {
    this.baseUrl = `https://api.telegram.org/bot${botToken}`;
  }

  async sendMessage(
    chatId: number,
    text: string,
    replyMarkup: InlineKeyboardMarkup | null = null
  ): Promise<TelegramResponse> {
    const url = `${this.baseUrl}/sendMessage`;
    const body: Record<string, unknown> = {
      chat_id: chatId,
      text: text,
      parse_mode: "Markdown",
    };

    if (replyMarkup) {
      body.reply_markup = replyMarkup;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = await response.json() as TelegramResponse;
    if (!json.ok) {
      console.error("🚨 Telegram API Error (sendMessage):", json);
      throw new Error(`Telegram API error: ${json.description}`);
    }

    return json;
  }

  async editMessageKeyboard(
    chatId: number,
    messageId: number,
    replyMarkup: InlineKeyboardMarkup
  ): Promise<TelegramResponse> {
    const url = `${this.baseUrl}/editMessageReplyMarkup`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        reply_markup: replyMarkup,
      }),
    });

    const json = await response.json() as TelegramResponse;
    if (!json.ok) {
      console.error("🚨 Telegram API Error (editMessageReplyMarkup):", json);
    }

    return json;
  }

  async answerCallbackQuery(callbackId: string): Promise<TelegramResponse> {
    const url = `${this.baseUrl}/answerCallbackQuery`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callback_query_id: callbackId }),
    });

    const json = await response.json() as TelegramResponse;
    if (!json.ok) {
      console.error("🚨 Telegram API Error (answerCallbackQuery):", json);
    }

    return json;
  }
}
