import { test, expect } from '../fixtures/test';
import { makeUser, PASSWORD } from '../utils/data';

test.describe('Authentication', () => {
  test('sign up with a new user succeeds', async ({ auth, dialogs }) => {
    await auth.gotoHome();
    await auth.signUp(makeUser(), PASSWORD);
    await expect.poll(() => dialogs.last()).toBe('Sign up successful.');
  });

  test('sign up with a duplicate username is rejected', async ({ auth, dialogs }) => {
    const user = makeUser();
    await auth.gotoHome();

    await auth.signUp(user, PASSWORD);
    await expect.poll(() => dialogs.last()).toBe('Sign up successful.');

    await auth.signUp(user, PASSWORD);
    await expect.poll(() => dialogs.last()).toBe('This user already exist.');
  });

  test('log in with an unknown user is rejected', async ({ auth, dialogs }) => {
    await auth.gotoHome();
    await auth.logIn(makeUser('nouser'), PASSWORD);
    await expect.poll(() => dialogs.last()).toBe('User does not exist.');
  });

  test('log in with a wrong password is rejected', async ({ auth, dialogs }) => {
    const user = makeUser();
    await auth.gotoHome();

    await auth.signUp(user, PASSWORD);
    await expect.poll(() => dialogs.last()).toBe('Sign up successful.');

    await auth.logIn(user, 'WrongPass123');
    await expect.poll(() => dialogs.last()).toBe('Wrong password.');
  });

  test('log in with valid credentials shows the user and no dialog', async ({ auth, dialogs }) => {
    const user = makeUser();
    await auth.gotoHome();

    await auth.signUp(user, PASSWORD);
    await expect.poll(() => dialogs.last()).toBe('Sign up successful.');
    const dialogCountBeforeLogin = dialogs.count;

    await auth.logIn(user, PASSWORD);
    await auth.expectLoggedInAs(user);

    await expect(auth.loginLink).toBeHidden();
    await expect(auth.signupLink).toBeHidden();
    await expect(auth.logoutLink).toBeVisible();
    expect(dialogs.count).toBe(dialogCountBeforeLogin);
  });

  test('logout returns to the logged-out state', async ({ auth, dialogs }) => {
    const user = makeUser();
    await auth.gotoHome();

    await auth.signUp(user, PASSWORD);
    await expect.poll(() => dialogs.last()).toBe('Sign up successful.');
    await auth.logIn(user, PASSWORD);
    await auth.expectLoggedInAs(user);

    await auth.logout();

    await expect(auth.loginLink).toBeVisible();
    await expect(auth.signupLink).toBeVisible();
    await expect(auth.logoutLink).toBeHidden();
    await expect(auth.userLabel).toBeHidden();
  });
});
