const { ApolloServer, gql } = require('apollo-server');
const { Pool } = require('pg');
const { performance } = require('perf_hooks');

// Подключение к базе данных PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'highLoadTest',
  password: 'Serik2004',
  port: 5432,
});

// Переменные для хранения данных кэша и времени выполнения
let cache = null;
let performanceData = {
  noCacheTime: 0,
  cacheTime: 0,
};

// Определение схемы GraphQL
const typeDefs = gql`
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
    noCache: [User]
    cache: [User]
    performance: PerformanceData
  }
`;

// Резолверы для запросов
const resolvers = {
  Query: {
    // Запрос без кэша, возвращает пользователей из базы данных
    noCache: async () => {
      const start = performance.now();  // Начинаем измерять время
      const result = await pool.query('SELECT * FROM users');
      const end = performance.now();    // Завершаем измерение
      performanceData.noCacheTime = end - start;  // Сохраняем время выполнения

      console.log(`No cache query time: ${(end - start).toFixed(2)} ms`);
      return result.rows;  // Возвращаем данные пользователей
    },

    // Запрос с кэшем
    cache: async () => {
      const start = performance.now();

      if (cache) {  // Если данные в кэше, возвращаем их
        const end = performance.now();
        performanceData.cacheTime = end - start;  // Сохраняем время выполнения для кэша
        console.log(`Cache query time: ${(end - start).toFixed(2)} ms`);
        return cache;  // Возвращаем данные из кэша
      }

      // Если данных в кэше нет, выполняем запрос к базе данных
      const result = await pool.query('SELECT * FROM users');
      cache = result.rows;  // Сохраняем данные в кэше
      const end = performance.now();
      performanceData.cacheTime = end - start;  // Сохраняем время выполнения

      console.log(`Cache miss, query time: ${(end - start).toFixed(2)} ms`);
      return cache;  // Возвращаем данные
    },

    // Возвращает данные о времени выполнения запросов
    performance: () => {
      return {
        noCacheTime: performanceData.noCacheTime,
        cacheTime: performanceData.cacheTime,
      };
    },
  },
};

// Создание и запуск сервера Apollo
const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
