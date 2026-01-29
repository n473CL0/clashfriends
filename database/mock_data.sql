-- 1. Insert specific Named Users (for manual testing)
INSERT INTO users (username, player_tag) VALUES
    ('AlphaPlayer', '#ALPHA01'),
    ('BetaTester', '#BETA02'),
    ('CharliePro', '#CHAR03'),
    ('DeltaForce', '#DLTA04'),
    ('EchoBase', '#ECHO05')
ON CONFLICT (player_tag) DO NOTHING;

-- 2. Bulk Insert Matches (2,500 rows)
-- This creates random battles between the 5 users above over the last 90 days.
-- This volume allows you to see the difference 'idx_matches_time' makes.
INSERT INTO matches (
    battle_id,
    player_1_tag,
    player_2_tag,
    winner_tag,
    battle_time,
    game_mode,
    crowns_1,
    crowns_2
)
SELECT
    -- Generate a unique hash for battle_id
    md5(random()::text || clock_timestamp()::text),
    
    -- Pick Random Player 1
    (ARRAY['#ALPHA01', '#BETA02', '#CHAR03', '#DLTA04', '#ECHO05'])[floor(random() * 5 + 1)],
    
    -- Pick Random Player 2
    (ARRAY['#ALPHA01', '#BETA02', '#CHAR03', '#DLTA04', '#ECHO05'])[floor(random() * 5 + 1)],
    
    -- Random Winner (or null for draw)
    (ARRAY['#ALPHA01', '#BETA02', '#CHAR03', '#DLTA04', '#ECHO05', NULL])[floor(random() * 6 + 1)],
    
    -- Random Time in the last 90 days (Tests idx_matches_time)
    NOW() - (random() * (INTERVAL '90 days')),
    
    -- Random Game Mode
    (ARRAY['Ladder', 'GrandChallenge', 'Friendly', '2v2'])[floor(random() * 4 + 1)],
    
    -- Random Crowns
    floor(random() * 4),
    floor(random() * 4)
FROM generate_series(1, 2500);

-- 3. Create Friendships
-- Make AlphaPlayer friends with everyone (Tests idx_friendships_user_2)
INSERT INTO friendships (user_id_1, user_id_2)
SELECT 
    (SELECT id FROM users WHERE player_tag = '#ALPHA01'),
    id 
FROM users 
WHERE player_tag != '#ALPHA01'
ON CONFLICT DO NOTHING;