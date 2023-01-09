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

app.use(cors());

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