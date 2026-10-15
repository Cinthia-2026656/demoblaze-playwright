import { Locator, Page, expect } from '@playwright/test';

/**
 * Page Object for navigation, Sign up, Log in and Log out flows.
 * Selectors verified against the live site (knowledge base sections 4, 12, 13).
 */
export class AuthPage {
  constructor(private readonly page: Page) {}

  get loginLink() {
    return this.page.locator('#login2');
  }
  get signupLink() {
    return this.page.locator('#signin2');
  }
  get logoutLink() {
    return this.page.locator('#logout2');
  }
  get userLabel() {
    return this.page.locator('#nameofuser');
  }
  get loginModal() {
    return this.page.locator('#logInModal');
  }
  get signupModal() {
    return this.page.locator('#signInModal');
  }

  /** Open the storefront and wait for the async product grid to render. */
  async gotoHome(): Promise<void> {
    await this.page.goto('/');
    await this.page.waitForSelector('#tbodyid .card');
  }

  /**
   * Opens a Bootstrap modal, retrying the trigger click. The site can auto-close
   * a modal right after submitting, and Bootstrap ignores a new `show` while the
   * previous modal is still fading out, so a single click is not reliable.
   */
  private async ensureModalOpen(trigger: Locator, field: Locator): Promise<void> {
    if (await field.isVisible().catch(() => false)) return;
    await this.page.locator('.modal.show').first().waitFor({ state: 'hidden' }).catch(() => {});

    for (let attempt = 0; attempt < 3; attempt++) {
      await trigger.click();
      try {
        await field.waitFor({ state: 'visible', timeout: 4000 });
        return;
      } catch {
        await this.page.waitForTimeout(600);
      }
    }
    await field.waitFor({ state: 'visible' });
  }

  async openSignup(): Promise<void> {
    await this.ensureModalOpen(this.signupLink, this.page.locator('#sign-username'));
  }

  async openLogin(): Promise<void> {
    await this.ensureModalOpen(this.loginLink, this.page.locator('#loginusername'));
  }

  async signUp(username: string, password: string): Promise<void> {
    await this.openSignup();
    await this.page.fill('#sign-username', username);
    await this.page.fill('#sign-password', password);
    await this.signupModal.locator('button.btn-primary').click();
  }

  async logIn(username: string, password: string): Promise<void> {
    await this.openLogin();
    await this.page.fill('#loginusername', username);
    await this.page.fill('#loginpassword', password);
    await this.loginModal.locator('button.btn-primary').click();
  }

  async logout(): Promise<void> {
    await this.logoutLink.click();
    await this.loginLink.waitFor({ state: 'visible' });
  }

  async expectLoggedInAs(username: string): Promise<void> {
    await expect(this.userLabel).toContainText(`Welcome ${username}`);
    await expect(this.logoutLink).toBeVisible();
  }
}
