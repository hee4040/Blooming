-- Blooming You - Supabase 초기 스키마
-- PRD 기준: Seed(보내는 사람) → Bloom(받는 사람) → 디지털 기념 꽃

-- =============================================================================
-- 1. ENUM 타입 (PRD 5.2, 5.3 입력값과 일치)
-- =============================================================================

CREATE TYPE day_type AS ENUM ('anniversary', 'birthday', 'cheer', 'today');
-- 기념일, 생일, 응원의 날, 그냥 오늘

CREATE TYPE mood_type AS ENUM ('warm', 'exciting', 'calm', 'supportive');
-- 따뜻한, 설레는, 차분한, 응원하는

CREATE TYPE bloom_color AS ENUM ('pink', 'peach', 'lavender', 'mint', 'cream', 'coral');
-- 연한 핑크, 복숭아, 라벤더, 민트, 크림, 코랄

CREATE TYPE feeling_type AS ENUM ('happy', 'calm', 'excited', 'supportive');
-- 행복, 평온, 설렘, 응원

-- =============================================================================
-- 2. seeds 테이블 (보내는 사람 - 꽃의 의미)
-- =============================================================================

CREATE TABLE seeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_type day_type NOT NULL,
  message VARCHAR(50) NOT NULL DEFAULT '',
  mood mood_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE seeds IS '보내는 사람이 생성. 꽃의 의미적 기반 (어떤 날, 전할 말, 분위기)';
COMMENT ON COLUMN seeds.day_type IS '어떤 날인가요: anniversary, birthday, cheer, today';
COMMENT ON COLUMN seeds.message IS '전하고 싶은 말 (최대 50자)';
COMMENT ON COLUMN seeds.mood IS '꽃의 분위기: warm, exciting, calm, supportive';

-- =============================================================================
-- 3. blooms 테이블 (받는 사람 - 꽃의 모습)
-- =============================================================================

CREATE TABLE blooms (
  seed_id UUID PRIMARY KEY REFERENCES seeds(id) ON DELETE CASCADE,
  colors bloom_color[] NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  feeling feeling_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT blooms_colors_min_length CHECK (array_length(colors, 1) >= 2)
);

COMMENT ON TABLE blooms IS '받는 사람이 생성. 꽃의 시각적 완성 (색상 2개 이상, 메시지, 기분)';
COMMENT ON COLUMN blooms.colors IS '꽃 색상 (2개 이상): pink, peach, lavender, mint, cream, coral';
COMMENT ON COLUMN blooms.message IS '받는 사람이 적은 메시지';
COMMENT ON COLUMN blooms.feeling IS '지금 이 꽃의 기분: happy, calm, excited, supportive';

-- =============================================================================
-- 4. 인덱스
-- =============================================================================

CREATE INDEX idx_seeds_created_at ON seeds(created_at DESC);
CREATE INDEX idx_blooms_created_at ON blooms(created_at DESC);

-- =============================================================================
-- 5. RLS (Row Level Security) - 필요 시 활성화
-- =============================================================================

ALTER TABLE seeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE blooms ENABLE ROW LEVEL SECURITY;

-- 공개 읽기: seedId로 조회 가능 (공유 링크 접근용)
CREATE POLICY "seeds_select_public" ON seeds
  FOR SELECT USING (true);

-- 공개 삽입: 누구나 seed 생성 가능 (보내는 사람)
CREATE POLICY "seeds_insert_public" ON seeds
  FOR INSERT WITH CHECK (true);

-- blooms: seed_id 존재 시 조회/삽입
CREATE POLICY "blooms_select_public" ON blooms
  FOR SELECT USING (true);

CREATE POLICY "blooms_insert_public" ON blooms
  FOR INSERT WITH CHECK (true);
