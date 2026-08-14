-- ============================================
-- Hope Music Community - Supabase Schema
-- Clean rewrite, replacing Convex
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('super_admin', 'operator', 'member')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  is_banned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================
-- POSTS (Community Feed)
-- ============================================
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_email TEXT NOT NULL,
  author_username TEXT NOT NULL,
  author_avatar TEXT DEFAULT '',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  views INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_email);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);

-- ============================================
-- COMMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_email TEXT NOT NULL,
  author_username TEXT NOT NULL,
  author_avatar TEXT DEFAULT '',
  content TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);

-- ============================================
-- STAGE PRODUCTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS stage_productions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  content TEXT DEFAULT '',
  cover_image TEXT DEFAULT '',
  url TEXT DEFAULT '',
  category TEXT NOT NULL,
  subcategory TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'US',
  event_date TIMESTAMPTZ,
  event_time TEXT,
  venue TEXT,
  media_links TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT FALSE,
  is_visible BOOLEAN DEFAULT TRUE,
  ticketmaster_id TEXT,
  ticket_url TEXT,
  price_range TEXT,
  status TEXT DEFAULT 'scheduled',
  country_scope TEXT DEFAULT 'US',
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_productions_category ON stage_productions(category);
CREATE INDEX IF NOT EXISTS idx_productions_date ON stage_productions(event_date DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_productions_ticketmaster ON stage_productions(ticketmaster_id);
CREATE INDEX IF NOT EXISTS idx_productions_visible ON stage_productions(is_visible);

-- ============================================
-- HOPE STUDIO SERVICES
-- ============================================
CREATE TABLE IF NOT EXISTS hope_studio_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  service_name TEXT,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'recording',
  availability TEXT,
  pricing TEXT,
  icon TEXT,
  image_links TEXT[] DEFAULT '{}',
  link TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_published BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_category ON hope_studio_services(category);
CREATE INDEX IF NOT EXISTS idx_services_published ON hope_studio_services(is_published);

-- ============================================
-- NEWS
-- ============================================
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  cover_image TEXT DEFAULT '',
  author TEXT,
  author_name TEXT,
  author_email TEXT,
  publish_date TIMESTAMPTZ,
  excerpt TEXT,
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_published ON news(is_published);
CREATE INDEX IF NOT EXISTS idx_news_featured ON news(is_featured);
CREATE INDEX IF NOT EXISTS idx_news_created ON news(created_at DESC);

-- ============================================
-- INSIGHTS
-- ============================================
CREATE TABLE IF NOT EXISTS insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  cover_image TEXT DEFAULT '',
  category TEXT DEFAULT 'general',
  event_date TIMESTAMPTZ,
  author TEXT,
  author_name TEXT,
  author_email TEXT,
  publish_date TIMESTAMPTZ,
  excerpt TEXT,
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_insights_published ON insights(is_published);
CREATE INDEX IF NOT EXISTS idx_insights_featured ON insights(is_featured);
CREATE INDEX IF NOT EXISTS idx_insights_category ON insights(category);
CREATE INDEX IF NOT EXISTS idx_insights_created ON insights(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Users: readable by all, writable by admins only
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Only super_admin can manage users" ON users
  FOR ALL USING (
    auth.jwt() ->> 'email' IN (
      SELECT email FROM users WHERE role = 'super_admin'
    )
  );

-- Posts: readable by all, comments readable by all
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Posts are viewable by everyone" ON posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON posts
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update posts" ON posts
  FOR UPDATE USING (
    auth.jwt() ->> 'email' IN (
      SELECT email FROM users WHERE role IN ('super_admin', 'operator')
    )
  );

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage comments" ON comments
  FOR UPDATE USING (
    auth.jwt() ->> 'email' IN (
      SELECT email FROM users WHERE role IN ('super_admin', 'operator')
    )
  );

-- Productions: public reads, admin writes
ALTER TABLE stage_productions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Productions viewable by everyone" ON stage_productions FOR SELECT USING (true);
CREATE POLICY "Admins manage productions" ON stage_productions
  FOR ALL USING (
    auth.jwt() ->> 'email' IN (
      SELECT email FROM users WHERE role IN ('super_admin', 'operator')
    )
  );

-- Services: public reads, admin writes
ALTER TABLE hope_studio_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active services viewable by everyone" ON hope_studio_services
  FOR SELECT USING (is_active = TRUE OR true);
CREATE POLICY "Admins manage services" ON hope_studio_services
  FOR ALL USING (
    auth.jwt() ->> 'email' IN (
      SELECT email FROM users WHERE role IN ('super_admin', 'operator')
    )
  );

-- News: public reads for published, admin writes
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published news viewable by everyone" ON news
  FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Admins manage news" ON news
  FOR ALL USING (
    auth.jwt() ->> 'email' IN (
      SELECT email FROM users WHERE role IN ('super_admin', 'operator')
    )
  );

-- Insights: public reads for published, admin writes
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published insights viewable by everyone" ON insights
  FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Admins manage insights" ON insights
  FOR ALL USING (
    auth.jwt() ->> 'email' IN (
      SELECT email FROM users WHERE role IN ('super_admin', 'operator')
    )
  );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_productions_updated_at BEFORE UPDATE ON stage_productions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON hope_studio_services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insights_updated_at BEFORE UPDATE ON insights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DEFAULT ADMIN USER
-- ============================================
INSERT INTO users (email, username, avatar, role, status)
VALUES ('admin@hopemusic.com', 'Administrator', '', 'super_admin', 'active')
ON CONFLICT (email) DO NOTHING;
