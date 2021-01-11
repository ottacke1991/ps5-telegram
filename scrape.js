const puppeteer = require('puppeteer-extra')

// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
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
    headless: true,
    //defaultViewport: null,
    args: [
        "--disable-notifications",
       // '--disable-http2',
    //    "--incognito",
        "--no-sandbox",
        '--proxy-server=http://91.215.87.193:8000',
       // '--proxy-server="direct://"',
     //   '--proxy-bypass-list=*',
        '--disable-setuid-sandbox',
       // "--single-process",
        "--no-zygote",
        '--disable-web-security', '--disable-features=IsolateOrigins,site-per-process'
    ],
};



let scrapeEldo = async () => {
    const moment = require('moment');
    // Включаем Puppeteer
    const browser = await puppeteer.launch(chromeOptions);

    const page = await browser.newPage();
    await page.authenticate({
        username: 'MxWwwE',
        password: 'yQv9EQ',
    });
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'ru-RU,ru;q=0.9'
    });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 YaBrowser/20.7.1.70 Yowser/2.5 Yptp/1.23 Safari/537.36');
   // await page.setViewport({ width: 800, height: 600 })
    await page.goto(eldoDisc, {'timeout': 100000, 'waitUntil':'load'})
   // click по выбору региона
    await page.waitForSelector("body > header > div.headerPanel.q-headerPanel.wish-list-item-visible > div > div.headerRegion.gg > a > span", {'timeout': 100000, 'waitUntil':'load'}).then(() => {
        console.log('city name found')
    })

    await page.click("body > header > div.headerPanel.q-headerPanel.wish-list-item-visible > div > div.headerRegion.gg > a > span")

    // //выбор самара
    // await page.waitForSelector("iframe");
    await page.waitForSelector("body > div._54mt-Kv > div > div:nth-child(3) > div > div > span:nth-child(6)").then(() => console.log('got it'));
    await page.click("body > div._54mt-Kv > div > div:nth-child(3) > div > div > span:nth-child(6)")
    // //Ждем загрузку имени региона для добавления в обьект
    await page.waitForSelector('body > header > div.headerPanel.q-headerPanel.wish-list-item-visible > div > div.headerRegion.gg > a > span').then(() => console.log('got it'));

    // Код для скрапинга
    const result = await page.evaluate(async (page) => {
        let newCheckObj = {}

        let addToBasket = document.querySelector('.gtmAddToBasket')
        let city = document.querySelector('.headerRegionName').innerText


        newCheckObj.shop = 'Эльдорадо'
        newCheckObj.city = city
        newCheckObj.psVersion = true

        if (addToBasket) {
            newCheckObj.available  = true
        } else {
            newCheckObj.available  = false
        }

        return newCheckObj
    })



    result.curDate = moment().tz("Europe/Moscow").format('MMMM Do YYYY, h:mm:ss a')
    await browser.close();

    // Работа с бд


    return result
};

let scrapeEldoDE = async () => {
    const moment = require('moment');
    // Включаем Puppeteer
    const browser = await puppeteer.launch(chromeOptions);

    const page = await browser.newPage();
    await page.authenticate({
        username: 'MxWwwE',
        password: 'yQv9EQ',
    });
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'ru-RU,ru;q=0.9'
    });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 YaBrowser/20.7.1.70 Yowser/2.5 Yptp/1.23 Safari/537.36');
    // await page.setViewport({ width: 800, height: 600 })
    await page.goto(eldoDE, {'timeout': 100000, 'waitUntil':'load'})
    // click по выбору региона
    await page.waitForSelector("body > header > div.headerPanel.q-headerPanel.wish-list-item-visible > div > div.headerRegion.gg > a > span", {'timeout': 100000, 'waitUntil':'load'}).then(() => {
        console.log('city name found')
    })

    await page.click("body > header > div.headerPanel.q-headerPanel.wish-list-item-visible > div > div.headerRegion.gg > a > span")
    // //выбор самара
    // await page.waitForSelector("iframe");
    await page.waitForSelector("body > div._54mt-Kv > div > div:nth-child(3) > div > div > span:nth-child(6)").then(() => console.log('got it'));
    await page.click("body > div._54mt-Kv > div > div:nth-child(3) > div > div > span:nth-child(6)")
    // //Ждем загрузку имени региона для добавления в обьект
    await page.waitForSelector('body > header > div.headerPanel.q-headerPanel.wish-list-item-visible > div > div.headerRegion.gg > a > span').then(() => console.log('got it'));

    // Код для скрапинга
    const result = await page.evaluate(async (page) => {
        let newCheckObj = {}

        let addToBasket = document.querySelector('.gtmAddToBasket')
        let city = document.querySelector('.headerRegionName').innerText


        newCheckObj.shop = 'Эльдорадо'
        newCheckObj.city = city
        newCheckObj.psVersion = false

        if (addToBasket) {
            newCheckObj.available  = true
        } else {
            newCheckObj.available  = false
        }

        return newCheckObj
    })



    result.curDate = moment().tz("Europe/Moscow").format('MMMM Do YYYY, h:mm:ss a')
    await browser.close();

    // Работа с бд


    return result
};

schedule.scheduleJob("*/15 * * * *",(async function () {
    const psSchema = require('./schemas/psSchema')

    let resultObj ={}
    await scrapeEldo().then((value) => {
        resultObj.eldoDisc =value
    })

    // await scrapePika().then((value) => {
    //     resultObj.eldoDisc =value
    // })
    await scrapeEldoDE().then((value) => {
        resultObj.eldoDE =value
    })

     mongoose.connection.db.dropCollection('psshopstats', function(err, result) {});
     const newPsSchema = new psSchema
     newPsSchema.shopStats = resultObj
     newPsSchema.save().catch( err => console.log(err))
    console.log('pushed to MongoDB')

}))

app.listen(port, () => console.log(`app listening on port ${port}!`))


