import { STORAGE_KEYS } from "../config/constants.js";
import { ItemStatus } from "../domain/models.js";

export class StorageRepository {
  constructor(private readonly kv: KVNamespace) {}

  async getItemStatus(): Promise<ItemStatus> {
    const [food, hygiene, bag] = await Promise.all([
      this.kv.get(STORAGE_KEYS.FOOD),
      this.kv.get(STORAGE_KEYS.HYGIENE),
      this.kv.get(STORAGE_KEYS.BAG),
    ]);

    return ItemStatus.fromStorage(
      food || "false",
      hygiene || "false",
      bag || "false"
    );
  }

  async toggleItem(key: string): Promise<boolean> {
    const current = (await this.kv.get(key)) || "false";
    const newValue = current === "true" ? "false" : "true";
    await this.kv.put(key, newValue);
    return newValue === "true";
  }

  async get(key: string): Promise<string | null> {
    return await this.kv.get(key);
  }

  async put(key: string, value: string): Promise<void> {
    await this.kv.put(key, value);
  }
}
