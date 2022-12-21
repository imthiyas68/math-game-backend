const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/users');
const http = require('http');
const port = process.env.PORT || 5000;



app = express();




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
