-- Mestrio AI — Non-Destructive Target Database Schema Migration (001_clean_schema.sql)
-- Safe to run on Supabase PostgreSQL: uses CREATE TABLE IF NOT EXISTS, preserves all existing tables and data.
-- Do NOT run DROP TABLE or destructive ALTER statements.

-- 1. User Profiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    preferred_language TEXT DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Conversations (Already exists in live DB; preserved)
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL DEFAULT 'New Chat',
    model_id TEXT NOT NULL DEFAULT 'mahi-engine',
    mode TEXT NOT NULL DEFAULT 'chat',
    project_id TEXT DEFAULT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Messages (Already exists in live DB; preserved)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL DEFAULT '',
    type TEXT NOT NULL DEFAULT 'text',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Structured Message Content Parts (text, image, tool_call, tool_result, file, sources)
CREATE TABLE IF NOT EXISTS message_parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    part_index INTEGER NOT NULL DEFAULT 0,
    part_type TEXT NOT NULL CHECK (part_type IN ('text', 'image', 'tool_call', 'tool_result', 'file', 'sources')),
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. File & Image Attachments
CREATE TABLE IF NOT EXISTS attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    file_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL DEFAULT 0,
    storage_path TEXT,
    public_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Model Usage & Token Telemetry (NULLable tokens/cost: never invented if provider omits them)
CREATE TABLE IF NOT EXISTS model_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    request_id TEXT,
    provider TEXT NOT NULL,
    requested_model TEXT,
    resolved_model TEXT NOT NULL,
    mode TEXT NOT NULL DEFAULT 'chat',
    input_tokens INTEGER DEFAULT NULL,
    output_tokens INTEGER DEFAULT NULL,
    total_tokens INTEGER DEFAULT NULL,
    api_cost_usd NUMERIC(12, 8) DEFAULT NULL,
    duration_ms INTEGER NOT NULL DEFAULT 0,
    cache_hit BOOLEAN NOT NULL DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'success',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Subscriptions (Read-only to users via RLS; mutated server-side only)
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_tier TEXT NOT NULL DEFAULT 'free' CHECK (plan_tier IN ('free', 'pro', 'max', 'enterprise')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
    provider_customer_id TEXT,
    provider_subscription_id TEXT,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Credit Transactions (Read-only to users via RLS; mutated server-side only)
CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    balance_after INTEGER,
    reason TEXT NOT NULL,
    reference_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Image Templates (Already exists in live DB; preserved)
CREATE TABLE IF NOT EXISTS image_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Portrait & Photo',
    prompt TEXT NOT NULL,
    image_url TEXT DEFAULT '',
    storage_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user_created ON conversations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_message_parts_message_idx ON message_parts(message_id, part_index ASC);
CREATE INDEX IF NOT EXISTS idx_attachments_user_conv ON attachments(user_id, conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_model_usage_user_created ON model_usage(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_model_usage_conv ON model_usage(conversation_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_tx_user_created ON credit_transactions(user_id, created_at DESC);

-- Enable Row-Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Profiles (owner read/insert/update)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- RLS Policies: Conversations (owner full CRUD)
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
CREATE POLICY "Users can view own conversations" ON conversations FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own conversations" ON conversations;
CREATE POLICY "Users can insert own conversations" ON conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;
CREATE POLICY "Users can update own conversations" ON conversations FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own conversations" ON conversations;
CREATE POLICY "Users can delete own conversations" ON conversations FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies: Messages (owner via parent conversation)
DROP POLICY IF EXISTS "Users can view messages in own conversations" ON messages;
CREATE POLICY "Users can view messages in own conversations" ON messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND c.user_id = auth.uid())
);
DROP POLICY IF EXISTS "Users can insert messages in own conversations" ON messages;
CREATE POLICY "Users can insert messages in own conversations" ON messages FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND c.user_id = auth.uid())
);
DROP POLICY IF EXISTS "Users can delete messages in own conversations" ON messages;
CREATE POLICY "Users can delete messages in own conversations" ON messages FOR DELETE USING (
    EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND c.user_id = auth.uid())
);

-- RLS Policies: Message Parts (owner via parent message -> conversation)
DROP POLICY IF EXISTS "Users can view own message parts" ON message_parts;
CREATE POLICY "Users can view own message parts" ON message_parts FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM messages m
        JOIN conversations c ON c.id = m.conversation_id
        WHERE m.id = message_parts.message_id AND c.user_id = auth.uid()
    )
);
DROP POLICY IF EXISTS "Users can insert own message parts" ON message_parts;
CREATE POLICY "Users can insert own message parts" ON message_parts FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM messages m
        JOIN conversations c ON c.id = m.conversation_id
        WHERE m.id = message_parts.message_id AND c.user_id = auth.uid()
    )
);

-- RLS Policies: Attachments (owner full CRUD)
DROP POLICY IF EXISTS "Users can manage own attachments" ON attachments;
CREATE POLICY "Users can manage own attachments" ON attachments FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS Policies: Usage & Billing (SELECT only for owner; writes restricted to server service_role)
DROP POLICY IF EXISTS "Users can view own model usage" ON model_usage;
CREATE POLICY "Users can view own model usage" ON model_usage FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own credit transactions" ON credit_transactions;
CREATE POLICY "Users can view own credit transactions" ON credit_transactions FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies: Image Templates (public read; writes restricted to server service_role)
DROP POLICY IF EXISTS "Public can view image templates" ON image_templates;
CREATE POLICY "Public can view image templates" ON image_templates FOR SELECT USING (true);
