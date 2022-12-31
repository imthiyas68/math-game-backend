const mongoose = require('mongoose');
const { Schema } = mongoose;

const GameSchema = new Schema({
    gameId: {
        type: String,
        required: [true, "gameId is not provided"]
    },
    level: {
        type: Number,
        required: [true, "level is not provided"]
    },
    fullName: {
        type: String,
        required: [true, "fullname not provided"],
    },
    email: {
        type: String,
        trim: true,
        required: [true, 'email not provided'],
    },
    country: {
        type: String,
        required: [true, "country not provided"]
    },
    right: {
        type: Number,
    },
    question: {
        type: Number,
    },
    created: {
        type: Date,
        default: Date.now
    }

});


module.exports = mongoose.model("Game", GameSchema);
