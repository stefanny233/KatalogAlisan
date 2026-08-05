import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lhqyeysgklifxarixuht.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_WGItb0hHI_Kd6gQollauIw_uH2x-3NC';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
