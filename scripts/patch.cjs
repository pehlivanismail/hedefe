const fs = require('fs');
let code = fs.readFileSync('src/lib/auth.tsx', 'utf8');

code = code.replace(
  '// Attach coach ID to the current student',
  `
    console.log("DEBUG AUTH STATE:", {
      profilesLength: profiles.length,
      coachConnectionsLength: coachConnections.length,
      userRole: role,
      userId: user?.id,
      meCoachId: me?.coach_id,
      profilesSample: profiles.slice(0,2),
    });
    // Attach coach ID to the current student
`
);

fs.writeFileSync('src/lib/auth.tsx', code);
