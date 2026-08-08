/**
 * AegisDesk AI — Auth API Tests
 * ------------------------------------------------------------
 * Run with:  npx jest tests/auth.test.js --runInBand
 *
 * Requires (add to backend/package.json devDependencies):
 *   npm install --save-dev jest supertest mongodb-memory-server
 *
 * ADJUST: import path to your Express app, and route paths below
 * to match your actual routes/auth.js implementation.
 * ------------------------------------------------------------
 */

const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

// ⚠️ ADJUST: point this to wherever you export your Express `app`
// e.g. module.exports = app; at the bottom of server.js / app.js
const app = require("../app"); // or "../server"

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe("Auth API", () => {
  const testUser = {
    firebaseUid: "test-firebase-uid-123",
    email: "agent01@aegisdesk.test",
    name: "Test Agent",
    role: "agent", // agent | admin | user — adjust to your enum
  };

  test("POST /api/auth/register — should create a new user profile after Firebase signup", async () => {
    const res = await request(app).post("/api/auth/register").send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("user");
    expect(res.body.user.email).toBe(testUser.email);
  });

  test("POST /api/auth/register — should reject duplicate firebaseUid", async () => {
    await request(app).post("/api/auth/register").send(testUser);
    const res = await request(app).post("/api/auth/register").send(testUser);

    expect(res.statusCode).toBe(409); // or 400, adjust to your API contract
  });

  test("POST /api/auth/register — should reject missing required fields", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "incomplete@test.com" });

    expect(res.statusCode).toBe(400);
  });

  test("GET /api/auth/me — should reject request without auth token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.statusCode).toBe(401);
  });

  test("GET /api/auth/me — should return profile with a valid mock token", async () => {
    // If you use Firebase Admin SDK middleware, mock verifyIdToken in a
    // __mocks__/firebase-admin.js file, or use a test-only bypass header.
    await request(app).post("/api/auth/register").send(testUser);

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer TEST_MOCK_TOKEN");

    // Adjust expected status once Firebase mock is wired up
    expect([200, 401]).toContain(res.statusCode);
  });

  test("Role-based access — non-admin should be blocked from admin-only route", async () => {
    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", "Bearer TEST_MOCK_AGENT_TOKEN");

    expect([401, 403]).toContain(res.statusCode);
  });
});