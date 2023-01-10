const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/users');
const http = require("http");
const https = require('https');
const port = process.env.PORT || 5000;
const fs = require('fs');



const app = express();




require('dotenv')
    .config();


try {
    mongoose.connect(process.env.MONGOURI, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    }, () => {
        console.log("MongoDB connected");
    });
} catch (err) {
    console.log(err);
}


mongoose.connection.on('connected', () => console.log('Connected'));
mongoose.connection.on('error', (err) => console.log('Connection failed with - ', err));



process.on('unhandledRejection', error => {
    console.log('unhandledRejection', error.message);
});

var whitelist = ['http://localhost:3000', 'https://game.math-ib.com', 'http://game.math-ib.com']
var corsOptionsDelegate = function (req, callback) {
    var corsOptions;
    if (whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
    } else {
        corsOptions = { origin: false } // disable CORS for this request
    }
    callback(null, corsOptions) // callback expects two parameters: error and options
}

app.use(cors(corsOptionsDelegate));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(userRoutes);


const server = http.createServer(app);


server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// httpsServer = https.createServer(cred, app)
// httpsServer.listen(8443)

https
    .createServer({
        key: fs.readFileSync("key.pem"),
        cert: fs.readFileSync("cert.pem"),
    }, app)
    .listen(8443, () => {
        console.log('server is runing at port 8443')
    });