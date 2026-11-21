# Security Specification — Whisker Friendship Gift (`firestore.rules`)

## 1. Data Invariants

1. **Unique Gift Ownership**: Every document in `/gifts/{giftId}` MUST have a valid `ownerId` strictly equal to `request.auth.uid` on creation, and `ownerId` + `createdAt` are permanently immutable after creation.
2. **Verified Creator Writes**: Only authenticated users with `request.auth.token.email_verified == true` may create, update, delete, or list their own `/gifts/{giftId}` documents.
3. **Read-Only Shared Link Access**: Anyone with the exact high-entropy `giftId` may `get` `/gifts/{giftId}` to view the friendship experience without signing in. Blanket `list` is strictly forbidden: `allow list` is restricted to `isVerifiedUser() && resource.data.ownerId == request.auth.uid`.
4. **Zero Shadow Fields**: Document keys MUST match the exact allowlist defined in `firebase-blueprint.json` on create, and updates MUST use `affectedKeys().hasOnly(...)` excluding immutable fields (`ownerId`, `createdAt`).
5. **Strict Volumetric & Type Boundaries**: Every string field enforces exact `maxLength` bounds from `firebase-blueprint.json`. `photos` MUST be a 6-element list where every index (`0..5`) passes strict map validation (`id`, `src <= 130000`, `caption <= 200`, `dateNote <= 120`, `memoryNote <= 600`).
6. **Temporal Integrity**: `createdAt == request.time` on create; `updatedAt == request.time` on both create and update.
7. **ID Poisoning Guard**: Every single-document operation (`get`, `create`, `update`, `delete`) validates `isValidId(giftId)` (`size() <= 128` and `^[a-zA-Z0-9_\-]+$`).
8. **Zero PII Exposure**: No email addresses, phone numbers, or private user PII are stored in `/gifts/{giftId}`.

## 2. The "Dirty Dozen" Attack Payloads (All Must Return `PERMISSION_DENIED`)

1. **Unauthenticated Create**: Creating `/gifts/wsk-abc123456789` with `auth == null`.
2. **Unverified Email Create**: Creating `/gifts/wsk-abc123456789` with `auth.uid == 'userA'` and `email_verified == false`.
3. **Identity Spoofing on Create**: Creating `/gifts/wsk-abc123456789` as `userA` while setting `ownerId: 'userB'`.
4. **Cross-User Update Hijack**: Updating `/gifts/wsk-abc123456789` (owned by `userA`) while authenticated as `userB`.
5. **Immutable Owner Transfer**: `userA` attempting to update `ownerId` to `'userB'` on their own gift.
6. **Immutable Timestamp Backdating**: `userA` creating or updating a gift with a client-fabricated `createdAt` or `updatedAt` instead of `request.time`.
7. **Shadow / Ghost Field Injection**: `userA` creating or updating a gift with an extra undeclared field `isAdmin: true` or `isFeatured: true`.
8. **Path ID Poisoning**: Creating or reading `/gifts/bad..id$with!spaces` or an ID exceeding 128 characters.
9. **Resource Exhaustion (Oversized String)**: Setting `openingLetter` to a 5,000-character string (exceeding `maxLength: 2000`) or a photo `src` exceeding 130,000 characters.
10. **Array Length / Element Poisoning**: Submitting `photos` with 7 elements, 0 elements, or an invalid element at index `3` containing `{ src: 12345 }` or extra shadow keys.
11. **Unauthorized Collection Scraping (`list`)**: Unauthenticated client or `userB` attempting to `list` all `/gifts` without scoping to `ownerId == request.auth.uid`.
12. **Unprotected Catch-All Collection Write**: Writing to an undeclared collection `/adminSettings/config` or `/gifts/wsk-123/secret/doc`.
