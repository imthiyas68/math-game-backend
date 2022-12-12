const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/users');
const { Server } = require('socket.io');
const http = require('http');
const path = require('path')



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
    handleError(err);
}




process.on('unhandledRejection', error => {
    console.log('unhandledRejection', error.message);
});

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(userRoutes);




if (process.env.MODE_ENV === "production") {
    app.use(express.static(path.resolve(__dirname, "../frontend/build")));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
    });
}

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});




const gameRoom = 'gameRoom';
let clients = [[], [], [], [], [], []];
const maxProblems = 100;
// console.log(clients)
const makeProblems = level => {
    const template = [
        {},
        { leftmin: 1, leftmax: 10, rightmin: 1, rightmax: 10 },
        { leftmin: 1, leftmax: 10, rightmin: 10, rightmax: 20 },
        { leftmin: 10, leftmax: 20, rightmin: 10, rightmax: 20 },
        { leftmin: 10, leftmax: 20, rightmin: 20, rightmax: 30 },
        { leftmin: 20, leftmax: 40, rightmin: 20, rightmax: 40 }
    ]
    const problems = [];
    for (let i = 0; i < maxProblems; i++) {
        problems.push([Math.round(Math.random() * (template[level].leftmax - template[level].leftmin) + template[level].leftmin), Math.round(Math.random() * (template[level].rightmax - template[level].rightmin) + template[level].rightmin)]);
    }
    return problems;
}



io.on('connection', socket => {
    console.log(`connection established via id:${socket.id}`);


    /* Enter Game Room */

    socket.on('enteredReadyRoom', data => {


        console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!enteredReadyRoom');
        console.log(data, clients);
        const temp = clients[data.level].filter(item => item.email == data.email);
        if (temp.length > 0) {
            socket.emit('enteredReadyRoom', { clients: clients[data.level], entered: true });
        }
        else {
            if (clients[data.level].length < 5) {
                if (temp.length == 0) {
                    socket.join(gameRoom + data.level);
                    clients[data.level].push({ ...data, wrong: 0, right: 0 });
                    console.log(clients, '----->joined');
                }
                io.to(gameRoom + data.level).emit('enteredReadyRoom', { clients: clients[data.level], entered: true });
            }
            else {
                socket.emit('enteredReadyRoom', { entered: false });
            }
        }
    });

    socket.on('out', data => {
        socket.leave(gameRoom + data.level);
        clients[data.level] = clients[data.level].filter(item => item.email !== data.email);
        io.to(gameRoom + data.level).emit('out', { clients: clients[data.level] });
    });
    socket.on('readyToStart', data => {

        console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!readyToStart');
        console.log(data, clients);
        clients[data.level] = clients[data.level].map(item => item.email == data.email ? { ...item, ready: true } : item);
        io.to(gameRoom + data.level).emit('readyToStart', { clients: clients[data.level] });
    });


    /* Start Game Room*/

    socket.on('getGameInfo', data => {
        console.log(data, clients);
        if (data.problem == true)
            socket.emit('getGameInfo', { clients: clients[data.level], problems: makeProblems(data.level), type: data.type });
        else {
            // console.log(clients)
            socket.emit('getGameInfo', { myInfo: clients[data.level].filter(item => item.email == data.email)[0], type: data.type });
        }
    });

    socket.on('wrong', data => {
        console.log('Wrong socket api is called ---->', data, clients);
        clients[data.level] = clients[data.level].map(item => item.email == data.email ? { ...item, wrong: item.wrong + 1 } : item);
        io.to(gameRoom + data.level).emit('wrong', { clients: clients[data.level] });
    });

    socket.on('right', data => {
        console.log('Right socket api is called ---->', data, clients);
        clients[data.level] = clients[data.level].map(item => item.email == data.email ? { ...item, right: item.right + 1 } : item);
        io.to(gameRoom + data.level).emit('right', { clients: clients[data.level] });
    });


    socket.on('leaveRoom', data => {
        console.log('This is leave Room----->', data, clients);
        clients[data.level] = clients[data.level].filter(item => item.email != data.email);
        socket.leave(gameRoom + data.level);
        // io.to(gameRoom+data.level).emit('leaveRoom' );
    });
});


server.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
