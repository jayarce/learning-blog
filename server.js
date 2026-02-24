const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const { marked } = require('marked');
const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.ADMIN_PASSWORD) {
    console.error("FATAL ERROR: ADMIN_PASSWORD is not defined.");
    process.exit(1);
}
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

mongoose.connect('mongodb://mongo-service:27017/blogdb')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => { console.error('DB Error:', err); process.exit(1); });

const Post = mongoose.model('Post', new mongoose.Schema({
  title: String, content: String, date: { type: Date, default: Date.now }
}));

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint for Kubernetes Probes
app.get('/health', (req, res) => {
    // Check if the database is connected
    const isDbConnected = mongoose.connection.readyState === 1;
    
    if (isDbConnected) {
        res.status(200).json({ status: 'UP', database: 'connected' });
    } else {
        // If DB is down, report 500 so K8s knows this pod shouldn't take traffic
        res.status(500).json({ status: 'DOWN', database: 'disconnected' });
    }
});

app.get('/', async (req, res) => {
  const posts = await Post.find().sort({ date: -1 });
  res.render('index', { posts, marked }); 
});

app.get('/admin', (req, res) => {
    res.send(`
        <html><body style="font-family:sans-serif; max-width:500px; margin:auto; padding:20px;">
            <h1>New Post</h1>
            <form action="/admin" method="POST">
                <input type="password" name="password" placeholder="Password" style="width:100%; margin-bottom:10px;" required><br>
                <input type="text" name="title" placeholder="Title" style="width:100%; margin-bottom:10px;" required><br>
                <textarea name="content" placeholder="Content" style="width:100%; height:100px; margin-bottom:10px;" required></textarea><br>
                <button type="submit" style="width:100%; background:#007bff; color:white; border:none; padding:10px;">Publish</button>
            </form>
        </body></html>
    `);
});

// GET route to show the edit form
app.get('/edit/:id', async (req, res) => {
    const post = await Post.findById(req.params.id);
    res.send(`
        <html><body style="font-family:sans-serif; max-width:500px; margin:auto; padding:20px;">
            <h1>Edit Post</h1>
            <form action="/edit/${post._id}" method="POST">
                <input type="password" name="password" placeholder="Admin Password" style="width:100%; margin-bottom:10px;" required><br>
                <input type="text" name="title" value="${post.title}" style="width:100%; margin-bottom:10px;" required><br>
                <textarea name="content" style="width:100%; height:200px; margin-bottom:10px;" required>${post.content}</textarea><br>
                <button type="submit" style="width:100%; background:#28a745; color:white; border:none; padding:10px;">Update Post</button>
                <a href="/" style="display:block; text-align:center; margin-top:10px;">Cancel</a>
            </form>
        </body></html>
    `);
});

// POST route to handle the update
app.post('/edit/:id', async (req, res) => {
    const { password, title, content } = req.body;
    if (password !== ADMIN_PASSWORD) return res.status(403).send("Unauthorized");
    
    await Post.findByIdAndUpdate(req.params.id, { title, content });
    res.redirect('/');
});

app.post('/admin', async (req, res) => {
    const { password, title, content } = req.body;
    if (password !== ADMIN_PASSWORD) return res.status(403).send("Unauthorized");
    await Post.create({ title, content });
    res.redirect('/');
});

app.listen(PORT, '0.0.0.0', () => console.log(`Running on port ${PORT}`));