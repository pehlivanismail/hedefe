import re

auth_file = "src/lib/auth.tsx"

with open(auth_file, "r") as f:
    content = f.read()

# Replace ProfileRow and related functions
content = content.replace('type ProfileRow = {', 'type ProfileRow = {\n  user_id: string;')
content = content.replace('id: string;', '')
content = content.replace('target: string;', 'target?: string;')
content = content.replace('track: Track;', 'track?: Track;')
content = content.replace('title: string;', 'title?: string;')
content = content.replace('coach_id: string | null;', 'coach_id?: string | null;')

content = content.replace('id: p.id,', 'id: p.user_id,')
content = content.replace('track: p.track,', 'track: p.track || "sayisal",')
content = content.replace('coachId: p.coach_id,', 'coachId: p.coach_id || null,')

content = content.replace('supabase\n        .from("profiles")\n        .select("id, full_name, email, target, track, title, coach_id"),', 'supabase\n        .from("user_roles")\n        .select("user_id, full_name, email, role"),')
content = content.replace('const [{ data: profileRows }, { data: roleRows }] = await Promise.all([\n      supabase\n        .from("user_roles")\n        .select("user_id, full_name, email, role"),\n      supabase.from("user_roles").select("user_id, role"),\n    ]);', 'const { data: roleRows } = await supabase.from("user_roles").select("*");\n    const profileRows = roleRows;')

# Quick hack string replaces above might fail, let's just rewrite auth.tsx cleanly
