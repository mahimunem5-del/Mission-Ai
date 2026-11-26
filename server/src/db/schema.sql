-- Supabase Database Schema for Mestrio AI Platform
-- Conversations Table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    model_id TEXT NOT NULL DEFAULT 'mahi-engine',
    mode TEXT NOT NULL DEFAULT 'chat',
    project_id TEXT DEFAULT NULL,
    user_id UUID DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL DEFAULT '',
    type TEXT NOT NULL DEFAULT 'text',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_project_id ON conversations(project_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at ASC);

-- Row-Level Security (RLS)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
CREATE POLICY "Users can view own conversations"
    ON conversations FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own conversations" ON conversations;
CREATE POLICY "Users can insert own conversations"
    ON conversations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;
CREATE POLICY "Users can update own conversations"
    ON conversations FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own conversations" ON conversations;
CREATE POLICY "Users can delete own conversations"
    ON conversations FOR DELETE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view messages in own conversations" ON messages;
CREATE POLICY "Users can view messages in own conversations"
    ON messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = messages.conversation_id AND c.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert messages in own conversations" ON messages;
CREATE POLICY "Users can insert messages in own conversations"
    ON messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = messages.conversation_id AND c.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete messages in own conversations" ON messages;
CREATE POLICY "Users can delete messages in own conversations"
    ON messages FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = messages.conversation_id AND c.user_id = auth.uid()
        )
    );
