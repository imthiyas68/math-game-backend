const mongoose = require('mongoose');
const User = mongoose.model('User');

exports.setResult = async (req, res) => {
    const { id, level, right, question } = req.body;
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
        const user = await User.find({})
        if (!user) {
            res.status(500).send({ message: 'no user found' })
        } else {
            res.send(user)
        }
    } catch (err) {
        res.status(500).send({ message: err })
    }
}
