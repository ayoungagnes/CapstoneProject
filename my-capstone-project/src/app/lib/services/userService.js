import User from '@/app/lib/models/User';
import bcrypt from 'bcryptjs';

export async function registerUser({ name, email, password, goal_score }) {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    goal_score: goal_score || 0,
  });

  return newUser;
}