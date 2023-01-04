const mongoose = require('mongoose');
const Game = require('../models/Game');
const User = mongoose.model('User');

exports.setResult = async (req, res) => {
    const { id, level, right, question, gameId, fullName, email, country } = req.body;
    const newGame = new Game({
        gameId, fullName, email, country, right, question, level
    })

    try {
        await newGame.save();
        // console.log(req.body);
        try {
            const user = await User.findOne({ _id: mongoose.Types.ObjectId(id) })
            user.scores['lev' + level].value.push(right)
            user.scores['lev' + level].question.push(question)
            // console.log(user.scores);
            try {
                await user.save()
                res.send(user)
            } catch (err) {
                res.status(500).send({ message: err })
            }
        } catch (err) {
            res.status(500).send({ message: err })
        }
    } catch (err) {
        res.status(500).send({ message: err })
    }
}

exports.result = async (req, res) => {
    const { id } = req.params;
    console.log(id, 'game controller');
    try {
        const user = await User.findOne({ _id: mongoose.Types.ObjectId(id) })
        console.log(user.fullName, 'game con 2');
        if (!user) {
            res.status(500).send({ message: 'no user found' })
        } else {
            res.send(user.scores)
        }
    } catch (err) {
        // console.log(err);
        res.status(500).send({ message: err })
    }
}

exports.allUsers = async (req, res) => {
    try {
        const user = await User.find({}).select({ "fullName": 1, "email": 1, "scores": 1 })
        console.log(user);
        if (!user) {
            res.status(500).send({ message: 'no user found' })
        } else {
            res.send(user)
        }
    } catch (err) {
        res.status(500).send({ message: err })
    }
}


exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    // console.log(id);
    try {
        const user = await User.deleteOne({ _id: mongoose.Types.ObjectId(id) })
        if (!user.acknowledged) {
            res.status(500).send({ message: 'no user found' })
        } else {
            res.send(user)
        }
    } catch (err) {
        res.status(500).send({ message: err })
    }
}

exports.gameScore = async (req, res) => {
    const { id } = req.params;
    // console.log(id);
    try {
        const games = await Game.find({ gameId: id })
        res.send(games)
    } catch (err) {
        res.status(500).send({ message: err })
    }
}

exports.resetResult = async (req, res) => {
    const { id, email } = req.body;
    // console.log(req.body);
    try {
        const game = await Game.deleteMany({ email: email })
        if (!game.acknowledged) {
            res.status(500).send({ message: 'no user found' })
        } else {
            const user = await User.findOne({ _id: mongoose.Types.ObjectId(id) })
            user.scores.lev1.value = []
            user.scores.lev1.question = []
            user.scores.lev2.value = []
            user.scores.lev2.question = []
            user.scores.lev3.value = []
            user.scores.lev3.question = []
            user.scores.lev4.value = []
            user.scores.lev4.question = []
            user.scores.lev5.value = []
            user.scores.lev5.question = []
            // console.log(user.scores);
            try {
                await user.save()
                res.send(user)
            } catch (err) {
                res.status(500).send({ message: err })
            }
        }

    } catch (err) {
        res.status(500).send({ message: err })
    }


}
