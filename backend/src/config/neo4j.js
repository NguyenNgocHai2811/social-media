const neo4j = require('neo4j-driver');
require('dotenv').config();

const {
  NEO4J_URI,
  NEO4J_USERNAME,
  NEO4J_PASSWORD,
  NEO4J_DATABASE
} = process.env;


const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD), {
  disableLosslessIntegers: true,
});

const getSession = () => {
  return driver.session({ database: NEO4J_DATABASE || 'neo4j' });
};

module.exports = {
  getSession,
  driver
};