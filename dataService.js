const userSchema = require('./schemas/userSchema')
const mongoose = require('mongoose')
require("dotenv").config()
const mongoURI = process.env.MONGOURI

mongoose
    .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Bot connected to MongoDB'))
    .catch( err => console.log('Err mongoDB bot connection'))


function saveUsers(uid, user) {
    const newUserSchema = new userSchema({uid: uid, userData: user})

    newUserSchema.save().catch(err => console.log(err))
    console.log('user pushed')
}

async function registerUser(msg) {
    let uid = msg.chat.id;
    let user = {chat: msg.chat};
    let userList = await loadUsers()
    let userChecked = checkUserRegistration(userList, uid)
    if(userChecked) {
        saveUsers(uid, user);
        let answer = 'Вы подписаны на обновления.'
        return answer
    } else {
        let answer = 'Вы уже были подписаны на обновления.'
        return answer
    }
}

function checkUserRegistration(userList, uid){
    let userState = true
    let loop = false
    userList.forEach(function (value) {
        if(loop) {
            return
        }
        if(value.uid == uid){
            userState = false
            loop = true
        }

    })
    return userState
}
async function loadUsers() {
    let objectFromDb = {}
    objectFromDb = await userSchema.find().lean()
    return objectFromDb
}


module.exports = {
    loadUsers,
    registerUser
};