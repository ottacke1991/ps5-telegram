const puppeteer = require('puppeteer-extra')
//OZON ADDED
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
const ozon = process.env.ozon
let mvideo = null
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

let scrapeOzon = async () => {
    const moment = require('moment');
    let newCheckObj = {}
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
    await page.goto(ozon, {'timeout': 100000, 'waitUntil':'load'})


    await page.waitForSelector("#__ozon > div > div.a4e4.undefined > div.container.b6e3 > div:nth-child(2) > div:nth-child(1) > aside > div:nth-child(3) > div.b7n1", {'timeout': 100000, 'waitUntil':'load'}).then(() => {
        console.log('ozon price founnd')
    })
    newCheckObj.curDate = moment().tz("Europe/Moscow").format('MMMM Do YYYY, h:mm:ss a')
    const found = (await page.content()).match(/Игровая консоль PlayStation 5, белый/gi)
    if(found){
        console.log('!!!!!found нашел консоль на озоне !!!!! ' + found)
        newCheckObj.found = found
        newCheckObj.foundStatus = true
    } else {
        newCheckObj.foundStatus = false
        newCheckObj.found = 'Консоль не найдена'
    }


    // result.curDate = moment().tz("Europe/Moscow").format('MMMM Do YYYY, h:mm:ss a')
    await browser.close();

    // Работа с бд


    return newCheckObj
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
    let isAvalible = false
    try {
        await page.waitForSelector('#showcase > div > div.bottomBlockContentRight > div.buyBox.buyBoxCorners > div > div.priceContainerInner > div.gs-avail-sub.comparing_unit.top > a', { timeout: 50000 })

    } catch (error) {
        isAvalible = true
    }

    console.log(isAvalible + 'DOSTUPNA LI')
    // Код для скрапинга
    const result = await page.evaluate(async (isAvalible) => {
        let newCheckObj = {}


        let city = document.querySelector('.headerRegionName').innerText


        newCheckObj.shop = 'Эльдорадо'
        newCheckObj.city = city
        newCheckObj.psVersion = true

        if (isAvalible) {
            console.log('Судя по всему консолька в наличии')
            let addToBasket = document.querySelector('.gtmAddToBasket')
            if (addToBasket) {
                newCheckObj.available = true
                console.log('!!!!! ВНИМАНИЕ ПРИСТАВКА !!!!!!')
            }
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
    let isAvalible = false
    try {
        await page.waitForSelector('#showcase > div > div.bottomBlockContentRight > div.buyBox.buyBoxCorners > div > div.priceContainerInner > div.gs-avail-sub.comparing_unit.top > a', { timeout: 50000 })
        console.log('проверяем отсутствие корзины')
    } catch (error) {
        isAvalible = true
    }

    console.log(isAvalible + 'DOSTUPNA LI')
    // Код для скрапинга
    const result = await page.evaluate(async (isAvalible) => {
        let newCheckObj = {}

        let city = document.querySelector('.headerRegionName').innerText


        newCheckObj.shop = 'Эльдорадо'
        newCheckObj.city = city
        newCheckObj.psVersion = true

        if (isAvalible) {
            console.log('Судя по всему консолька в наличии')
            let addToBasket = document.querySelector('.gtmAddToBasket')
            if (addToBasket) {
                newCheckObj.available = true
                console.log('!!!!! ВНИМАНИЕ ПРИСТАВКА !!!!!!')
            }
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

schedule.scheduleJob("*/3 * * * *",(async function () {
    const psSchema = require('./schemas/psSchema')

    let resultObj ={}
    await scrapeEldo().then((value) => {
        resultObj.eldoDisc =value
    })


    await scrapeEldoDE().then((value) => {
        resultObj.eldoDE =value
    })

    await scrapeOzon().then((value) => {
            resultObj.Ozon =value
        })


    if (mvideo){
        let mvideoObj= {}
        mvideoObj.city = "Самара"
        mvideoObj.available = true
        resultObj.mvideo = mvideoObj
        mvideo = false

    } else {
        let mvideoObj= {}
        mvideoObj.city = "Самара"
        mvideoObj.available = false
        resultObj.mvideo = mvideoObj
    }

     mongoose.connection.db.dropCollection('psshopstats', function(err, result) {});
     const newPsSchema = new psSchema
     newPsSchema.shopStats = resultObj
     newPsSchema.save().catch( err => console.log(err))
    console.log('pushed to MongoDB')

}))

app.get("/mvideo", (req, res, next) => {
    res.json(["gotcha!"]);
    mvideo = true
    console.log(mvideo +" mvideo ")
});
app.listen(port, () => console.log(`app listening on port ${port}!`))


