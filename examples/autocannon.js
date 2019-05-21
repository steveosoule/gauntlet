const autocannon = require('autocannon');
const { logJSON } = require('../helpers');

autocannon({
    url: 'http://www.example.com/',
    connections: 10, //default
    pipelining: 1, // default
    duration: 10 // default
}, function (err, results){
    logJSON('results/autocannon.json', results);
})