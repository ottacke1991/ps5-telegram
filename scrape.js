const puppeteer = require('puppeteer');
const schedule = require('node-schedule');
const mongoose = require('mongoose')
require("dotenv").config()
const port = process.env.PORT || 3131
const mongoURI = process.env.MONGOURI
const eldoDisc = process.env.ps5_eldo_disc
const eldoDE = process.env.ps5_eldo_DE

const express = require('express')
const app = express()

mongoose
    .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch( err => console.log(err))





const chromeOptions = {
    headless: false,
    //defaultViewport: null,
    args: [
        "--disable-notifications",
    //    "--incognito",
        "--no-sandbox",
        //"--single-process",
        //"--no-zygote"
    ],
};

let scrapeEldo = async () => {
    const moment = require('moment');

    // Включаем Puppeteer
    const browser = await puppeteer.launch(chromeOptions);
    const page = await browser.newPage();
    await page.goto(eldoDisc);
    // click по выбору региона
    await page.click("body > header > div.headerPanel.q-headerPanel.wish-list-item-visible > div > div.headerRegion.gg > a > span")
    //выбор самара
    await page.waitForSelector("body > div._54mt-Kv > div > div:nth-child(3) > div > div > span:nth-child(7)")
    await page.click("body > div._54mt-Kv > div > div:nth-child(3) > div > div > span:nth-child(7)")
    //Ждем загрузку имени региона для добавления в обьект
    await page.waitForSelector('.headerRegionName')

    // Код для скрапинга
    const result = await page.evaluate(async () => {
        let newCheckObj = {}

        let addToBasket = document.querySelector('.gtmAddToBasket')
        let city = document.querySelector('.headerRegionName').innerText


        newCheckObj.shop = 'Эльдорадо'
        newCheckObj.city = city
        newCheckObj.psVersion = 'true'

        if (addToBasket) {
            newCheckObj.available  = true
        } else {
            newCheckObj.available  = false
        }

        return newCheckObj
    })



    result.curDate = moment().format('MMMM Do YYYY, h:mm:ss a')
    await browser.close();

    // Работа с бд


    return result
};

let scrapeEldoDE = async () => {
    const moment = require('moment');

    // Включаем Puppeteer
    const browser = await puppeteer.launch(chromeOptions);
    const page = await browser.newPage();
    await page.goto(eldoDE);
    // click по выбору региона
    await page.click("body > header > div.headerPanel.q-headerPanel.wish-list-item-visible > div > div.headerRegion.gg > a > span")
    //выбор самара
    await page.waitForSelector("body > div._54mt-Kv > div > div:nth-child(3) > div > div > span:nth-child(7)")
    await page.click("body > div._54mt-Kv > div > div:nth-child(3) > div > div > span:nth-child(7)")
    //Ждем загрузку имени региона для добавления в обьект
    await page.waitForSelector('.headerRegionName')

    // Код для скрапинга
    const result = await page.evaluate(async () => {
        let newCheckObj = {}

        let addToBasket = document.querySelector('.gtmAddToBasket')
        let city = document.querySelector('.headerRegionName').innerText


        newCheckObj.shop = 'Эльдорадо'
        newCheckObj.city = city
        newCheckObj.psVersion = 'false'

        if (addToBasket) {
            newCheckObj.available  = true
        } else {
            newCheckObj.available  = false
        }

        return newCheckObj
    })



    result.curDate = moment().format('MMMM Do YYYY, h:mm:ss a')
    await browser.close();


    return result
};

schedule.scheduleJob("*/5 * * * *",(async function () {
    const psSchema = require('./schemas/psSchema')

    let resultObj ={}
    await scrapeEldo().then((value) => {
        resultObj.eldoDisc =value
    })
    await scrapeEldoDE().then((value) => {
        resultObj.eldoDE =value
    })

    mongoose.connection.db.dropCollection('psshopstats', function(err, result) {});
    const newPsSchema = new psSchema
    newPsSchema.shopStats = resultObj
    newPsSchema.save().catch( err => console.log(err))

}))

app.listen(port, () => console.log(`app listening on port ${port}!`))


