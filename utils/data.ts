/** Shared test data for the DemoBlaze suite. See knowledge base section 23. */

export const PASSWORD = 'Passw0rd!';

/** Stable, unique username per invocation so specs are parallel-safe. */
export function makeUser(prefix = 'qa'): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10_000)}`;
}
