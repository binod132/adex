var express = require("express");
var bodyParser = require("body-parser");
var app = express();
const pool = require('./db'); // Import the PostgreSQL connection

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

// POST route for adding new task
app.post("/addtask", async function(req, res) {
    var newTask = req.body.newtask;
    try {
        await pool.query('INSERT INTO tasks (title, is_completed) VALUES ($1, $2)', [newTask, false]);
    } catch (err) {
        console.error('Error adding task:', err);
    }
    res.redirect("/");
});

// POST route for removing tasks
app.post("/removetask", async function(req, res) {
    var completeTask = req.body.check;
    try {
        if (typeof completeTask === "string") {
            await pool.query('UPDATE tasks SET is_completed = true WHERE id = $1', [completeTask]);
        } else if (typeof completeTask === "object") {
            for (var i = 0; i < completeTask.length; i++) {
                await pool.query('UPDATE tasks SET is_completed = true WHERE id = $1', [completeTask[i]]);
            }
        }
    } catch (err) {
        console.error('Error removing task:', err);
    }
    res.redirect("/");
});

// Render the ejs and display tasks
app.get("/", async function(req, res) {
    try {
        const tasksResult = await pool.query('SELECT * FROM tasks WHERE is_completed = false');
        const completedResult = await pool.query('SELECT * FROM tasks WHERE is_completed = true');
        res.render("index", { task: tasksResult.rows, complete: completedResult.rows });
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).send('Server error');
    }
});

// Set app to listen on port 3000
app.listen(3000, function() {
    console.log("Server is running on port 3000");
});
