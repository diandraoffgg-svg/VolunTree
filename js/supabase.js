import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://hxfyftqaagyvsgksjeok.supabase.co';
const SUPABASE_KEY = 'sb_publishable_KUTOEspck4m2Y7Eb2zlAHA_EuOPpe9P';

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);