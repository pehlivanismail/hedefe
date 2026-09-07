import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  let [k, v] = line.split('=');
  if (k && v) acc[k.trim()] = v.replace(/"/g, '').trim();
  return acc;
}, {});
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
const { data, error } = await supabase.from('study_logs').select('*').eq('kind', 'konu');
if (error) console.error(error);
else console.log(JSON.stringify(data, null, 2));
