const mongoose = require('mongoose');
const User = mongoose.model('User');

exports.setResult = (req , res) => {
    const {level ,right , wrong} = req.body;
    User.findOneAndUpdate({["scores."+level]:{$lt:right*5}} , {$set:{["scores."+level]:right*5}} , {new:true})
        .then(data => {
            console.log(data);
            return res.status(200).json({scores:data.scores})
        })
        .catch(err => console.log(err));
    // console.log(req.body);
}
