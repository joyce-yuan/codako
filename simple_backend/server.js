const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const port = 5001;
const OpenAI = require('openai');
const https = require('https');

// Initialize OpenAI API client
const openai = new OpenAI({});

// Use CORS middleware
app.use(cors());

// Endpoint to generate an image using OpenAI
app.get('/generate-sprite', (req, res) => {
  const prompt = req.query.prompt || "A sprite of a fantasy creature"; // Default prompt if none provided

  openai.images.generate({
    model: "dall-e-3",
    prompt: prompt,
    n: 1,
    size: "1024x1024",
  })
  .then(response => {
    const imageUrl = response.data[0].url;
    console.log("Downloading image from URL:", imageUrl);

    // Download the image using https
    https.get(imageUrl, (imageResponse) => {
      const data = [];

      imageResponse.on('data', (chunk) => {
        data.push(chunk);
      });

      imageResponse.on('end', () => {
        const imageBuffer = Buffer.concat(data);

        // Save the image locally
        fs.writeFileSync('image.png', imageBuffer);
        console.log("Image saved locally as 'image.png'");

        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json');

        // Send the image as a base64 data URL
        res.json({ imageUrl: `data:image/png;base64,${imageBuffer.toString('base64')}` });
      });
    }).on('error', (error) => {
      console.error("Error downloading image:", error.message);
      res.status(500).json({ error: "Failed to download image" });
    });
  })
  .catch(error => {
    console.error("Error generating image:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Failed to generate image" });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});