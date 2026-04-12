export const COMMANDS = {
  MENU: "/menu",
  NEXT_VISIT: "/proxima_visita",
} as const;

export const CALLBACK_ACTIONS = {
  TOGGLE_FOOD: "TOGGLE_FOOD",
  TOGGLE_HYGIENE: "TOGGLE_HYGIENE",
  TOGGLE_BAG: "TOGGLE_BAG",
} as const;

export const STORAGE_KEYS = {
  FOOD: "food",
  HYGIENE: "hygiene",
  BAG: "bag",
  NOTIFICATION_DATE: "DATA_NOTIFICACAO_BOTAO_ATIVO",
} as const;

export const ITEM_LABELS = {
  FOOD: "Comida",
  HYGIENE: "Higiene",
  BAG: "Sacola",
} as const;

export const MESSAGES = {
  CONTROL_PANEL:
    `🎛️ **PAINEL DE CONTROLE**\n\n` +
    `Aqui está como o robô está configurado neste exato momento.\n\n` +
    `**Legenda:**\n` +
    `👇 *Toque nos botões abaixo para ligar ou desligar as opções:*`,
  ACCESS_DENIED: "Acesso negado.",
  INTERNAL_ERROR: "Erro interno",
} as const;

export const EMOJIS = {
  ENABLED: "✅",
  DISABLED: "❌",
} as const;
