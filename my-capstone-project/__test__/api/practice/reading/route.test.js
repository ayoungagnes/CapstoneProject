jest.mock("next-auth", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    GET: jest.fn(),
    POST: jest.fn(),
  })),
}));
import { GET } from "@/app/api/practice/reading/[id]/route";
import { QuestionMaterial } from "@/app/lib/models/QuestionMaterial";
import { QuestionGroup } from "@/app/lib/models/QuestionGroup";
import { Question } from "@/app/lib/models/Question";
import { getServerSession } from "next-auth/next";


jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("@/app/lib/models/QuestionMaterial", () => ({
  QuestionMaterial: {
    findById: jest.fn(),
  },
}));

jest.mock("@/app/lib/models/QuestionGroup", () => ({
  QuestionGroup: {
    find: jest.fn(),
  },
}));

jest.mock("@/app/lib/models/Question", () => ({
  Question: {
    find: jest.fn(),
  },
}));

jest.mock("@/app/lib/mongoose", () => ({
  connectToDatabase: jest.fn(),
}));

const mockLean = (data) => ({ lean: () => Promise.resolve(data) });

describe("GET /api/practice/reading/[id]", () => {
  it("returns 401 if user is not authenticated", async () => {
    getServerSession.mockResolvedValueOnce(null);

    const res = await GET(new Request("http://localhost/api/practice/reading/abc123"), {
      params: { id: "abc123" },
    });

    const body = await res.json();
    expect(res.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  it("returns reading material and grouped questions", async () => {
    getServerSession.mockResolvedValueOnce({ user: { id: "user1" } });

    QuestionMaterial.findById.mockReturnValueOnce(
      mockLean({ _id: "abc123", title: "Sample" })
    );

    QuestionGroup.find.mockReturnValueOnce({
      sort: () => mockLean([{ _id: "g1", section: "reading", order: 1 }]),
    });

    Question.find.mockReturnValueOnce(
      mockLean([{ _id: "q1", questionGroup: "g1", text: "Q1" }])
    );

    const res = await GET(new Request("http://localhost/api/practice/reading/abc123"), {
      params: { id: "abc123" },
    });

    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.material.title).toBe("Sample");
    expect(body.groups).toHaveLength(1);
    expect(body.groups[0].questions).toHaveLength(1);
    expect(body.groups[0].questions[0].text).toBe("Q1");
  });
});
