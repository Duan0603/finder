DO $$
DECLARE
  -- Thay email1 bằng email bạn thường dùng
  email1 TEXT := 'hoang@gmail.com'; 
  -- Thay email2 bằng email clone bạn vừa đăng ký
  email2 TEXT := 'clone@gmail.com'; 
  
  uid1 UUID;
  uid2 UUID;
  mid UUID := gen_random_uuid();
BEGIN
  -- Tìm User bằng Email
  SELECT id INTO uid1 FROM auth.users WHERE email = email1 COLLATE "default";
  SELECT id INTO uid2 FROM auth.users WHERE email = email2 COLLATE "default";
  
  IF uid1 IS NULL OR uid2 IS NULL THEN
    RAISE EXCEPTION 'Bạn chưa đăng ký 1 trong 2 email trên. Mở trang web đăng ký nick trước nhé!';
  END IF;

  -- 1. Tạo Match giữa 2 người (NẾU CHƯA CÓ)
  INSERT INTO public.matches (id, user1, user2)
  VALUES (mid, uid1, uid2)
  ON CONFLICT DO NOTHING;

  -- Nếu đã có Match cũ thì lấy cái cũ ra để gắn Pet, nếu chưa thì lấy cái mới tạo
  SELECT id INTO mid FROM public.matches 
  WHERE (user1 = uid1 AND user2 = uid2) OR (user1 = uid2 AND user2 = uid1)
  LIMIT 1;

  -- Cập nhật tên xíu cho đẹp
  UPDATE public.profiles SET name = 'Hot Boy 15 Day' WHERE id = uid1;
  UPDATE public.profiles SET name = 'Hot Girl 15 Day' WHERE id = uid2;

  -- 2. Gửi 1 tin nhắn mồi (Trigger sẽ tạo bảng Pet)
  INSERT INTO public.messages (match_id, sender_id, content)
  VALUES (mid, uid1, 'Chào bạn mới! Tụi mình được Streak Lửa Xanh rồi 🥳')
  ON CONFLICT DO NOTHING;

  -- 3. Cập nhật thẳng chỉ số Pet lên 15 Ngày (Lửa Xanh, Level 2)
  UPDATE public.match_pets
  SET 
    streak_count = 15,
    level = 2,
    happiness_score = 90,
    last_chat_date = (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE,
    pet_shape = 'cat'
  WHERE match_id = mid;

END $$;
