require('dotenv').config();
const express = require('express');
const bodyparser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');
const localtunnel = require('localtunnel');

// Global variables

const secret = process.env.SECRET || "secret";
const dbendpoint = process.env.DB_ENDPOINT || "";
const subdomain = process.env.SUBDOMAIN || "lunar-dream-13";
const port = parseInt(process.env.PORT || 3000, 10);

// ---

const app = express();
app.use(cors({
    origin: "https://chat.zalo.me"
}));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

// MongoDB

const client = new MongoClient(dbendpoint);
var collection = null;

(async () => {
    // Database
    console.log("Connecting to database ...");
    try {
        await client.connect();
        console.log("Database connected");
        collection = client.db("mydb").collection("images");
        await collection.createIndex({url: 1}, {unique: true});
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
    // Tunnel
    console.log("Creating tunnel ...");
    const tunnel = await localtunnel({
        port: port,
        subdomain: subdomain
    });
    console.log("Tunnel url:", tunnel.url);
    tunnel.on('close', () => {
        console.log("Tunnel closed");
    });
})();

// Express

app.get('/', (req, res) => res.send("OK"));

/*
Request payload format:
{
    secret: "secret_code",
    data: ["url1", "url2", "url3"]
}
*/

app.post('/', async (req, res) => {
    if (req.body.secret != secret) {
        res.status(400).send();
    } else {
        if (collection != null) {
            res.send();
            try {
                let tags = [];
                let data = req.body.data;
                let date = new Date();
                data.forEach(url => tags.push({
                    updateOne: {
                        filter: {url: url},
                        update: {$setOnInsert: {
                            url: url, 
                            backup: false,
                            date: (date.getUTCMonth() + 1) + "-" + date.getUTCFullYear()
                        }},
                        upsert: true
                    }
                }));
                await collection.bulkWrite(tags);
            } catch (e) {
                console.log(e);
            }
        } else {
            res.status(500).send();
        }
    }
});

app.listen(port, () => console.log(`Listening on port ${port} ...`));
