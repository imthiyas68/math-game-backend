const mongoose = require('mongoose');
const User = mongoose.model('User');

exports.setResult = async (req, res) => {
    const { id, level, right, accuracy } = req.body;
    // console.log(req.body);
    try {
        const user = await User.findOne({ _id: mongoose.Types.ObjectId(id) })
        user.scores['lev' + level].value.push(right)
        user.scores['lev' + level].accuracy.push(accuracy)
        // console.log(user.scores);
        try {
            await user.save()
            res.send('success')
        } catch (err) {
            res.status(500).send({ message: err })
        }
    } catch (err) {
        res.status(500).send({ message: err })
    }

}

exports.result = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findOne({ _id: mongoose.Types.ObjectId(id) })
        // console.log(user);
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
