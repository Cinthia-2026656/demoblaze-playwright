import { Page } from '@playwright/test';

/**
 * Records native window.alert()/confirm() dialogs and auto-accepts them so tests
 * never hang. See knowledge base sections 18 and 20.2.
 */
export class DialogRecorder {
  readonly messages: string[] = [];
  private consumed = 0;
  private readonly waiters: Array<(message: string) => void> = [];

  attach(page: Page): void {
    page.on('dialog', async (dialog) => {
      const message = dialog.message();
      await dialog.accept();
      this.messages.push(message);
      const waiter = this.waiters.shift();
      if (waiter) waiter(message);
    });
  }

  /** Most recent dialog message, or undefined if none captured yet. */
  last(): string | undefined {
    return this.messages.at(-1);
  }

  /** Number of dialogs captured. */
  get count(): number {
    return this.messages.length;
  }

  /** Resolves with the next unconsumed dialog message, or rejects after `timeout` ms. */
  async next(timeout = 8000): Promise<string> {
    if (this.consumed < this.messages.length) {
      return this.messages[this.consumed++];
    }
    const message = await new Promise<string>((resolve, reject) => {
      const handler = (m: string) => {
        clearTimeout(timer);
        resolve(m);
      };
      const timer = setTimeout(() => {
        const i = this.waiters.indexOf(handler);
        if (i >= 0) this.waiters.splice(i, 1);
        reject(new Error(`No dialog appeared within ${timeout}ms`));
      }, timeout);
      this.waiters.push(handler);
    });
    this.consumed++;
    return message;
  }
}
