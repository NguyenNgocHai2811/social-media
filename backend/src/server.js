const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { getSession } = require('./config/neo4j');
const authRoutes = require('./routes/auth.route')
const app = express();
const port = process.env.PORT || 3001;

// middleware 
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


//routes
app.use('/api/auth', authRoutes);
//route
app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});