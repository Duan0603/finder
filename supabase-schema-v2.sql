-- ==============================================================================
-- PHẦN 1: BẢNG NUÔI PET & CHUỖI TIN NHẮN (MATCH PETS)
-- ==============================================================================

-- Bảng match_pets lưu trữ thông tin pet chung của 2 người trong 1 match
CREATE TABLE public.match_pets (
    match_id UUID PRIMARY KEY REFERENCES public.matches(id) ON DELETE CASCADE,
    streak_count INTEGER DEFAULT 0,
    last_chat_date DATE,
    pet_shape TEXT DEFAULT 'dog' CHECK (pet_shape IN ('dog', 'cat', 'rabbit', 'bear', 'hamster')),
    pet_name TEXT,
    happiness_score INTEGER DEFAULT 50 CHECK (happiness_score >= 0 AND happiness_score <= 100),
    level INTEGER DEFAULT 1,
    background TEXT DEFAULT 'default',
    accessories TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS cho match_pets (Chỉ người trong match mới xem và sửa được)
ALTER TABLE public.match_pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own match_pets" ON public.match_pets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.matches m
            WHERE m.id = match_pets.match_id
            AND (m.user1 = auth.uid() OR m.user2 = auth.uid())
        )
    );

CREATE POLICY "Users can update their own match_pets" ON public.match_pets
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.matches m
            WHERE m.id = match_pets.match_id
            AND (m.user1 = auth.uid() OR m.user2 = auth.uid())
        )
    );

-- Hàm xử lý khi có tin nhắn mới -> Tính streak và update hạnh phúc
CREATE OR REPLACE FUNCTION public.handle_message_streak()
RETURNS TRIGGER AS $$
DECLARE
    v_match_pet RECORD;
    v_today DATE := (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE;
    v_new_happiness INTEGER;
    v_new_streak INTEGER;
    v_new_level INTEGER;
BEGIN
    -- Lấy thông tin pet hiện tại
    SELECT * INTO v_match_pet FROM public.match_pets WHERE match_id = NEW.match_id;

    IF NOT FOUND THEN
        -- Nếu chưa có pet cho match này, tạo mới với streak = 1
        INSERT INTO public.match_pets (match_id, streak_count, last_chat_date, happiness_score)
        VALUES (NEW.match_id, 1, v_today, 60);
    ELSE
        -- Đã có pet, kiểm tra streak
        v_new_streak := v_match_pet.streak_count;
        v_new_happiness := v_match_pet.happiness_score;

        IF v_match_pet.last_chat_date = v_today - 1 THEN
            -- Chat liên tiếp ngày hôm qua -> hôm nay
            v_new_streak := v_new_streak + 1;
        ELSIF v_match_pet.last_chat_date < v_today - 1 THEN
            -- Bị đứt chuỗi (hơn 1 ngày không chat)
            v_new_streak := 1;
        END IF;

        -- Mỗi tin nhắn cộng 5 điểm hạnh phúc, max 100
        IF v_match_pet.last_chat_date = v_today THEN
            v_new_happiness := LEAST(100, v_new_happiness + 5);
        ELSE
            -- Ngày mới chat, hồi phục hạnh phúc mạnh hơn
            v_new_happiness := LEAST(100, v_new_happiness + 20);
        END IF;

        -- Tính level dựa trên streak_count
        IF v_new_streak >= 80 THEN v_new_level := 5;
        ELSIF v_new_streak >= 50 THEN v_new_level := 4;
        ELSIF v_new_streak >= 30 THEN v_new_level := 3;
        ELSIF v_new_streak >= 10 THEN v_new_level := 2;
        ELSE v_new_level := 1;
        END IF;

        -- Cập nhật
        UPDATE public.match_pets
        SET streak_count = v_new_streak,
            last_chat_date = v_today,
            happiness_score = v_new_happiness,
            level = v_new_level,
            updated_at = NOW()
        WHERE match_id = NEW.match_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Khởi tạo Trigger khi có message mới
DROP TRIGGER IF EXISTS on_message_insert_update_streak ON public.messages;
CREATE TRIGGER on_message_insert_update_streak
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.handle_message_streak();


