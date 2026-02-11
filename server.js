const express = require('express');
const fs = require('fs'); // <--- Add this
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
// Use path.join to create an absolute path to the public folder
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    // Read the posts from our JSON file
    fs.readFile('./posts.json', 'utf8', (err, data) => {
        if (err) {
            console.error("Could not read posts file", err);
            return res.send("Error loading blog posts.");
        }
        const posts = JSON.parse(data);
        res.render('index', { posts: posts });
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
});