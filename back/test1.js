const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const { Pool } = require('pg');
const cors = require('cors');
const { performance } = require('perf_hooks');  // Для использования performance.now()

const pool = new Pool({
  user: 'postgres',       
  host: 'localhost',
  database: 'highLoadTest',  
  password: 'Serik2004', 
  port: 5432,
});

const schema = buildSchema(`
  type User {
    id: ID!
    name: String
    age: Int
    gender: String
  }

  type PerformanceData {
    noCacheTime: Float
    cacheTime: Float
  }

  type Query {
    users: [User]
    noCache: [User]
    cache: [User]
    performance: PerformanceData
  }
`);

let cacheData = null;

const root = {
  users: async () => {
    const result = await pool.query('SELECT * FROM users');
    return result.rows;
  },
  noCache: async () => {
    const start = performance.now();
    const result = await pool.query('SELECT * FROM users');
    const end = performance.now();
    console.log(`No cache query time: ${(end - start).toFixed(2)} ms`);
    return result.rows;
  },
  cache: async () => {
    const start = performance.now();
    if (!cacheData) {
      const result = await pool.query('SELECT * FROM users');
      cacheData = result.rows;
    }
    const end = performance.now();
    console.log(`Cache query time: ${(end - start).toFixed(2)} ms`);
    return cacheData;
  },
  performance: async () => {
    // Измерение времени запроса без кэша
    const startNoCache = performance.now();
    await pool.query('SELECT * FROM users');
    const noCacheTime = performance.now() - startNoCache;

    // Измерение времени запроса с кэшем
    const startCache = performance.now();
    if (!cacheData) {
      await pool.query('SELECT * FROM users');
    }
    const cacheTime = performance.now() - startCache;

    return { noCacheTime, cacheTime };
  }
};

const app = express();
app.use(cors({
  origin: "*"
}));  

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,  
}));

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
