const request = require("supertest");
const app = require("../../src/app");


describe("Gestion des erreurs", () => {

    test("POST /api/tasks refuse une tâche sans titre", async () => {

        const response = await request(app)
            .post("/api/tasks")
            .send({});

        expect(response.statusCode)
            .toBe(400);

        expect(response.body.message)
            .toBe("Title is required");

    });

});