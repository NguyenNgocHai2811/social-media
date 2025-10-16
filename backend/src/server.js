const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { getSession } = require('./config/neo4j');
const app = express();
const port = process.env.PORT || 3001;

// middleware 
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// mock user
const mockUser = {
  username: 'user',
  password: 'password'
};
//route
app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

app.post('/api/login',(req, res)=>{
  const {username, password} = req.body;

  if(username == mockUser.username && password == mockUser.password) {
    res.status(200).json({message: 'Login successfull'});
  } else {
    res.status(401).json({message: 'Invalid credentials'})
  }
})



// 
app.get('/api/test-neo4j', async (req, res) => {
  const session = getSession();
  try {
    const result = await session.run('MATCH (n) RETURN n LIMIT 5');
    const nodes = result.records.map(record => record.get('n').properties);
    res.json(nodes);
  } catch (error) {
    console.error('Error connecting to Neo4j', error);
    res.status(500).send('Error connecting to Neo4j');
  } finally {
    await session.close();
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});