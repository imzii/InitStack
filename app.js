const express = require('express');
const puppeteer = require('puppeteer');
const dotenv = require('dotenv')

const app = express();

app.use(express.urlencoded({ extended: true }));

dotenv.config();

const { Configuration, OpenAIApi } = require("openai");

const configiration = new Configuration({
    organization: process.env.OPENAI_ORGANIZATION,
    apiKey: process.env.OPENAI_SECRET_KEY,
});

const openai = new OpenAIApi(configiration);

app.get('/wallpaper', async (req, res) => {
  const code = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Write a metaphorical and philosophical 5 to 10 lines of code considering line-break, written in any programming language.
            Do not write more than 30 letters in a single line.
            Specify the language in the form of annotation of the language used.`,
    max_tokens: 500,
  });
  const scaleFactor = 4;
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <link rel="stylesheet"
              href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github-dark.min.css">
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: rgb(20, 20, 20);
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }

          .container {
            display: flex;
            justify-content: center;
            align-items: center;
          }

          pre {
            padding: ${20 * scaleFactor}px;
            overflow: auto;
          }

          code {
            font-family: 'Consolas', monospace;
            font-size: ${20 * scaleFactor}px;
            font-weight: bold;
            border-radius: ${10 * scaleFactor}px;
            box-shadow: 0 ${20 * scaleFactor}px ${68 * scaleFactor}px rgba(0, 0, 0, 0.55);
          }

          .red {
            color: #FF5F56;
          }

          .yellow {
            color: #FFBD2E;
          }

          .green {
            color: #29C93F;
          }

          .circle {
            font-size: ${40 * scaleFactor}px;
            margin-right: ${5 * scaleFactor}px;
          }
        </style>
      </head>
      <body>
        <div class='container'>
          <pre><code>
${code.data.choices[0].text.trim()}
          </code></pre>
        </div>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js"></script>
        <script>
          document.addEventListener('DOMContentLoaded', (event) => {
            document.querySelectorAll('pre code').forEach((block) => {
              const result = hljs.highlightAuto(block.textContent);
              block.innerHTML = result.value;
              block.classList.add('hljs');
            });
          });
        </script>
        <script>
          document.addEventListener('DOMContentLoaded', (event) => {
            document.querySelectorAll('pre code').forEach((block) => {
              block.innerHTML = "<span class='red circle'>●</span><span class='yellow circle'>●</span><span class='green circle'>●</span><br />" + block.innerHTML;
            });
          });
        </script>
      </body>
    </html>
  `;

  // Launch Puppeteer
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Set the viewport size to match your desired wallpaper dimensions
  // Set the deviceScaleFactor to a higher value for high-resolution images (e.g., 2 for 2x resolution)
  await page.setViewport({ width: 1920 * scaleFactor, height: 1080 * scaleFactor, deviceScaleFactor: 2 });

  // Set the HTML content
  await page.setContent(htmlContent);

  // Take a screenshot
  const screenshot = await page.screenshot({ encoding: 'binary' });

  // Close the browser
  await browser.close();

  // Send the screenshot as a response
  res.set('Content-Type', 'image/png');
  res.send(screenshot);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});