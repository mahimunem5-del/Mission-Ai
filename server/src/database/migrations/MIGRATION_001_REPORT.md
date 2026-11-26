# Migration 001 Safety & Impact Report (`001_clean_schema.sql`)

## 1. Migration Impact Report
- **Existing Tables Untouched**: `conversations`, `messages`, `image_templates` use `CREATE TABLE IF NOT EXISTS` with zero `DROP`, `TRUNCATE`, or destructive `ALTER` statements.
- **New Tables Added**: `profiles`, `message_parts`, `attachments`, `model_usage`, `subscriptions`, `credit_transactions`.
- **Indexes Added**: Composite indexes on `(user_id, created_at DESC)`, `(conversation_id, created_at ASC)`, `(message_id, part_index ASC)` using `CREATE INDEX IF NOT EXISTS`.

## 2. Existing-Data Preservation Report
- All existing rows in `conversations`, `messages`, and `image_templates` are preserved intact.
- Foreign keys on new tables (`message_parts.message_id -> messages.id`, `attachments.conversation_id -> conversations.id`, `model_usage.conversation_id -> conversations.id`) only reference existing primary keys and do not modify existing rows.

## 3. RLS Policy Report
- **Profiles**: Users can `SELECT`, `INSERT`, and `UPDATE` only where `auth.uid() = id`.
- **Conversations & Messages & Message Parts**: Users can access only records owned by `auth.uid()` via `conversations.user_id`.
- **Attachments**: Users can `SELECT`, `INSERT`, `UPDATE`, `DELETE` only where `auth.uid() = user_id`.
- **Usage & Billing (`model_usage`, `subscriptions`, `credit_transactions`)**: Users have **`SELECT` ONLY** (`auth.uid() = user_id`). `INSERT`, `UPDATE`, and `DELETE` are denied to client JWTs and restricted exclusively to the backend `service_role` key.
- **Image Templates**: Public `SELECT` only (`USING (true)`); writes restricted to backend `service_role` behind `requireAuth`.

## 4. Rollback Considerations
Because this migration is strictly additive (`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, and idempotent `DROP POLICY IF EXISTS` + `CREATE POLICY`), rolling back only requires dropping the 6 newly created tables if desired, with zero impact on `conversations`, `messages`, or `image_templates`.
