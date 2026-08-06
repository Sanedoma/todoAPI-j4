const express = require("express");

const router = express.Router();

const tasks = require("../models/task");


router.get("/", (req, res) => {

    res.json(tasks);

});

router.post("/", (req, res) => {

    const newTask = {
        id: tasks.length + 1,
        title: req.body.title,
        completed: false
    };


    tasks.push(newTask);


    res.status(201).json(newTask);

});

router.delete("/:id", (req, res) => {

    const taskId = Number(req.params.id);


    const taskIndex = tasks.findIndex(
        task => task.id === taskId
    );


    if (taskIndex === -1) {
        return res.status(404).json({
            message: "Task not found"
        });
    }


    const deletedTask = tasks.splice(taskIndex, 1);


    res.json(deletedTask[0]);

});

router.put("/:id", (req, res) => {

    const taskId = Number(req.params.id);


    const task = tasks.find(
        task => task.id === taskId
    );


    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        });
    }


    task.title = req.body.title ?? task.title;

    task.completed = req.body.completed ?? task.completed;


    res.json(task);

});

module.exports = router;