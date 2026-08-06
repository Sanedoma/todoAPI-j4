const pool = require("../database/db");


/**
 * Récupère toutes les tâches
 */
const getAll = async () => {

    const result = await pool.query(`
        SELECT id, title, completed
        FROM tasks
        ORDER BY id;
    `);

    return result.rows;
};



/**
 * Crée une tâche
 */
const create = async (title) => {

    const result = await pool.query(
        `
        INSERT INTO tasks(title)
        VALUES($1)
        RETURNING id, title, completed;
        `,
        [title]
    );

    return result.rows[0];
};



/**
 * Modifie une tâche
 */
const update = async (id, title, completed) => {

    const result = await pool.query(
        `
        UPDATE tasks
        SET title = $1,
            completed = $2
        WHERE id = $3
        RETURNING id, title, completed;
        `,
        [
            title,
            completed,
            id
        ]
    );


    return result.rows[0];

};



/**
 * Supprime une tâche
 */
const remove = async (id) => {

    const result = await pool.query(
        `
        DELETE FROM tasks
        WHERE id = $1
        RETURNING id, title, completed;
        `,
        [id]
    );


    return result.rows[0];

};



/**
 * Réinitialise les tâches
 * Utilisé uniquement pour les tests
 */
const resetTasks = async () => {

    await pool.query(`
        TRUNCATE TABLE tasks RESTART IDENTITY;
    `);

    await pool.query(`
        INSERT INTO tasks(title, completed)
        VALUES
        ('Apprendre Node.js', false),
        ('Découvrir Docker', false);
    `);

};


module.exports = {
    getAll,
    create,
    update,
    remove,
    resetTasks
};