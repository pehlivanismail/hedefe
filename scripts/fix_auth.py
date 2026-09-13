import sys

file_path = "src/lib/auth.tsx"
with open(file_path, "r") as f:
    content = f.read()

# Remove full_name from select
content = content.replace('.select("user_id, full_name, email, role, exam_tracks");', '.select("user_id, email, role, exam_tracks");')

with open(file_path, "w") as f:
    f.write(content)
