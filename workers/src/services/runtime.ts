export function queueBackgroundTask(context: { executionCtx?: { waitUntil(promise: Promise<unknown>): void } }, promise: Promise<unknown>) {
  try {
    if (context.executionCtx) {
      context.executionCtx.waitUntil(promise);
      return;
    }
  } catch {
    // Fall through to awaited execution in non-worker test environments.
  }

  void promise.catch(() => undefined);
}
