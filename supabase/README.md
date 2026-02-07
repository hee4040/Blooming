# Supabase 스키마 — Blooming You

PRD 기반 데이터베이스 구조입니다.

## 테이블

### seeds (보내는 사람)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | 공유 링크의 seedId |
| day_type | day_type | anniversary / birthday / cheer / today |
| message | VARCHAR(50) | 전하고 싶은 말 |
| mood | mood_type | warm / exciting / calm / supportive |
| created_at | TIMESTAMPTZ | 생성 시각 |

### blooms (받는 사람)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| seed_id | UUID (PK, FK) | seeds.id |
| colors | bloom_color[] | 2개 이상 (pink, peach, lavender, mint, cream, coral) |
| message | TEXT | 받는 사람 메시지 |
| feeling | feeling_type | happy / calm / excited / supportive |
| created_at | TIMESTAMPTZ | 생성 시각 |

## 관계

```
seeds (1) ←——— (1) blooms
```

- 한 Seed당 Bloom 하나
- bloom이 없으면 아직 받는 사람이 완성하지 않은 상태

## 마이그레이션 적용

1. Supabase Dashboard → SQL Editor에서 `001_initial_schema.sql` 실행
2. `002_blooms_upsert_policy.sql` 실행 (blooms upsert용 UPDATE 정책)

또는 Supabase CLI:

```bash
supabase db push
```
