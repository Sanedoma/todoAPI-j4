const express = require("express");

const router = express.Router();
const taskModel = require("../models/task");
const validateTask = require("../middleware/validateTask");


/**
 * GET /api/tasks
 * Retourne toutes les tâches
 */
router.get("/", async (req, res, next) => {

    try {
        const tasks = await taskModel.getAll();
        res.json(tasks);

    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/tasks
 * Crée une tâche
 */
router.post("/", validateTask, async (req, res, next) => {

    try {
        const task = await taskModel.create(
            req.body.title
        );
        res.status(201).json(task);

    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/tasks/:id
 * Supprime une tâche
 */
router.delete("/:id", async (req, res, next) => {
    try {
        const task = await taskModel.remove(
            Number(req.params.id)
        );

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }
        res.json(task);

    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/tasks/:id
 * Modifie une tâche
 */
router.put("/:id", async (req, res, next) => {

    try {
        const task = await taskModel.update(
            Number(req.params.id),
            req.body.title,
            req.body.completed
        );

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json(task);

    } catch (error) {
        next(error);
    }
});

module.exports = router;