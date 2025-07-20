// __tests__/services/authService.spec.js
import { authenticateUser } from "@/app/lib/services/authService";
import { connectToDatabase } from "@/app/lib/mongoose";
import User from "@/app/lib/models/User";
import bcrypt from "bcryptjs";

// Mock out the DB connector, User model, and bcrypt.compare
jest.mock("@/app/lib/mongoose", () => ({
  connectToDatabase: jest.fn(),
}));
jest.mock("@/app/lib/models/User", () => ({
  __esModule: true,
  default: { findOne: jest.fn() },
}));
jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
}));

describe("authenticateUser()", () => {
  const mockUser = {
    _id: "507f1f77bcf86cd799439011",
    name: "Alice",
    email: "alice@example.com",
    password: "hashedPassword",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("connects to the database, finds the user, and returns user info on valid credentials", async () => {
    // Arrange
    User.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);

    // Act
    const result = await authenticateUser({
      email: mockUser.email,
      password: "correctPassword",
    });

    // Assert
    expect(connectToDatabase).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalledWith({ email: mockUser.email });
    expect(bcrypt.compare).toHaveBeenCalledWith(
      "correctPassword",
      mockUser.password
    );
    expect(result).toEqual({
      id: mockUser._id,
      name: mockUser.name,
      email: mockUser.email,
    });
  });

  it("throws an error when no user is found", async () => {
    // Arrange
    User.findOne.mockResolvedValue(null);

    // Act & Assert
    await expect(
      authenticateUser({ email: "unknown@example.com", password: "x" })
    ).rejects.toThrow("No user found");
    expect(connectToDatabase).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalledWith({ email: "unknown@example.com" });
  });

  it("throws an error when password comparison fails", async () => {
    // Arrange
    User.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(false);

    // Act & Assert
    await expect(
      authenticateUser({ email: mockUser.email, password: "wrongPassword" })
    ).rejects.toThrow("Invalid password");
    expect(connectToDatabase).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalledWith({ email: mockUser.email });
    expect(bcrypt.compare).toHaveBeenCalledWith(
      "wrongPassword",
      mockUser.password
    );
  });
});
