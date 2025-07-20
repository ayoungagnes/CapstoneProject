import { connectToDatabase } from '@/app/lib/mongoose';
import { registerUser } from '@/app/lib/services/userService';

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const newUser = await registerUser(body);

    return Response.json({ message: "User created", user: newUser }, { status: 201 });
  } catch (err) {
    const status = err.message === 'User already exists' ? 400 : 500;
    return Response.json({ error: err.message }, { status });
  }
}