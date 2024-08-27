const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Parse JSON bodies (as sent by API clients)
app.use(bodyParser.json({limit: '10mb'}));

// Connect to SQLite database
let db = new sqlite3.Database('./spots.db', (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to database');
    }
});

// API endpoint to insert a new spot
app.post('/addSpot', (req, res) => {
    const { spotname, description, image, rating, latitude, longitude } = req.body;

    // SQL query to insert data into the database
    const sql = `INSERT INTO spots (spotname, description, image, rating, latitude, longitude)
                 VALUES (?, ?, ?, ?, ?, ?)`;

    // Execute SQL query
    db.run(sql, [spotname, description, image, rating, latitude, longitude], function(err) {
        if (err) {
            console.error('Error inserting data', err);
            res.status(500).json({ error: 'Failed to insert data' });
        } else {
            res.status(200).json({ message: 'Spot added successfully!' });
        }
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});