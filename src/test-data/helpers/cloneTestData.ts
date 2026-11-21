export function cloneTestData<T>(value: T): T {
  return structuredClone(value);
}
