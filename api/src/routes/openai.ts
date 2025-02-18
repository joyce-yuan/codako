import { createClient } from '@supabase/supabase-js';
import express from "express";
import fs from "fs";
import https from "https";
import multer from 'multer';
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

router.get("/generate-background", userFromBasicAuth, async (req, res) => {
  const prompt = (req.query.prompt as string) || "A fantasy game background scene"; // Default prompt if none provided
  const filename = (req.query.filename as string) || "background"; // Default filename if none provided
  openai = openai || new OpenAI({});

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `A wide landscape game background scene: ${prompt}. Make it suitable for a 2D game background, with good depth and atmosphere.`,
      n: 1,
      size: "1792x1024",
    });

    const imageUrl = response.data[0].url;
    if (!imageUrl) {
      res.status(500).json({ error: "Failed to retrieve image URL" });
      return;
    }
    console.log("Downloading background image from URL:", imageUrl);

    // Download the image using https
    https.get(imageUrl, (imageResponse) => {
      const data: Buffer[] = [];

      imageResponse.on("data", (chunk) => {
        data.push(chunk);
      });

      imageResponse.on("end", async () => {
        try {
          const imageBuffer = Buffer.concat(data);

          // Upload the image to Supabase
          const publicUrl = await uploadImageToSupabase(imageBuffer, filename, "image/png");

          console.log("Uploaded to Supabase:", publicUrl);

        // Save the image locally
        // fs.writeFileSync("background.png", imageBuffer);
        // console.log("Background image saved locally as 'background.png'");

        // Set CORS headers
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Content-Type", "application/json");
        res.json({ 
          success: true, 
          message: "Background generated successfully",
          imageUrl: publicUrl
        });
      } catch (err) {
        console.error("Error processing image:", err);
        res.status(500).json({ error: "Failed to process image" });
      }
      });
    }).on("error", (err) => {
      console.error("Error downloading the image:", err);
      res.status(500).json({ error: "Failed to download the image" });
    });
  } catch (error) {
    console.error("Error generating background:", error);
    res.status(500).json({ error: "Failed to generate background" });
  }
});


// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const { buffer, originalname } = file;

    // Upload the image to Supabase Storage
    const { data, error } = await supabase.storage
      .from('background-images') // Replace with your bucket name
      .upload(`backgrounds/${originalname}`, buffer, {
        contentType: file.mimetype,
        upsert: true, // Overwrite if the file already exists
      });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Get the public URL of the uploaded image
    const publicUrl = supabase.storage
      .from('background-images') // Replace with your bucket name
      .getPublicUrl(data.path).data.publicUrl;

    res.json({ publicUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Function to upload image to Supabase
const uploadImageToSupabase = async (imageBuffer: Buffer, filename: string, mimetype: string) => {
  try {
    const { data, error } = await supabase.storage
      .from("background-images") // Change to your Supabase bucket name
      .upload(`backgrounds/${filename}`, imageBuffer, {
        contentType: mimetype,
        upsert: true, // Allow overwriting of existing files
      });

    if (error) {
      console.error("Supabase Upload Error:", error.message);
      throw new Error(error.message);
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from("background-images")
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error("Error uploading to Supabase:", err);
    throw new Error("Failed to upload image to Supabase");
  }
};

export default router;