const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
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

app.get('/', async (req, res) => {
  const posts = await Post.find().sort({ date: -1 });
  res.render('index', { posts });
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

app.post('/admin', async (req, res) => {
    const { password, title, content } = req.body;
    if (password !== ADMIN_PASSWORD) return res.status(403).send("Unauthorized");
    await Post.create({ title, content });
    res.redirect('/');
});

app.listen(PORT, '0.0.0.0', () => console.log(`Running on port ${PORT}`));