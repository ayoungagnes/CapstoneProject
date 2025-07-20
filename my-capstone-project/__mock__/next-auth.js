export default jest.fn(() => ({
  GET: jest.fn(),
  POST: jest.fn(),
}));

export const getServerSession = jest.fn();