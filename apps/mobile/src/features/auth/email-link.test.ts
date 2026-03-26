import { buildEmailLinkActionSettings } from './email-link';

describe('email link action settings', () => {
  it('builds action code settings for the configured auth domain', () => {
    const settings = buildEmailLinkActionSettings('noor-al-huda-260326.firebaseapp.com');

    expect(settings.handleCodeInApp).toBe(true);
    expect(settings.url).toBe('https://noor-al-huda-260326.firebaseapp.com/auth/email-link');
    expect(settings.android?.packageName).toBe('com.nooralhuda.app');
    expect(settings.iOS?.bundleId).toBe('com.nooralhuda.app');
  });
});
