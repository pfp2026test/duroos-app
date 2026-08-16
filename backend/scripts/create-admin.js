// Usage: node scripts/create-admin.js you@email.com "YourPassword123!" "Your Name"
import bcrypt from "bcryptjs";
import prisma from "../src/lib/prisma.js";

const [, , email, password, name] = process.argv;

if (!email || !password) {
  console.error('Usage: node scripts/create-admin.js you@email.com "YourPassword123!" "Your Name"');
  process.exit(1);
}

const passwordHash = await bcrypt.hash(password, 10);

const admin = await prisma.admin.upsert({
  where: { email },
  update: { passwordHash, name: name || email, role: "SUPER_ADMIN" },
  create: { email, passwordHash, name: name || email, role: "SUPER_ADMIN" },
});

console.log(`Admin ready: ${admin.email} (${admin.role})`);
process.exit(0);
