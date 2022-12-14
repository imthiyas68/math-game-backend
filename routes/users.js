const express = require('express');
const router = express.Router();

const { signin, signup } = require('../controllers/auth.controller');
const { setResult } = require('../controllers/game.controller');
const verifyToken = require('../middlewares/authJWT');


router.post("/register", signup, (req, res) => {

});

router.post("/login", signin, (req, res) => {

});
router.post('/setResult', setResult, (req, res) => {

});

router.get('/hiddencontent', verifyToken, (req, res) => {
    if (!req.user) {
        return res.status(403).send({ message: 'Invalid JWT token' });
    }
    if (req.user == 'admin') {
        return res.status(200).send({ message: 'Congratulations! but there is no hidden content' });
    } else {
        return res.status(403).send({ message: 'Unauthorized access' })
    }
});

router.get('/', (req, res) => {
    res.send({ message: 'api update time 1048p14/12' })
})


module.exports = router;
