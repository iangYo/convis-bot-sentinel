import { MESSAGES } from "./config/constants.js";
import { handleGetRequest } from "./handlers/get-handler.js";
import { handlePostRequest } from "./handlers/post-handler.js";
import { StorageRepository } from "./infrastructure/storage.js";
import { TelegramClient } from "./infrastructure/telegram.js";

interface Env {
  TELEGRAM_BOT_TOKEN: string;
  CONVIS_BOT_SENTINEL: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const telegramClient = new TelegramClient(env.TELEGRAM_BOT_TOKEN);
    const storageRepository = new StorageRepository(env.CONVIS_BOT_SENTINEL);

    try {
      if (request.method === "POST") {
        const update = await request.json();
        await handlePostRequest(telegramClient, storageRepository, update);
        return new Response("OK", { status: 200 });
      }

      if (request.method === "GET") {
        const status = await handleGetRequest(storageRepository);
        return new Response(JSON.stringify(status), {
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(MESSAGES.ACCESS_DENIED, { status: 403 });
    } catch (error) {
      console.error("Error processing request:", error);
      return new Response(MESSAGES.INTERNAL_ERROR, { status: 500 });
    }
  },
};
