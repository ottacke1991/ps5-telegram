const mongoose = require('mongoose')
const Schema = mongoose.Schema

const newsSchema = new Schema(
    {
        user: {type: Schema.Types.Mixed, required: true}
    }

)


module.exports = mongoose.model("userList", newsSchema)