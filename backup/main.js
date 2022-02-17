require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Global variables

const dbendpoint = process.env.DB_ENDPOINT || "";
const data_dir = process.env.DATA_DIR || "/tmp/data";
const delay = parseInt(process.env.DELAY || 60, 10);
const limit = parseInt(process.env.LIMIT || 10, 10);

// ---

fs.mkdir(data_dir, { recursive: true }, (err) => {});

// Utilities functions

function doRequest(url, method, callback) {
    return new Promise((resolve, reject) => {
        if (method == "http") {
            http.get(url, (res) => {
                callback(res);
                resolve();
            });
        } else {
            https.get(url, (res) => {
                callback(res);
                resolve();
            })
        }
    })
}

async function download_file(url, tag="default") {
    if (url.startsWith("http")) {
        let parent_dir = path.join(data_dir, tag);
        fs.mkdir(parent_dir, { recursive: true }, (err) => {});
        let file_name = url.split('/').pop();
        let file = fs.createWriteStream(path.join(parent_dir, file_name));
        if (url.startsWith("https")) {
            await doRequest(url, 'https', (res) => res.pipe(file));
        } else {
            await doRequest(url, 'http', (res) => res.pipe(file));
        }
    }
}

// MongoDB

const client = new MongoClient(dbendpoint);
var collection = null;

(async () => {
    console.log("Connecting to database ...");
    try {
        await client.connect();
        console.log("Database connected");
        collection = client.db("mydb").collection("images");
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();

// Main

async function doTask() {
    try {
        console.log("Backing up ...");
        let res = await collection.find({
            backup: false
        }).limit(limit).toArray();
        let urls = [];
        for await (const v of res) {
            urls.push(v.url);
            await download_file(v.url, v.date);
        }
        await collection.updateMany({
            url: { $in: urls }
        }, {
            $set: { backup: true }
        });
    } catch (e) {
        console.log(e);
    }
}


setInterval(() => {
    (async () => {
        await doTask();
    })();
}, delay * 1000);
