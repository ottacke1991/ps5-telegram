const mongoose = require('mongoose')
const Schema = mongoose.Schema

const newsSchema = new Schema(
    {
        uid: {type: Schema.Types.Mixed, required: true},
        userData: {type: Schema.Types.Mixed, required: true}
    }

)


module.exports = mongoose.model("userList", newsSchema)