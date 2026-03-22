DO $$
BEGIN
  -- Xoá 2 tài khoản Auth bị lỗi do script cũ tạo ra
  DELETE FROM auth.users WHERE id IN (
    '11111111-1111-4111-8111-111111111111'::uuid,
    '22222222-2222-4222-8222-222222222222'::uuid
  );
  
  -- Xoá các match và profile nháp bị kẹt
  DELETE FROM public.profiles WHERE id IN (
    '11111111-1111-4111-8111-111111111111'::uuid,
    '22222222-2222-4222-8222-222222222222'::uuid
  );
END $$;
