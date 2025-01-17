import express from "express";
import fs from "fs";
import https from "https";
import OpenAI from "openai";
import { userFromBasicAuth } from "src/middleware";

// Initialize OpenAI API client

const router = express.Router();

let openai: OpenAI;

router.get("/generate-sprite", userFromBasicAuth, async (req, res) => {
  const prompt = (req.query.prompt as string) || "A sprite of a fantasy creature"; // Default prompt if none provided
  openai = openai || new OpenAI({});

  openai.images
    .generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    })
    .then((response) => {
      const imageUrl = response.data[0].url;
      if (!imageUrl) {
        res.status(500).json({ error: "Failed to retrieve image URL" });
        return;
      }
      console.log("Downloading image from URL:", imageUrl);

      // Download the image using https
      https
        .get(imageUrl, (imageResponse) => {
          const data: Buffer[] = [];

          imageResponse.on("data", (chunk) => {
            data.push(chunk);
          });

          imageResponse.on("end", () => {
            const imageBuffer = Buffer.concat(data);

            // Save the image locally
            fs.writeFileSync("image.png", imageBuffer);
            console.log("Image saved locally as 'image.png'");

            // Set CORS headers
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Content-Type", "application/json");

            // Send the image as a base64 data URL
            res.json({ imageUrl: `data:image/png;base64,${imageBuffer.toString("base64")}` });
          });
        })
        .on("error", (error) => {
          console.error("Error downloading image:", error.message);
          res.status(500).json({ error: "Failed to download image" });
        });
    })
    .catch((error) => {
      console.error(
        "Error generating image:",
        error.response ? error.response.data : error.message,
      );
      res.status(500).json({ error: "Failed to generate image" });
    });
});

export default router;
