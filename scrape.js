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
    defaultViewport: null,
    args: [
        "--disable-notifications",
       // '--disable-http2',
    //    "--incognito",
        "--no-sandbox",
       // '--proxy-server="direct://"',
     //   '--proxy-bypass-list=*',
        '--disable-setuid-sandbox',
       // "--single-process",
        "--no-zygote",
    ],
};

let scrapeEldo = async () => {
    const moment = require('moment');
    // Включаем Puppeteer
    const browser = await puppeteer.launch(chromeOptions);
    const page = await browser.newPage();

    await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9'
    });
    // //await page.setUserAgent("Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.1.4322)");
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36');
    await page.setViewport({ width: 800, height: 600 })
    await page.goto('http://www.eldorado.ru')
   // click по выбору региона
    await page.waitForSelector("#__next > div > header > div.sc-14qfeqq-0.bNgeeI > div > div.h8xlw5-0.cddYaE > a > span.h8xlw5-3.kLXpZr").then(() => {
        console.log('city name found')
    })



    const result = await page.evaluate(async () => {

        let html = document.querySelector('#__next > div > header > div.sc-14qfeqq-0.bNgeeI > div > div.h8xlw5-0.cddYaE > a > span.h8xlw5-3.kLXpZr').innerHTML

        return html
    })

    console.log(result + 'innetHTML')
   //  await page.screenshot({path: 'example.png'});


    // click по выбору региона
    // await page.waitForSelector("body > header > div.headerPanel.q-headerPanel.wish-list-item-visible > div > div.headerRegion.gg > a > span").then(() => {
    //     console.log('city name found')
    // })
    // await page.click("body > header > div.headerPanel.q-headerPanel.wish-list-item-visible > div > div.headerRegion.gg > a > span")
    // // //выбор самара
    // await page.waitForSelector("body > div._54mt-Kv > div > div:nth-child(3) > div > div > span:nth-child(7)")
    // await page.click("body > div._54mt-Kv > div > div:nth-child(3) > div > div > span:nth-child(7)")
    // // //Ждем загрузку имени региона для добавления в обьект
    // await page.waitForSelector('body > header > div.headerPanel.q-headerPanel.wish-list-item-visible > div > div.headerRegion.gg > a > span')
    //
    // // Код для скрапинга
    // const result = await page.evaluate(async (page) => {
    //     let newCheckObj = {}
    //
    //     let addToBasket = document.querySelector('.gtmAddToBasket')
    //     let city = document.querySelector('.headerRegionName').innerText
    //
    //
    //     newCheckObj.shop = 'Эльдорадо'
    //     newCheckObj.city = city
    //     newCheckObj.psVersion = 'true'
    //
    //     if (addToBasket) {
    //         newCheckObj.available  = true
    //     } else {
    //         newCheckObj.available  = false
    //     }
    //
    //     return newCheckObj
    // })
    //
    //
    //
    // result.curDate = moment().format('MMMM Do YYYY, h:mm:ss a')
    await browser.close();

    // Работа с бд


    return result
};

let scrapeEldoDE = async () => {
    const moment = require('moment');

    // Включаем Puppeteer
    const browser = await puppeteer.launch(chromeOptions);
    const page = await browser.newPage();
    // await page.setExtraHTTPHeaders({
    //     'Accept-Language': 'en-US,en;q=0.9'
    // });
    // await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36');
    //await page.setUserAgent("Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.1.4322)");

    await page.goto(eldoDE);
    // click по выбору региона
    await page.waitForSelector("body > header > div.headerPanel.q-headerPanel.wish-list-item-visible > div > div.headerRegion.gg > a > span").then(() => {
        console.log('city name found')
    })
    await page.click("body > header > div.headerPanel.q-headerPanel.wish-list-item-visible > div > div.headerRegion.gg > a > span")
    // //выбор самара
    await page.waitForSelector("body > div._54mt-Kv > div > div:nth-child(3) > div > div > span:nth-child(7)")
    await page.click("body > div._54mt-Kv > div > div:nth-child(3) > div > div > span:nth-child(7)")
    // //Ждем загрузку имени региона для добавления в обьект
    await page.waitForSelector('body > header > div.headerPanel.q-headerPanel.wish-list-item-visible > div > div.headerRegion.gg > a > span')


    // Код для скраппинга
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

schedule.scheduleJob("*/1 * * * *",(async function () {
    const psSchema = require('./schemas/psSchema')

    let resultObj ={}
    await scrapeEldo().then((value) => {
        resultObj.eldoDisc =value
    })
    // await scrapeEldoDE().then((value) => {
    //     resultObj.eldoDE =value
    // })

    // mongoose.connection.db.dropCollection('psshopstats', function(err, result) {});
    // const newPsSchema = new psSchema
    // newPsSchema.shopStats = resultObj
    // newPsSchema.save().catch( err => console.log(err))

}))

app.listen(port, () => console.log(`app listening on port ${port}!`))


