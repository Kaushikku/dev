-- ============================================================
-- STEP 1: Create Org Profile (replace USER_ID with your user id)
-- ============================================================
INSERT INTO "org_profiles" ("id", "userId", "orgName", "slug", "isVerified", "gameTitles", "socialLinks", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'jhfdjfhkdf',
  'NexusGG Esports',
  'nexusgg-esports',
  true,
  ARRAY['BGMI', 'Valorant', 'CS2'],
  '{}',
  NOW(), NOW()
) ON CONFLICT ("slug") DO NOTHING;

-- ============================================================
-- STEP 2: Create Tournaments (replace GAME_ID and ORG_ID)
-- ============================================================

-- Tournament 1: Free BGMI Open
INSERT INTO "tournaments" (
  "id", "gameId", "orgId", "title", "slug", "description",
  "prizePool", "entryFee", "currency", "format", "status",
  "region", "maxTeams", "registeredTeams",
  "registrationDeadline", "startDate", "endDate",
  "rules", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  '80cd1a8b-023a-465c-bd45-a778195b05e0',
  (SELECT id FROM "org_profiles" WHERE slug = 'nexusgg-esports' LIMIT 1),
  'NexusGG BGMI Open Season 1',
  'nexusgg-bgmi-open-s1',
  'The biggest BGMI tournament on NexusGG. Open to all players across India. Top teams compete for a massive prize pool.',
  50000, 0, 'INR',
  'SINGLE_ELIMINATION', 'REGISTRATION_OPEN',
  'INDIA', 64, 4,
  '2025-05-30 23:59:59',
  '2025-06-01 10:00:00',
  '2025-06-15 20:00:00',
  E'1. All players must be registered on NexusGG.\n2. Team size: 4 players + 1 substitute.\n3. Match format: Best of 3.\n4. No cheats or hacks allowed.\n5. Admins have final say in disputes.',
  NOW(), NOW()
);

-- Tournament 2: Paid Valorant Clash
INSERT INTO "tournaments" (
  "id", "gameId", "orgId", "title", "slug", "description",
  "prizePool", "entryFee", "currency", "format", "status",
  "region", "maxTeams", "registeredTeams",
  "registrationDeadline", "startDate", "endDate",
  "rules", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  '8cf848e5-9cb7-448c-a2d6-3a24be566f88',
  (SELECT id FROM "org_profiles" WHERE slug = 'nexusgg-esports' LIMIT 1),
  'Valorant Clash Series — May 2025',
  'valorant-clash-may-2025',
  'Monthly Valorant tournament for all ranks. Prove your skills and win cash prizes.',
  25000, 100, 'INR',
  'DOUBLE_ELIMINATION', 'REGISTRATION_OPEN',
  'INDIA', 32, 8,
  '2025-06-28 23:59:59',
  '2025-07-01 10:00:00',
  '2025-07-07 20:00:00',
  E'1. All players must be Diamond rank or above.\n2. Team size: 5 players.\n3. Match format: Best of 3 maps.\n4. Entry fee is non-refundable.\n5. Stream sniping will result in disqualification.',
  NOW(), NOW()
);

-- Tournament 3: Live CS2 Championship
INSERT INTO "tournaments" (
  "id", "gameId", "orgId", "title", "slug", "description",
  "prizePool", "entryFee", "currency", "format", "status",
  "region", "maxTeams", "registeredTeams",
  "registrationDeadline", "startDate", "endDate",
  "rules", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  '2900df2c-3116-46fb-90f3-ee46e3794bb9',
  (SELECT id FROM "org_profiles" WHERE slug = 'nexusgg-esports' LIMIT 1),
  'CS2 India Championship 2025',
  'cs2-india-championship-2025',
  'The premier CS2 tournament in India. Elite teams battle for the ultimate prize.',
  100000, 200, 'INR',
  'SWISS', 'ONGOING',
  'INDIA', 16, 16,
  '2025-05-09 23:59:59',
  '2025-05-10 10:00:00',
  '2025-05-20 20:00:00',
  E'1. Professional teams only.\n2. Team size: 5 players + 1 coach.\n3. Match format: Best of 3.\n4. VAC-enabled servers required.',
  NOW(), NOW()
);

-- Tournament 4: Free Fire upcoming
INSERT INTO "tournaments" (
  "id", "gameId", "orgId", "title", "slug", "description",
  "prizePool", "entryFee", "currency", "format", "status",
  "region", "maxTeams", "registeredTeams",
  "registrationDeadline", "startDate", "endDate",
  "rules", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'a1c8e4cb-ee4b-4378-bc5b-6479183ab7c5',
  (SELECT id FROM "org_profiles" WHERE slug = 'nexusgg-esports' LIMIT 1),
  'Free Fire Pro League Season 2',
  'ff-pro-league-s2',
  'India''s top Free Fire squads compete for dominance in this action-packed league.',
  75000, 0, 'INR',
  'ROUND_ROBIN', 'UPCOMING',
  'INDIA', 24, 3,
  '2025-06-18 23:59:59',
  '2025-06-20 10:00:00',
  '2025-06-30 20:00:00',
  E'1. Mobile devices only — no emulators.\n2. Team size: 4 players.\n3. All players must be from India.\n4. Top 2 teams from each group advance.',
  NOW(), NOW()
);

