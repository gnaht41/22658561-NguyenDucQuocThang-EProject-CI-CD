const chai = require("chai");
const chaiHttp = require("chai-http");
const App = require("../app");
const expect = chai.expect;
require("dotenv").config();

chai.use(chaiHttp);

describe("Products", function () {
  this.timeout(30000);

  let app;
  let server;
  let authToken;

  const loginUser = process.env.TEST_USER || "demo";
  const loginPass = process.env.TEST_PASSWORD || "123";
  const AUTH_BASE = process.env.AUTH_BASE_URL || "http://localhost:3000";

  before(async () => {
    // Khởi động app product + kết nối DB & MQ
    app = new App();
    await Promise.all([app.connectDB(), app.setupMessageBroker?.()]);
    server = app.start?.();

    // 1) Đăng ký user test (bỏ qua lỗi nếu đã tồn tại)
    try {
      await chai.request(AUTH_BASE)
        .post("/register")
        .send({ username: loginUser, password: loginPass });
    } catch (_) { }

    // 2) Đăng nhập để lấy token (chấp nhận nhiều key: token/accessToken/jwt)
    const authRes = await chai.request(AUTH_BASE)
      .post("/login")
      .send({ username: loginUser, password: loginPass });

    expect(authRes).to.have.status(200);
    authToken = authRes.body.token || authRes.body.accessToken || authRes.body.jwt;
    if (!authToken || typeof authToken !== "string") {
      // In body để debug nếu backend trả format khác
      throw new Error("Không nhận được JWT hợp lệ từ /login: " + JSON.stringify(authRes.body));
    }
  });

  after(async () => {
    try { await app.disconnectDB?.(); } catch { }
    try { await app.closeMessageBroker?.(); } catch { }
    try {
      if (server && typeof server.close === "function") {
        await new Promise((res) => server.close(() => res()));
      } else {
        await app.stop?.();
      }
    } catch { }
  });

  describe("POST /products", () => {
    it("should create a new product", async () => {
      const product = { name: "Product 1", description: "Description of Product 1", price: 10 };

      const res = await chai
        .request(app.app)
        .post("/api/products")
        .set("Authorization", `Bearer ${authToken}`)
        .send(product);

      expect(res).to.have.status(201);
      expect(res.body).to.have.property("_id");
      expect(res.body).to.have.property("name", product.name);
      expect(res.body).to.have.property("description", product.description);
      expect(res.body).to.have.property("price", product.price);
    });

    it("should return an error if name is missing", async () => {
      const res = await chai
        .request(app.app)
        .post("/api/products")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ description: "Description of Product 1", price: 10 });

      expect(res).to.have.status(400);
    });
  });
});
