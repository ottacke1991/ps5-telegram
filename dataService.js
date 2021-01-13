const userSchema = require('./schemas/userSchema')


function saveUsers(user) {
    const newUserSchema = new userSchema
    newUserSchema.user = user
    newUserSchema.save().catch(err => console.log(err))
    console.log('user pushed')
}

function registerUser(msg) {
    let userObject = {}
    let uid = msg.chat.id;
    let user = {enabled: true, data: {from: msg.from, chat: msg.chat}};
    userObject[uid] = user;
    saveUsers(userObject);
}


module.exports = {
   // loadUsers,
    registerUser
};