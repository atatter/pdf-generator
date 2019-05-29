const fs = require('fs');
const path = require('path');
const util = require('util');
const express = require('express');
const handlebars = require('handlebars');
const puppeteer = require('puppeteer');
const app = express();
const readFile = util.promisify(fs.readFile)

const createHtml = async () => {
    try {
        const data = {
            test: 'Test data!',
        };

        const templatePath = path.resolve('pdf.html');
        const content = await readFile(templatePath, 'utf8');
        const template = handlebars.compile(content);

        return template(data);
    } catch (error) {
        throw new Error('Cannot create HTML template.');
    }
  }

const createPdf = async () => {
    const html = await createHtml();
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const options = {
        path: 'generated-pdf.pdf',
        format: 'A4',
    };

    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await page.pdf(options);
    await browser.close();
};

app.get('/', async (_, res) => {
    try {
        await createPdf();
        res.download(`${__dirname}/generated-pdf.pdf`, 'the-real-pdf.pdf');
    } catch (e) {
        res.status(500).send({ error: e });
    }
});

app.listen(8088);
