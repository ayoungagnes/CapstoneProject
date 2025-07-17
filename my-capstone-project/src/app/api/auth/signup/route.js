import { connectToDatabase } from '@/app/lib/mongoose';
import User from '@/app/lib/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    await connectToDatabase();
    const { name, email, password, goal_score } = await request.json();

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return Response.json({ error: "User already exists" }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      goal_score: goal_score || 0,
    });

    return Response.json({ message: "User created", user: newUser }, { status: 201 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}