const express = require('express');
const morgan = require("morgan");
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cache = require('express-redis-cache')({ host: '117.6.134.241', port:8636 });
//var client = cache();
// Create Express Server
const app = express();

//Enable CORS Origin
app.use(cors())

// Configuration
const PORT = 5000;
const HOST = "0.0.0.0";
const API_SERVICE_URL = "https://media.hhmi.org/biointeractive/earthviewer_web";

// Logging
app.use(morgan('dev'));

// Info GET endpoint
app.get('/info', (req, res, next) => {
    res.send('This is a proxy service which proxies to JSONPlaceholder API.');
});

// Authorization
app.use('', (req, res, next) => {
    next();
});

app.use('/',
    function (req, res, next) {
        // set cache name
        let key = '__proxy_cache__' + req.originalUrl || req.url
        res.express_redis_cache_name = key;
        next();
    }, 
    cache.route(),
    createProxyMiddleware({
        target: API_SERVICE_URL,
        changeOrigin: true,
    }));

// Start Proxy
app.listen(PORT, HOST, () => {
    console.log(`Starting Proxy at ${HOST}:${PORT}`);
});


