const express = require('express');
const fs = require('fs');
const { performance } = require('perf_hooks');
const { ApolloServer, gql } = require('apollo-server-express');

const app = express();

let cache = null;
let performanceData = {
    noCacheTime: null,
    cacheTime: null,
};

function generateData() {
    let result = '';
    for (let i = 0; i < 10000; i++) {
        let count = 584 * 584;
        result += `${count}\n`;
    }
    return result;
}

const typeDefs = gql`
    type Query {
        noCache: String
        cache: String
        performance: PerformanceData
    }

    type PerformanceData {
        noCacheTime: Float
        cacheTime: Float
    }
`;

const resolvers = {
    Query: {
        noCache: () => {
            const start = performance.now();
            let result = generateData();
            fs.writeFileSync('data_nocache.txt', result);
            const end = performance.now();
            performanceData.noCacheTime = end - start; // Сохраняем время выполнения
            return `Data generated and written to file without cache.`;
        },
        cache: () => {
            const start = performance.now();

            if (cache) {
                const end = performance.now();
                performanceData.cacheTime = end - start; // Сохраняем время выполнения
                return `Data retrieved from cache.`;
            }

            let result = generateData();
            fs.writeFileSync('data_cache.txt', result);
            cache = result;

            const end = performance.now();
            performanceData.cacheTime = end - start; // Сохраняем время выполнения
            return `Data generated, written to file, and cached.`;
        },
        performance: () => {
            return {
                noCacheTime: performanceData.noCacheTime,
                cacheTime: performanceData.cacheTime,
            };
        }
    }
};

const server = new ApolloServer({ typeDefs, resolvers });

async function startServer() {
    await server.start();
    server.applyMiddleware({ app });

    app.listen(3000, () => {
        console.log('Server is running on http://localhost:3000/graphql');
    });
}

startServer();
