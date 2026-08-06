const request = require("supertest");

const app = require("../../src/app");

const { resetTasks } = require("../../src/models/task");

const pool = require("../../src/database/db");
describe("Tasks API", () => {
    
    beforeEach(async() => {
        await resetTasks();
    });
    
    afterAll(async () => {
        await pool.end();
    });

    test("GET /api/tasks retourne les tâches", async () => {

        const response = await request(app)
            .get("/api/tasks");

        expect(response.statusCode)
            .toBe(200);

        expect(response.body)
            .toBeInstanceOf(Array);

    });

    test("POST /api/tasks crée une tâche", async () => {

        const response = await request(app)
            .post("/api/tasks")
            .send({
                title: "Faire un test automatique"
            });

        expect(response.statusCode)
            .toBe(201);

        expect(response.body.title)
            .toBe("Faire un test automatique");

        expect(response.body.completed)
            .toBe(false);

    });

    test("DELETE /api/tasks/:id supprime une tâche", async () => {

        const response = await request(app)
            .delete("/api/tasks/1");

        expect(response.statusCode)
            .toBe(200);

        expect(response.body.id)
            .toBe(1);

    });

    test("DELETE /api/tasks/:id retourne 404 si inexistante", async () => {

        const response = await request(app)
            .delete("/api/tasks/999");

        expect(response.statusCode)
            .toBe(404);

        expect(response.body.message)
            .toBe("Task not found");

    });

    test("PUT /api/tasks/:id modifie une tâche", async () => {

        const response = await request(app)
            .put("/api/tasks/2")
            .send({
                title: "Apprendre Jest",
                completed: true
            });

        expect(response.statusCode)
            .toBe(200);

        expect(response.body.title)
            .toBe("Apprendre Jest");

        expect(response.body.completed)
            .toBe(true);

    });

    test("PUT /api/tasks/:id retourne 404 si inexistante", async () => {

        const response = await request(app)
            .put("/api/tasks/999")
            .send({
                title: "Test"
            });

        expect(response.statusCode)
            .toBe(404);

        expect(response.body.message)
            .toBe("Task not found");

    });

});