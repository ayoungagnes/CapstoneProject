import { authOptions } from "@/app/api/auth/[...nextauth]/route";

jest.mock("@/app/lib/mongoose", () => ({
  connectToDatabase: jest.fn(),
}));

describe("NextAuth configuration (authOptions)", () => {
  const provider = authOptions.providers.find((p) => p.id === "credentials");

  it("registers a credentials provider", () => {
    expect(provider).toBeDefined();
    expect(provider.name).toBe("Credentials");
    expect(provider.type).toBe("credentials");
  });

  it("exposes an authorize function", () => {
    expect(typeof provider.authorize).toBe("function");
  });

  it("uses the custom sign‑in page", () => {
    expect(authOptions.pages).toEqual({ signIn: "/login" });
  });

  it("uses JWT for session strategy", () => {
    expect(authOptions.session).toEqual({ strategy: "jwt" });
  });

  it("reads NEXTAUTH_SECRET from environment", () => {
    expect(authOptions.secret).toBe(process.env.NEXTAUTH_SECRET);
  });
});

describe("NextAuth callbacks", () => {
  const { jwt, session } = authOptions.callbacks;

  it("jwt callback attaches user.id to the token when user is present", async () => {
    const initial = {};
    const updated = await jwt({ token: initial, user: { id: "u123" } });
    expect(updated.id).toBe("u123");
  });

  it("jwt callback leaves token untouched if no user", async () => {
    const token = { foo: "bar" };
    expect(await jwt({ token })).toEqual(token);
  });

  it("session callback adds token.id into session.user.id", async () => {
    const sess = { user: {} };
    const updated = await session({ session: sess, token: { id: "t456" } });
    expect(updated.user.id).toBe("t456");
  });

  it("session callback leaves session untouched if no token", async () => {
    const sess = { user: { name: "Alice" } };
    expect(await session({ session: sess })).toEqual(sess);
  });
});