-- ============================================================
-- STEP 3: Add some teams
-- ============================================================
INSERT INTO "teams" ("id", "name", "tag", "gameId", "region", "isActive", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'Team Alpha',    'ALPH', '80cd1a8b-023a-465c-bd45-a778195b05e0',     'INDIA', true, NOW(), NOW()),
  (gen_random_uuid(), 'Storm Rising',  'SR',   '80cd1a8b-023a-465c-bd45-a778195b05e0',     'INDIA', true, NOW(), NOW()),
  (gen_random_uuid(), 'ProGamingIN',   'PGI',  '80cd1a8b-023a-465c-bd45-a778195b05e0',     'INDIA', true, NOW(), NOW()),
  (gen_random_uuid(), 'Clutch Kings',  'CK',   '80cd1a8b-023a-465c-bd45-a778195b05e0',     'INDIA', true, NOW(), NOW()),
  (gen_random_uuid(), 'Nexus Squad',   'NXS',  '8cf848e5-9cb7-448c-a2d6-3a24be566f88', 'INDIA', true, NOW(), NOW()),
  (gen_random_uuid(), 'Phantom Five',  'PH5',  '8cf848e5-9cb7-448c-a2d6-3a24be566f88', 'INDIA', true, NOW(), NOW()),
  (gen_random_uuid(), 'India Fraggers','IFR',  '2900df2c-3116-46fb-90f3-ee46e3794bb9',      'INDIA', true, NOW(), NOW()),
  (gen_random_uuid(), 'Headshot Club', 'HSC',  '2900df2c-3116-46fb-90f3-ee46e3794bb9',      'INDIA', true, NOW(), NOW());

-- ============================================================
-- STEP 4: Register teams to BGMI tournament
-- ============================================================
INSERT INTO "tournament_teams" ("id", "tournamentId", "teamId", "status", "registeredAt")
SELECT
  gen_random_uuid(),
  (SELECT id FROM "tournaments" WHERE slug = 'nexusgg-bgmi-open-s1' LIMIT 1),
  t.id,
  'APPROVED',
  NOW()
FROM "teams" t
WHERE t.name IN ('Team Alpha', 'Storm Rising', 'ProGamingIN', 'Clutch Kings');

-- ============================================================
-- STEP 5: Add bracket matches for BGMI tournament
-- ============================================================
INSERT INTO "tournament_matches" (
  "id", "tournamentId", "round", "matchNumber",
  "team1Id", "team2Id", "winnerId",
  "score", "status", "scheduledAt", "playedAt"
)
SELECT
  gen_random_uuid(),
  (SELECT id FROM "tournaments" WHERE slug = 'nexusgg-bgmi-open-s1' LIMIT 1),
  1, 1,
  (SELECT id FROM "teams" WHERE name = 'Team Alpha' LIMIT 1),
  (SELECT id FROM "teams" WHERE name = 'Storm Rising' LIMIT 1),
  (SELECT id FROM "teams" WHERE name = 'Team Alpha' LIMIT 1),
  '{"team1": 2, "team2": 0}', 'COMPLETED',
  NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days';

INSERT INTO "tournament_matches" (
  "id", "tournamentId", "round", "matchNumber",
  "team1Id", "team2Id", "winnerId",
  "score", "status", "scheduledAt", "playedAt"
)
SELECT
  gen_random_uuid(),
  (SELECT id FROM "tournaments" WHERE slug = 'nexusgg-bgmi-open-s1' LIMIT 1),
  1, 2,
  (SELECT id FROM "teams" WHERE name = 'ProGamingIN' LIMIT 1),
  (SELECT id FROM "teams" WHERE name = 'Clutch Kings' LIMIT 1),
  (SELECT id FROM "teams" WHERE name = 'ProGamingIN' LIMIT 1),
  '{"team1": 2, "team2": 1}', 'COMPLETED',
  NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days';

INSERT INTO "tournament_matches" (
  "id", "tournamentId", "round", "matchNumber",
  "team1Id", "team2Id", "winnerId",
  "score", "status", "scheduledAt"
)
SELECT
  gen_random_uuid(),
  (SELECT id FROM "tournaments" WHERE slug = 'nexusgg-bgmi-open-s1' LIMIT 1),
  2, 1,
  (SELECT id FROM "teams" WHERE name = 'Team Alpha' LIMIT 1),
  (SELECT id FROM "teams" WHERE name = 'ProGamingIN' LIMIT 1),
  NULL,
  '{"team1": 0, "team2": 0}', 'SCHEDULED',
  NOW() + INTERVAL '2 days';