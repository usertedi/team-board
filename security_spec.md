# Security Specification (Phase 1 — Profiles & Auth)

## 1. Data Invariants
1. Every document ID (`userId`) must match `^[a-zA-Z0-9_\-]+$` and be `<= 128` characters.
2. Public profiles (`/profiles/{userId}`) contain no PII (no email/phone) and can only be created or updated by `request.auth.uid == userId` with `request.auth.token.email_verified == true`.
3. Private user PII (`/users_private/{userId}`) is strictly readable and writable only by `request.auth.uid == userId`.
4. All string fields enforce strict `.size()` bounds from `firebase-blueprint.json`.
5. `createdAt` is immutable on update and must equal `request.time` on creation.

## 2. The "Dirty Dozen" Payloads
1. **Unauthenticated Write**: `auth = null` attempting to create `/profiles/user_1`.
2. **Unverified Email Write**: `auth.token.email_verified = false` attempting to create `/profiles/user_1`.
3. **Identity Spoofing**: `auth.uid = 'attacker'` creating `/profiles/victim` or setting `uid: 'victim'`.
4. **Shadow Field Injection (Create)**: Adding `isAdmin: true` to `/profiles/user_1`.
5. **Shadow Field Injection (Update)**: Updating `/profiles/user_1` with `role: 'owner'`.
6. **Value Poisoning**: Setting `displayName` to a 10,000-character string (`> 80`).
7. **Immortal Field Mutation**: Modifying `createdAt` during an update on `/profiles/user_1`.
8. **Temporal Spoofing**: Providing a past/future client timestamp instead of `request.time`.
9. **Cross-User PII Read**: `auth.uid = 'user_2'` reading `/users_private/user_1`.
10. **Blanket PII List**: `auth.uid = 'user_1'` listing `/users_private`.
11. **ID Poisoning**: Creating a profile with a 500-char or special-char ID.
12. **Delete Profile**: Attempting to delete a profile or private record (`allow delete: if false`).
