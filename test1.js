const express = require('express');
const fs = require('fs');
const { performance } = require('perf_hooks');  
const {ApolloServer, gql} = require('apollo-server-express~')
const app = express();

let cache = null;  

function generateData() {
    let result = '';
    for (let i = 0; i < 10000; i++) {
        let count = 584 * 584;
        result += `${count}\n`;
    }
    return result;
}

app.get('/nocache', (req, res) => {
    const start = performance.now();

    let result = generateData();

    fs.writeFileSync('data_nocache.txt', result);

    const end = performance.now();
    const timeSpent = end - start;

    res.send(`Data generated and written to file without cache. Time spent: ${timeSpent} ms`);
});

app.get('/cache', (req, res) => {
    const start = performance.now();

    if (cache) {
        const end = performance.now();
        const timeSpent = end - start;

        return res.send(`Data retrieved from cache. Time spent: ${timeSpent} ms`);
    }

    let result = generateData();

    fs.writeFileSync('data_cache.txt', result);

    cache = result;

    const end = performance.now();
    const timeSpent = end - start;

    res.send(`Data generated, written to file, and cached. Time spent: ${timeSpent} ms`);
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
