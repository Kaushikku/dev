INSERT INTO "games" ("id", "name", "slug", "platform", "genre", "themeColor", "accentColor", "isActive", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'Valorant',       'valorant',  'PC',      'FPS',            '#ff4655', '#ece8e1', true, NOW(), NOW()),
  (gen_random_uuid(), 'BGMI',           'bgmi',      'MOBILE',  'BATTLE_ROYALE',  '#8fbc5a', '#4a5c3a', true, NOW(), NOW()),
  (gen_random_uuid(), 'CS2',            'cs2',       'PC',      'FPS',            '#f0a500', '#e8e8e8', true, NOW(), NOW()),
  (gen_random_uuid(), 'Free Fire',      'freefire',  'MOBILE',  'BATTLE_ROYALE',  '#e74c3c', '#f39c12', true, NOW(), NOW()),
  (gen_random_uuid(), 'Honor of Kings', 'hok',       'MOBILE',  'MOBA',           '#9b59b6', '#f1c40f', true, NOW(), NOW()),
  (gen_random_uuid(), 'COD Mobile',     'codmobile', 'MOBILE',  'FPS',            '#3498db', '#ecf0f1', true, NOW(), NOW()),
  (gen_random_uuid(), 'Apex Legends',   'apex',      'PC',      'BATTLE_ROYALE',  '#cd3333', '#e0e0e0', true, NOW(), NOW());