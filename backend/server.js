const express = require("express");
const multer = require("multer");
const cors = require("cors");
const dotenv = require("dotenv");

const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command
} = require("@aws-sdk/client-s3");


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage()
});

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Upload file
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file selected"
      });
    }

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `uploads/${req.file.originalname}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    });

    await s3.send(command);

    res.json({
      message: "File uploaded successfully",
      fileName: req.file.originalname
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "File upload failed"
    });
  }
});

// Download file
app.get("/download/:fileName", async (req, res) => {
  try {
    const fileName = req.params.fileName;

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `uploads/${fileName}`
    });

    const response = await s3.send(command);

    res.attachment(fileName);

    response.Body.pipe(res);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "File download failed"
    });
  }
});

// List files
app.get("/files", async (req, res) => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_BUCKET_NAME,
      Prefix: "uploads/"
    });

    const response = await s3.send(command);

    const files = (response.Contents || []).map((file) => ({
      fileName: file.Key.replace("uploads/", ""),
      size: file.Size,
      lastModified: file.LastModified
    }));

    res.json(files);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to list files"
    });
  }
});

// Home route
app.get("/", (req, res) => {
  res.send("INIB Cloud Storage API is running");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});