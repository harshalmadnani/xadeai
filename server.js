const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/render-twitter', async (req, res) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Navigate to X.com
    await page.goto('https://twitter.com', {
      waitUntil: 'networkidle0',
    });

    // Get the rendered content
    const content = await page.content();
    
    await browser.close();
    res.send(content);
  } catch (error) {
    console.error('Error rendering Twitter:', error);
    res.status(500).send('Error rendering Twitter');
  }
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
}); 