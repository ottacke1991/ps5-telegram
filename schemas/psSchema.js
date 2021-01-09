const mongoose = require('mongoose')
const Schema = mongoose.Schema

const newsSchema = new Schema(
    {
    shopStats: {type: Schema.Types.Mixed, required: true}
    }

)


module.exports = mongoose.model("psShopStats", newsSchema)