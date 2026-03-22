DO $$
DECLARE
  uid1 UUID := '11111111-1111-4111-8111-111111111111'::uuid;
  uid2 UUID := '22222222-2222-4222-8222-222222222222'::uuid;
  mid UUID := '33333333-3333-4333-8333-333333333333'::uuid;
BEGIN
  -- 1. Create fake users in auth.users (Tạo 2 tài khoản mới)
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES 
    (uid1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'streak1@finder.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Boy 15 Ngày"}', now(), now()),
    (uid2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'streak2@finder.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Girl 15 Ngày"}', now(), now())
  ON CONFLICT (id) DO NOTHING;

  -- 2. Create or update profiles (Tạo profile cho 2 bạn này)
  INSERT INTO public.profiles (id, name, bio, is_verified, is_online, gender, gender_preference, age)
  VALUES 
    (uid1, 'Boy 15 Ngày', 'Tài khoản test streak 15 ngày 🔥', true, true, 'male', 'female', 20),
    (uid2, 'Girl 15 Ngày', 'Tài khoản test streak 15 ngày 🔥', true, true, 'female', 'male', 20)
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio;

  -- 3. Create match relationship (Tạo Match giữa 2 người)
  INSERT INTO public.matches (id, user1, user2)
  VALUES (mid, uid1, uid2)
  ON CONFLICT (id) DO NOTHING;

  -- 4. Send initial message to trigger Pet Widget creation
  -- (Gửi 1 tin nhắn để Trigger tạo thú cưng đầu tiên)
  INSERT INTO public.messages (match_id, sender_id, content)
  VALUES (mid, uid1, 'Chào bạn! Mình chat được 15 ngày rồi đó 🥳');

  -- 5. Hardcode the Match Pet data to simulate 15-day streak
  -- (Cập nhật trực tiếp số ngày Streak lên 15)
  UPDATE public.match_pets
  SET 
    streak_count = 15,         -- Chuỗi 15 ngày (Lửa Xanh)
    level = 2,                 -- Đạt level 2 (Có đặc quyền)
    happiness_score = 90,      -- Hạnh phúc cao
    last_chat_date = (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE, -- Cài ngày nhắn gần nhất là hôm nay
    pet_shape = 'cat'          -- Cho hình dạng linh vật là mèo
  WHERE match_id = mid;

END $$;
