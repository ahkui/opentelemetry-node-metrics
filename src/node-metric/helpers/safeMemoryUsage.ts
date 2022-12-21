export function safeMemoryUsage() {
  try {
    return process.memoryUsage();
  } catch {}
}
