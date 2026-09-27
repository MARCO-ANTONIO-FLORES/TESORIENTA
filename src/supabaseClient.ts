import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bhhjqpwrduxvummfpotd.supabase.co';
const supabaseAnonKey = 'sb_publishable_QGtJ9La_z9q_N9IWWmCUBA_UN2rzTJd';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);