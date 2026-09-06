import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fhhwsxzdrzidegeqkkov.supabase.co'
const supabaseKey = 'sb_publishable_ZZNUXJG2rJlE5d891ATy8g_4amRfT-l'
const supabase = createClient(supabaseUrl, supabaseKey)

const { data, error } = await supabase.from('user_roles').select('*')
console.log('Error:', error)
console.log('Data:', data)
