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
        console.log(err);
        res.status(500).send({ message: err })
    }
}

const usePages = {
    pages: 1,
    setPages: function (data) { this.pages = data },
    filter: {},
    setFilter: function (data) { this.filter = data }
}

exports.allUsers = async (req, res) => {
    const { page, limit } = req.query;
    const { keyword } = req.body;
    // console.log(keyword, page, limit);
    if (keyword) {
        usePages.setFilter({ "email": { $regex: keyword } })
    }
    if (!keyword) {
        usePages.setFilter({})
    }
    usePages.setPages(page)
    try {
        const data = await User.find(usePages.filter).select({ "fullName": 1, "email": 1, "scores": 1 })
        // console.log(data);
        const totalItemsNumber = data.length;
        const num_pages = Math.ceil(totalItemsNumber / limit);
        if (usePages.pages > num_pages) {
            usePages.setPages(num_pages)
        }
        const lowerLimit = usePages.pages * limit - limit;
        const upperLimit = usePages.pages * limit;
        const items = data.slice(lowerLimit, upperLimit)
        if (!data) {
            res.status(500).send({ message: 'no user found' })
        } else {
            res.send({
                "list": items,
                "num_pages": num_pages,
                "page": parseInt(usePages.pages),
                "limit": parseInt(limit)
            })
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

exports.fame = async (req, res) => {
    try {
        const user = await User.find({})
        // console.log('total users', user);
        const nonZeroUsers = user.filter(item => item.scores.lev1.value.reduce((a, b) => a + b, 0) > 0 ||
            item.scores.lev2.value.reduce((a, b) => a + b, 0) ||
            item.scores.lev3.value.reduce((a, b) => a + b, 0) ||
            item.scores.lev4.value.reduce((a, b) => a + b, 0) ||
            item.scores.lev5.value.reduce((a, b) => a + b, 0))
        // console.log('filtered', nonZeroUsers);
        let result = nonZeroUsers.map(item => {
            return {
                fullName: item.fullName,
                email: item.email,
                games: item.scores.lev1.value.length + item.scores.lev2.value.length + item.scores.lev3.value.length + item.scores.lev4.value.length + item.scores.lev5.value.length,
                scores: item.scores.lev1.value.reduce((a, b) => a + b, 0) + item.scores.lev2.value.reduce((a, b) => a + b, 0) + item.scores.lev3.value.reduce((a, b) => a + b, 0) + item.scores.lev4.value.reduce((a, b) => a + b, 0) + item.scores.lev5.value.reduce((a, b) => a + b, 0)
            }
        })
        // console.log(result);



        res.send(result)



    } catch (err) {
        res.status(500).send({ message: err })
    }


}
