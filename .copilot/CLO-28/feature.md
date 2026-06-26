# CLO-28: Better Auth: 2FA, passkeys, magic links

## Overview

Extend better-auth with TOTP 2FA, passkeys (WebAuthn), and magic link plugins. Configure backup codes for 2FA recovery.

## Acceptance Criteria

- [ ] Enable twoFactor (TOTP) plugin with backup codes
- [ ] Enable passkey (WebAuthn) plugin
- [ ] Enable magicLink plugin
- [ ] Update auth.ts with all three plugins
- [ ] Unit tests for plugin configuration
