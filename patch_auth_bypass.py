import sys

file_path = "src/lib/auth.tsx"
with open(file_path, "r") as f:
    content = f.read()

# Replace the role resolving logic
target = "const me = profiles.find((p) => p.user_id === user?.id) ?? null;\n  const role = user ? (roles[user.id] ?? null) : null;"
replacement = """  // If the user is logged in but doesn't have a role in the DB yet, default to student for testing
  let me = profiles.find((p) => p.user_id === user?.id) ?? null;
  let role = user ? (roles[user.id] ?? null) : null;
  
  if (user && !role) {
    role = "student";
    me = {
      user_id: user.id,
      full_name: user.email?.split("@")[0] || "Test",
      email: user.email || "",
      role: "student",
      exam_tracks: []
    };
  }"""

if target in content:
    with open(file_path, "w") as f:
         f.write(content.replace(target, replacement))
    print("Patched auth.tsx successfully")
else:
    print("Target string not found in auth.tsx")
