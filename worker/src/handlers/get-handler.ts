import { StorageRepository } from "../infrastructure/storage.js";
import { getItemsStatus } from "../usecases/get-items-status.js";

export async function handleGetRequest(storageRepository: StorageRepository) {
  const status = await getItemsStatus(storageRepository);
  return status;
}
