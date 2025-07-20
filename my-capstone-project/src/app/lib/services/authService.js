import { connectToDatabase } from "@/app/lib/mongoose";
import User from "@/app/lib/models/User";
import bcrypt from "bcryptjs";

/**  
 * Verifies an email/password pair.  
 * @param {{email: string, password: string}} credentials  
 * @returns {Promise<{id: string, name: string, email: string}>}  
 * @throws {Error} "No user found" or "Invalid password"  
 */
export async function authenticateUser({ email, password }) {
  await connectToDatabase();

  const user = await User.findOne({ email });
  if (!user) throw new Error("No user found");

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new Error("Invalid password");

  return { id: user._id.toString(), name: user.name, email: user.email };
}
