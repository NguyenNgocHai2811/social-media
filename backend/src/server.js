const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { getSession } = require('./config/neo4j');
const authRoutes = require('./routes/auth.route')
const postRoutes = require('./routes/post.route');
const userRoutes = require('./routes/user.route');
const friendRoutes = require('./routes/friend.routes');
const app = express();
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
//route
app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});