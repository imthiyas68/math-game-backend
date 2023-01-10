const express = require('express');
const router = express.Router();

const { signin, signup, fileUpload, getFile } = require('../controllers/auth.controller');
const { setResult, result, allUsers, deleteUser, gameScore, resetResult, fame } = require('../controllers/game.controller');
const verifyToken = require('../middlewares/authJWT');


router.post("/register", signup);
router.post("/login", signin);
router.post('/setResult', setResult);
router.get('/result/:id', result)
router.post('/users/pagination', allUsers)
router.delete('/user/:id', deleteUser)
router.get('/game/:id', gameScore)
router.delete('/scores', resetResult)
router.get('/fame', fame)
router.post('/file', fileUpload)
router.get('/file/:fileName', getFile)

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
    res.send({ message: 'api update time 527p09/01' })
})


module.exports = router;
