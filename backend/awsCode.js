const express = require('express')
const app = express()
const port = 5000
const cors = require('cors')
const multer = require('multer')
const { S3Client, GetObjectCommand, PutObjectCommand} = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const { default: mongoose } = require('mongoose')
const upload = multer({ dest: 'uploads/' });
app.use(cors({
  origin: 'http://localhost:3000', 
  methods: ['GET', 'PUT'], 
  allowedHeaders: ['Content-Type', 'Authorization'], 
}));


mongoose.connect('mongodb://localhost:27017/imagedata');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Create a Mongoose schema for storing URLs
const urlSchema = new mongoose.Schema({
  url: String
});
const UrlModel = mongoose.model('Url', urlSchema);



const s3Client = new S3Client({
   region: 'us-east-1',
   credentials: {
      accessKeyId: "<add key> AKIATZBCHIS6562VQ46",
      secretAccessKey: "<add secretAccessKey> Nk+X8SanSNyyRjN0RMWMd+jDySkvGtEWmX6cB+M"
   }
})

async function getObjectURL(key){
  const command = new GetObjectCommand({
    Bucket: "imageupload-pr",
    Key: key
  })
  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn: 900 });
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return null;
  }
}

app.get('/',  async(req, res) => {
  let url = await getObjectURL("AB.png", "image/png")
})

async function postObjectURL(filename, contentType){
    
  const command = new PutObjectCommand({
    Bucket: "imageupload-pr",
    Key: filename,
    ContentType: contentType
  })
  try {
    // Generate a signed URL valid for 15 minutes
    const url = await getSignedUrl(s3Client, command, { expiresIn: 900 });
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return null;
  }
}

app.put('/fileposturl', upload.single('file'),  async(req, res) => {
  console.log("req.file:", req.file); // File information
  console.log("req.body:", req.body); // Other form data
     let url = await postObjectURL(req.file.originalname, req.file.mimetype)

     const newUrl = new UrlModel({ url });
     await newUrl.save();
     res.send(url)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


app.get('/allurls', async (req, res) => {
  try {
    const allUrls = await UrlModel.find(); // Fetch all documents from the 'Url' collection
    res.json(allUrls); // Send the retrieved data as JSON response
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' }); // Handle error response
  }
});
