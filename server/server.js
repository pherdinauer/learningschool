const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs').promises;
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const app = express();
app.use(cors());
app.use(express.json());

// Array per memorizzare i dati dei video
let videos = [];

// Funzione per creare le cartelle di upload se non esistono
const createUploadDirectories = async () => {
  const dirs = ['uploads/videos', 'uploads/thumbnails'];
  for (const dir of dirs) {
    try {
      await fs.mkdir(dir, { recursive: true });
      console.log(`Directory created: ${dir}`);
    } catch (error) {
      console.error(`Error creating directory ${dir}:`, error);
    }
  }
};

// Configurazione di multer per il caricamento dei file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/videos');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Serve i file statici
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Funzione per generare la thumbnail e ottenere la durata del video
const processVideo = (videoPath, thumbnailPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        count: 1,
        folder: path.dirname(thumbnailPath),
        filename: path.basename(thumbnailPath),
        size: '320x240'
      })
      .ffprobe((err, metadata) => {
        if (err) {
          console.error('Error processing video:', err);
          reject(err);
        } else {
          resolve({
            thumbnailPath: thumbnailPath,
            duration: metadata.format.duration
          });
        }
      });
  });
};

// Funzione per caricare i video esistenti
async function loadExistingVideos() {
  const videoDir = path.join(__dirname, 'uploads', 'videos');
  const thumbnailDir = path.join(__dirname, 'uploads', 'thumbnails');
  
  try {
    const files = await fs.readdir(videoDir);
    for (const file of files) {
      const stats = await fs.stat(path.join(videoDir, file));
      if (stats.isFile()) {
        const videoUrl = `/uploads/videos/${file}`;
        const thumbnailFile = file.replace(path.extname(file), '_thumbnail.png');
        const thumbnailUrl = `/uploads/thumbnails/${thumbnailFile}`;
        const videoPath = path.join(videoDir, file);
        const thumbnailPath = path.join(thumbnailDir, thumbnailFile);
        
        try {
          const { duration } = await processVideo(videoPath, thumbnailPath);
          videos.push({
            id: Date.now() + Math.random(),
            title: path.basename(file, path.extname(file)),
            duration: duration,
            transcript: '',
            videoUrl,
            thumbnailUrl
          });
        } catch (error) {
          console.error(`Error processing video ${file}:`, error);
        }
      }
    }
    console.log(`Loaded ${videos.length} existing videos.`);
  } catch (error) {
    console.error('Error loading existing videos:', error);
  }
}

// Endpoint per ottenere tutti i video
app.get('/videos', (req, res) => {
  console.log('GET /videos - Sending videos:', videos);
  res.json(videos);
});

// Endpoint per il caricamento dei video
app.post('/upload', upload.single('video'), async (req, res) => {
  try {
    const { title, transcript } = req.body;
    const videoFile = req.file;

    if (!videoFile) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    const videoPath = videoFile.path;
    const thumbnailFilename = `${Date.now()}_thumbnail.png`;
    const thumbnailPath = path.join(__dirname, 'uploads', 'thumbnails', thumbnailFilename);

    // Genera la thumbnail e ottiene la durata
    const { duration } = await processVideo(videoPath, thumbnailPath);

    const video = {
      id: Date.now(),
      title,
      duration,
      transcript,
      videoUrl: `/uploads/videos/${videoFile.filename}`,
      thumbnailUrl: `/uploads/thumbnails/${thumbnailFilename}`
    };

    videos.push(video);
    console.log('New video added:', video);
    res.status(200).json(video);
  } catch (error) {
    console.error('Error during file upload:', error);
    res.status(500).json({ error: 'An error occurred during file upload' });
  }
});

// Endpoint per ottenere un video specifico
app.get('/videos/:id', (req, res) => {
  const video = videos.find(v => v.id === parseInt(req.params.id));
  if (video) {
    res.json(video);
  } else {
    res.status(404).json({ error: 'Video not found' });
  }
});

// Endpoint per eliminare un video
app.delete('/videos/:id', (req, res) => {
  const index = videos.findIndex(v => v.id === parseInt(req.params.id));
  if (index !== -1) {
    const video = videos[index];
    // Elimina i file associati
    fs.unlink(path.join(__dirname, video.videoUrl)).catch(console.error);
    fs.unlink(path.join(__dirname, video.thumbnailUrl)).catch(console.error);
    // Rimuovi il video dall'array
    videos.splice(index, 1);
    res.json({ message: 'Video deleted successfully' });
  } else {
    res.status(404).json({ error: 'Video not found' });
  }
});

// Gestione degli errori
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Avvio del server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await createUploadDirectories();
  await loadExistingVideos();
});