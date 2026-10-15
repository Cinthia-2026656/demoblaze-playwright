import { test as base } from '@playwright/test';
import { DialogRecorder } from './dialogs';
import { AuthPage } from '../pages/AuthPage';

type Fixtures = {
  dialogs: DialogRecorder;
  auth: AuthPage;
};

export const test = base.extend<Fixtures>({
  dialogs: async ({ page }, use) => {
    const recorder = new DialogRecorder();
    recorder.attach(page);
    await use(recorder);
  },
  auth: async ({ page }, use) => {
    await use(new AuthPage(page));
  },
});

export { expect } from '@playwright/test';
