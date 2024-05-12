const express = require('express');
const app = express();
const port = 5000;
const cors = require('cors');
const multer = require('multer');
const mongoose = require('mongoose');
app.use('/uploads', express.static('uploads'));

app.use(cors({
  origin: 'http://localhost:3000', 
  methods: ['GET', 'PUT', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'], 
}));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, './uploads'); 
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`); 
  }
});


const upload = multer({ storage });

mongoose.connect('mongodb://localhost:27017/imagedata');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const imageSchema = new mongoose.Schema({
  filename: String,
  contentType: String,
  data: Buffer, 
  imageUrl: String 
});
const ImageModel = mongoose.model('Image', imageSchema);

app.post('/upload', upload.single('file'), async (req, res) => {
  console.log("req.file:", req.file); 
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }
    const newImage = new ImageModel({
      filename: req.file.originalname,
      contentType: req.file.mimetype,
      data: req.file.buffer,
      imageUrl: `http://localhost:${port}/${req.file.path}`
    });

    await newImage.save();
    
    res.status(200).json({ message: 'File uploaded successfully', image: newImage });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/images', async (req, res) => {
  try {
    const allImages = await ImageModel.find();
    res.json(allImages);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
