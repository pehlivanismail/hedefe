import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envFile = fs.readFileSync('.env', 'utf-8')
let supabaseUrl = ''
let supabaseKey = ''

for (const line of envFile.split('\n')) {
  if (line.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].replace(/"/g, '')
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].replace(/"/g, '')
}

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function clearLogs() {
  console.log('Clearing study_logs...')
  const { error: err1 } = await supabase.from('study_logs').delete().neq('id', '0')
  if (err1) console.error('Error clearing study_logs:', err1)
  
  console.log('Clearing tasks...')
  const { error: err2 } = await supabase.from('tasks').delete().neq('id', '0')
  if (err2) console.error('Error clearing tasks:', err2)

  console.log('Done.')
}

clearLogs()
