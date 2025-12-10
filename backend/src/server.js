const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const authRoutes = require('./routes/auth.route')
const postRoutes = require('./routes/post.route');
const userRoutes = require('./routes/user.route');
const friendRoutes = require('./routes/friend.routes');
const commentRoutes = require('./routes/comment.route');
const storyRoutes = require('./routes/story.route');
const initSocket = require('./socket');


const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3001;

// middleware 
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/uploads',express.static('uploads'));

//routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/stories', storyRoutes);
//route
app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

initSocket(server);

server.listen(port, ()=>{
  console.log(`Server is running on port ${port}`);
})