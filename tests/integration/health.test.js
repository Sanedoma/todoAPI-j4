const request = require("supertest");
const app = require("../../src/app");


describe("Health Check", () => {

    test("GET /health retourne le statut de l'API", async () => {

        const response = await request(app)
            .get("/health");

        expect(response.statusCode)
            .toBe(200);

        expect(response.body.status)
            .toBe("ok");

        expect(response.body.service)
            .toBe("todo-api");

    });

});