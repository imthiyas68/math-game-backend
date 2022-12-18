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
    console.log(err);
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
const maxProblems = 120;
// console.log(clients)
const makeProblems = level => {
    console.log(typeof level, 72);
    const template = [
        {},
        { leftmin: 0, leftmax: 100, rightmin: 0, rightmax: 20 },
        { leftmin: 1, leftmax: 20, rightmin: 1, rightmax: 20 },
        { leftmin: 1, leftmax: 12, rightmin: 1, rightmax: 12 },
        { leftmin: 2, leftmax: 12, rightmin: 1, rightmax: 12 },
        { leftmin: 1, leftmax: 20, rightmin: 2, rightmax: 3 }
    ]
    const problems = [];
    if (level === 4) {
        for (let i = 0; i < maxProblems; i++) {
            const divisor = Math.round(Math.random() * (template[level].leftmax - template[level].leftmin) + template[level].leftmin)
            problems.push([Math.round(Math.random() * (template[level].leftmax - template[level].leftmin) + template[level].leftmin) * divisor, divisor]);
        }
    } else {
        for (let i = 0; i < maxProblems; i++) {
            problems.push([Math.round(Math.random() * (template[level].leftmax - template[level].leftmin) + template[level].leftmin), Math.round(Math.random() * (template[level].rightmax - template[level].rightmin) + template[level].rightmin)]);
        }
    }
    return problems;
}



io.on('connection', socket => {
    // console.log(`connection established via id:${socket.id}`);


    /* Enter Game Room */

    socket.on('enteredReadyRoom', data => {


        // console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!enteredReadyRoom');
        // console.log(data, clients);
        const temp = clients[data.level].filter(item => item.email == data.email);
        if (temp.length > 0) {
            socket.emit('enteredReadyRoom', { clients: clients[data.level], entered: true });
        }
        else {
            if (clients[data.level].length < 5) {
                if (temp.length == 0) {
                    socket.join(gameRoom + data.level);
                    clients[data.level].push({ ...data, wrong: 0, right: 0 });
                    // console.log(clients, '----->joined');
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
        // console.log(data, clients);
        clients[data.level] = clients[data.level].map(item => item.email == data.email ? { ...item, ready: true } : item);
        io.to(gameRoom + data.level).emit('readyToStart', { clients: clients[data.level] });
    });


    /* Start Game Room*/

    socket.on('getGameInfo', ({ email, level, problem, type }) => {
        // console.log(email, level, clients);
        if (problem == true)
            socket.emit('getGameInfo', { clients: clients[level], problems: makeProblems(level), type: type });
        else {
            socket.emit('getGameInfo', { myInfo: clients[level].filter(item => item.email == email)[0], type: type });
        }
    });

    socket.on('wrong', data => {
        // console.log('Wrong socket api is called ---->', data, clients);
        clients[data.level] = clients[data.level].map(item => item.email == data.email ? { ...item, wrong: item.wrong + 1 } : item);
        io.to(gameRoom + data.level).emit('wrong', { clients: clients[data.level] });
    });

    socket.on('right', data => {
        // console.log('Right socket api is called ---->', data, clients);
        clients[data.level] = clients[data.level].map(item => item.email == data.email ? { ...item, right: item.right + 1 } : item);
        io.to(gameRoom + data.level).emit('right', { clients: clients[data.level] });
    });


    socket.on('leaveRoom', data => {
        // console.log('This is leave Room----->', data, clients);
        clients[data.level] = clients[data.level].filter(item => item.email != data.email);
        socket.leave(gameRoom + data.level);
        // io.to(gameRoom+data.level).emit('leaveRoom' );
    });
});


server.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
