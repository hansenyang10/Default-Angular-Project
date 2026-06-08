import { EntityPatchOperation, PatchPath, PatchValue } from "../../api/definition";


export function createPatchOperations<T extends Record<PatchPath, PatchValue>>(
  originalData: T,
  updatedData: Partial<T>,
): EntityPatchOperation<T>[] {
  const operations: EntityPatchOperation<T>[] = [];

  for (const key in updatedData) {
    if (Object.prototype.hasOwnProperty.call(updatedData, key)) {
      const newValue = updatedData[key];
      const oldValue = originalData[key];

      if (newValue !== oldValue) {
        operations.push({
          op: 'replace',
          path: key as Extract<keyof T, string>,
          value: newValue as T[keyof T]
        });
      }
    }
  }
  return operations;
}