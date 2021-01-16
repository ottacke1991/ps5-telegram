const schedule = require('node-schedule');
const Extra = require('telegraf/extra');
const token = '1519168195:AAGFOXzuDGKQmRoBn-KfZjOLLGDTHJKBe8c';
const Telegraf = require('telegraf')
const mongoose = require('mongoose')
const psSchema = require('./schemas/psSchema')
const dataService = require('./dataService');
require("dotenv").config()

const mongoURI = process.env.MONGOURI

mongoose
    .connect(mongoURI, { useNewUrlParser: true , useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch( err => console.log(err))

const bot = new Telegraf(token)

const helpMsg = `Command reference:
/start - Подписаться на обновления о наличии PlayStation 5`;

console.log('bot created')

bot.use(async (ctx, next) => {
    const start = new Date()
    await next()
    const response_time = new Date() - start
    const chat_from = `${ctx.message.chat.first_name} (id: ${ctx.message.chat.id})`
    console.log(`Chat from ${chat_from} (Response Time: ${response_time})`)
})

schedule.scheduleJob("*/3 * * * *",(async function () {
    const objectFromDb = await psSchema.findOne().lean()

    if(objectFromDb.shopStats.eldoDisc.available || objectFromDb.shopStats.eldoDE.available || objectFromDb.shopStats.Ozon.foundStatus){
        const userList = await dataService.loadUsers()
        console.log("STARTING NOTIFY USERS")
        userList.forEach(function (value) {

            bot.telegram.sendMessage(value.uid, `*${objectFromDb.shopStats.eldoDisc.shop} ${objectFromDb.shopStats.eldoDisc.city}*\n`+"=================="+`\n*Sony PlayStation 5 Blu-ray disc*\nДисковод: ${objectFromDb.shopStats.eldoDisc.psVersion ? 'Есть' : 'Нет'}\n`
                +`В наличии: ${objectFromDb.shopStats.eldoDisc.available ? 'Да' : 'Нет'}\nДата последней проверки:  ${objectFromDb.shopStats.eldoDisc.curDate}\n`+
                "=================="+`\n*Sony PlayStation 5 Digital Edition*\nДисковод: ${objectFromDb.shopStats.eldoDE.psVersion ? 'Есть' : 'Нет'}\n`
                +`В наличии: ${objectFromDb.shopStats.eldoDE.available ? 'Да' : 'Нет'}\nДата последней проверки:  ${objectFromDb.shopStats.eldoDE.curDate}\n`+
                "==================\n"+
                `Ozon: ${objectFromDb.shopStats.Ozon.foundStatus ? 'Нашли консоль ' : 'Консоль не найдена'}\n`+
                `Ссылка на поиск Ozon [Ozon.ru](https://www.ozon.ru/category/igry-i-soft-13300/?from_global=true&text=playstation+5)\n`+
                `Количество вариантов консоли на Ozon ${objectFromDb.shopStats.Ozon.foundStatus ? objectFromDb.shopStats.Ozon.found.length : '0' }\n`+
                `Дата последней проверки: ${objectFromDb.shopStats.Ozon.curDate}\n`, Extra.markdown());
        })
    }
}))


bot.command('start', async ctx => {
    let registerInfo = await dataService.registerUser(ctx);
    ctx.reply(registerInfo);
});

bot.hears('проверь ps5', async (ctx) => {
    console.log('can talk')

    try {
        const ozon = process.env.ozon
        const objectFromDb = await psSchema.findOne().lean()
        await ctx.replyWithMarkdown(
            `*${objectFromDb.shopStats.eldoDisc.shop} ${objectFromDb.shopStats.eldoDisc.city}*\n`+"=================="+`\n*Sony PlayStation 5 Blu-ray disc*\nДисковод: ${objectFromDb.shopStats.eldoDisc.psVersion ? 'Есть' : 'Нет'}\n`
            +`В наличии: ${objectFromDb.shopStats.eldoDisc.available ? 'Да' : 'Нет'}\nДата последней проверки:  ${objectFromDb.shopStats.eldoDisc.curDate}\n`+
            "=================="+`\n*Sony PlayStation 5 Digital Edition*\nДисковод: ${objectFromDb.shopStats.eldoDE.psVersion ? 'Есть' : 'Нет'}\n`
            +`В наличии: ${objectFromDb.shopStats.eldoDE.available ? 'Да' : 'Нет'}\nДата последней проверки:  ${objectFromDb.shopStats.eldoDE.curDate}\n`+
            "==================\n"+
            `Ozon: ${objectFromDb.shopStats.Ozon.foundStatus ? 'Нашли консоль ' : 'Консоль не найдена'}\n`+
            `Ссылка на поиск Ozon [Ozon.ru](https://www.ozon.ru/category/igry-i-soft-13300/?from_global=true&text=playstation+5)\n`+
            `Количество вариантов консоли на Ozon ${objectFromDb.shopStats.Ozon.foundStatus ? objectFromDb.shopStats.Ozon.found.length : '0' }\n`+
            `Дата последней проверки: ${objectFromDb.shopStats.Ozon.curDate}\n`


        )
    } catch (err){
        console.log(err)
    }






})


bot.launch()