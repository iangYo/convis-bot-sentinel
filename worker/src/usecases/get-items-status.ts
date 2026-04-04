import { StorageRepository } from "../infrastructure/storage.js";

export async function getItemsStatus(storageRepository: StorageRepository) {
  const itemStatus = await storageRepository.getItemStatus();
  return itemStatus.toJSON();
}
