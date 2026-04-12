import { MESSAGES } from "./config/constants.js";
import { handleGetRequest } from "./handlers/get-handler.js";
import { handlePostRequest } from "./handlers/post-handler.js";
import { handleSentinelCheck } from "./handlers/sentinel-handler.js";
import { handleVisitCheck } from "./handlers/visit-handler.js";
import { StorageRepository } from "./infrastructure/storage.js";
import { TelegramClient } from "./infrastructure/telegram.js";

const VISIT_CHECKER_CRON = "0 19 * * 5";

interface Env {
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
  BASE_URL: string;
  LOGIN_CPF: string;
  LOGIN_CARTEIRINHA: string;
  TARGET_SECTOR: string;
  TARGET_CELL: string;
  CONVIS_BOT_SENTINEL: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const telegramClient = new TelegramClient(env.TELEGRAM_BOT_TOKEN);
    const storageRepository = new StorageRepository(env.CONVIS_BOT_SENTINEL);

    try {
      if (request.method === "POST") {
        const update = await request.json();
        await handlePostRequest(telegramClient, storageRepository, update, {
          baseUrl: env.BASE_URL,
          targetSector: env.TARGET_SECTOR,
          targetCell: env.TARGET_CELL,
        });
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

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    const telegramClient = new TelegramClient(env.TELEGRAM_BOT_TOKEN);

    if (event.cron === VISIT_CHECKER_CRON) {
      ctx.waitUntil(
        handleVisitCheck(
          { baseUrl: env.BASE_URL, targetSector: env.TARGET_SECTOR, targetCell: env.TARGET_CELL },
          telegramClient,
          parseInt(env.TELEGRAM_CHAT_ID)
        )
      );
      return;
    }

    const storageRepository = new StorageRepository(env.CONVIS_BOT_SENTINEL);
    const credentials = {
      cpf: env.LOGIN_CPF,
      cardNumber: env.LOGIN_CARTEIRINHA,
    };

    ctx.waitUntil(
      handleSentinelCheck(env.BASE_URL, credentials, telegramClient, env.TELEGRAM_CHAT_ID, storageRepository),
    );
  },
};
