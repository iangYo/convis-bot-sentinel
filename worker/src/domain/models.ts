export class ItemStatus {
  constructor(
    public readonly food: boolean,
    public readonly hygiene: boolean,
    public readonly bag: boolean
  ) {}

  static fromStorage(foodValue: string, hygieneValue: string, bagValue: string): ItemStatus {
    return new ItemStatus(
      foodValue === "true",
      hygieneValue === "true",
      bagValue === "true"
    );
  }

  toJSON() {
    return {
      comida: this.food,
      higiene: this.hygiene,
      sacola: this.bag,
    };
  }
}

interface TelegramMessage {
  text?: string;
  chat: {
    id: number;
  };
}

interface TelegramCallbackQuery {
  data: string;
  id: string;
  message: {
    chat: {
      id: number;
    };
    message_id: number;
  };
}

interface TelegramUpdateRaw {
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
}

export class TelegramUpdate {
  public readonly raw: TelegramUpdateRaw;
  public readonly message?: TelegramMessage;
  public readonly callbackQuery?: TelegramCallbackQuery;

  constructor(update: TelegramUpdateRaw) {
    this.raw = update;
    this.message = update.message;
    this.callbackQuery = update.callback_query;
  }

  isCommand(command: string): boolean {
    return this.message?.text === command;
  }

  isCallback(): boolean {
    return !!this.callbackQuery;
  }

  getCallbackData(): string | undefined {
    return this.callbackQuery?.data;
  }

  getChatId(): number | null {
    if (this.message) return this.message.chat.id;
    if (this.callbackQuery) return this.callbackQuery.message.chat.id;
    return null;
  }

  getMessageId(): number | undefined {
    return this.callbackQuery?.message?.message_id;
  }

  getCallbackId(): string | undefined {
    return this.callbackQuery?.id;
  }
}
