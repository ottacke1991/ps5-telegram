
const token = '1519168195:AAGFOXzuDGKQmRoBn-KfZjOLLGDTHJKBe8c';
const Telegraf = require('telegraf')
const mongoose = require('mongoose')
const psSchema = require('./schemas/psSchema')
require("dotenv").config()

const mongoURI = process.env.MONGOURI

mongoose
    .connect(mongoURI, { useNewUrlParser: true , useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch( err => console.log(err))

const bot = new Telegraf(token)
console.log('bot created')
bot.use(async (ctx, next) => {
    const start = new Date()
    await next()
    const response_time = new Date() - start
    const chat_from = `${ctx.message.chat.first_name} (id: ${ctx.message.chat.id})`
    console.log(`Chat from ${chat_from} (Response Time: ${response_time})`)
})

bot.hears('проверь ps5', async (ctx) => {
    console.log('can talk')

    try {
        const objectFromDb = await psSchema.findOne().lean()
        await ctx.replyWithMarkdown(
            `*${objectFromDb.shopStats.eldoDisc.shop} ${objectFromDb.shopStats.eldoDisc.city}*\n`+"=================="+`\nДисковод: ${objectFromDb.shopStats.eldoDisc.psVersion ? 'Есть' : 'Нет'}\n`
            +`В наличии: ${objectFromDb.shopStats.eldoDisc.available ? 'Да' : 'Нет'}\nДата последней проверки:  ${objectFromDb.shopStats.eldoDisc.curDate}\n`+
            "=================="+`\nДисковод: ${objectFromDb.shopStats.eldoDE.psVersion ? 'Есть' : 'Нет'}\n`
            +`В наличии: ${objectFromDb.shopStats.eldoDE.available ? 'Да' : 'Нет'}\nДата последней проверки:  ${objectFromDb.shopStats.eldoDE.curDate}`


        )
    } catch (err){
        console.log(err)
    }






})


bot.launch()