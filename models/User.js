const mongoose = require('mongoose');
const {Schema} = mongoose;

const UserSchema = new Schema({
    fullName:{
        type:String,
        required:[true , "fullname not provided"]
    },
    school:{
        type:String,
        required:[true , "school not provided"]
    },
    age:{
        type:Number,
        required:[true , "age not provided"]
    },
    email:{
        type:String,
        unique:[true , "email already exists in database!"],
        lowercase:true,
        trim:true,
        required:['true' , 'email not provided'],
        validate:{
            validator : function(v){
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message:'{VALUE} is not a valid email'
        }
    },
    country :{
        type:String,
        required:[true , "country not provided"]
    },
    class:{
        type:Number,
        required:[true , "Class not provided"]
    },
    userName:{
        type:String,
        required:[true , "username not provided"]
    },
    role:{
        type:String,
        enum:["normal" , "admin"],
        required:[true , "Please specify user role"]
    },
    password:{
        type:String,
        required:true
    },
    scores:{
        type:[],
        items:{
            type:Number
        },
        maxItems:5,
        minItems:5,
        default:[0,0,0,0,0,0]
    },
    created:{
        type:Date,
        default:Date.now
    }

});


module.exports = mongoose.model("User" , UserSchema);
