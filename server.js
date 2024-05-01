#!/usr/bin/env node
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const livereload = require("livereload");
const connectLiveReload = require("connect-livereload");

const PORT = 8886;
const staticFilesDirectory = 'public';
const llamafileBaseUrl = 'http://127.0.0.1:8887';

const liveReloadServer = livereload.createServer();
liveReloadServer.watch(staticFilesDirectory);

const app = express();
app.use(connectLiveReload());
app.use(express.static(staticFilesDirectory));
app.use('/', createProxyMiddleware({ target: llamafileBaseUrl }));
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Serving static files from ${staticFilesDirectory}`);
    console.log(`Proxying API requests to ${llamafileBaseUrl}`);
});
