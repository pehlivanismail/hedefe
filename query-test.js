import fs from 'fs'
const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=')
  if (key && val.length) acc[key] = val.join('=').replace(/"/g, '')
  return acc
}, {})

async function run() {
  const p = await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/profiles?select=*`, {
    headers: { apikey: env.VITE_SUPABASE_ANON_KEY, Authorization: `Bearer ${env.VITE_SUPABASE_ANON_KEY}` }
  }).then(r => r.json())
  
  const u = await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/user_roles?select=*`, {
    headers: { apikey: env.VITE_SUPABASE_ANON_KEY, Authorization: `Bearer ${env.VITE_SUPABASE_ANON_KEY}` }
  }).then(r => r.json())

  console.log("Profiles:", p)
  console.log("User Roles:", u)
}
run()
