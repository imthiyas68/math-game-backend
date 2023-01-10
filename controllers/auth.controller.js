const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { writeFileSync, readFileSync, unlinkSync, writeFile } = require("fs");



exports.signup = async (req, res) => {
    console.log('singup')
    const user = new User({
        fullName: req.body.fullname,
        school: req.body.school,
        email: req.body.email,
        country: req.body.country,
        class: req.body?.classN?.toString(),
        userName: req.body.username,
        scores: req.body.scores,
        role: req.body.role ? req.body.role : 'normal',
        password: bcrypt.hashSync(req.body.password, 8)
    });

    await user.save((err, user) => {
        console.log(err);
        if (err) {
            return res.status(500).send({ message: err });
        }

        else {
            res.status(200).send({ message: "User Registered successfully" });
        }

    });
}


exports.signin = async (req, res) => {
    console.log('signin')
    console.log(req.body);
    try {
        const user = await User.findOne({ userName: req.body.username })
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

        if (!passwordIsValid) {
            return res.status(400).send({ accessToken: null, message: "Invalid Password!" });
        }

        const token = jwt.sign({
            id: user._id,
            email: user.email,
            fullName: user.fullName,
            school: user.school,
            country: user.country,
            class: user.class,
            userName: user.userName,
            role: user.role
        }, process.env.API_SECRET, { expiresIn: 86400 });

        res.status(200).send({
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                school: user.school,
                country: user.country,
                class: user.class,
                userName: user.userName,
                scores: user.scores,
                role: user.role
            },
            message: "Login successfull",
            accessToken: token
        });
    } catch (err) {
        res.status(500).send({ message: err });
    }
}

exports.fileUpload = async (req, res) => {
    const newpath = process.cwd() + "/files/";
    const file = req.body.file;
    const filename = req.body.email + '.png';
    // console.log(file, filename);
    var base64Data = file.replace(/^data:image\/png;base64,/, "");
    writeFile(newpath + filename, base64Data, 'base64', async function (err) {
        if (err) {
            res.status(500).send({ message: "File upload failed", code: 200 });
        }
        try {
            const user = await User.updateOne({ email: req.body.email }, { $set: { avatar: filename } })
            if (!user) {
                return res.status(404).send({ message: "User not found" });
            }
            res.send({ success: true })
        } catch (err) {
            res.status(500).send({ message: err });
        }
    });
}

exports.getFile = async (req, res) => {
    const { fileName } = req.params;
    const file = process.cwd() + "/files/" + fileName + '.png';
    if (file) {
        res.download(file);
    } else {
        res.status(500).send({ message: 'failed' });
    }

}
