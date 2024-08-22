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

// Set per memorizzare tutti i tag unici
let allTags = new Set();

// Funzione per aggiornare allTags
const updateAllTags = (videoTags) => {
  if (Array.isArray(videoTags)) {
    videoTags.forEach(tag => allTags.add(tag));
  }
};

// Funzione per generare ID unici
const generateId = () => Date.now().toString() + Math.random().toString().slice(2);

// Funzione per creare le cartelle di upload se non esistono
const createUploadDirectories = async () => {
  const dirs = ['uploads/videos', 'uploads/thumbnails', 'data'];
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

// Funzione per salvare i dati in un file JSON
const saveData = async () => {
  try {
    await fs.writeFile('data/videos.json', JSON.stringify(videos));
    await fs.writeFile('data/tags.json', JSON.stringify(Array.from(allTags)));
    console.log('Data saved successfully');
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

// Funzione per caricare i dati da file JSON
const loadData = async () => {
  try {
    const videosData = await fs.readFile('data/videos.json', 'utf8');
    const tagsData = await fs.readFile('data/tags.json', 'utf8');
    videos = JSON.parse(videosData);
    allTags = new Set(JSON.parse(tagsData));
    console.log('Data loaded successfully');
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('No existing data found. Starting with empty data.');
      videos = [];
      allTags = new Set();
      // Salva i file vuoti per evitare questo errore in futuro
      await saveData();
    } else {
      console.error('Error loading data:', error);
      // Se c'è un altro tipo di errore, inizializza comunque con array/set vuoti
      videos = [];
      allTags = new Set();
    }
  }
};

// Endpoint per ottenere tutti i video
app.get('/videos', (req, res) => {
  console.log('Richiesta ricevuta per /videos');
  console.log(`Invio di ${videos.length} video`);
  res.json(videos);
});

// Endpoint per il caricamento dei video
app.post('/upload', upload.single('video'), async (req, res) => {
  console.log('Richiesta di upload video ricevuta');
  try {
    const { title, transcript } = req.body;
    let tags = [];
    try {
      tags = JSON.parse(req.body.tags || '[]');
    } catch (error) {
      console.error('Error parsing tags:', error);
    }
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
      id: generateId(),
      title: title || 'Untitled Video',
      duration,
      transcript,
      videoUrl: `/uploads/videos/${videoFile.filename}`,
      thumbnailUrl: `/uploads/thumbnails/${thumbnailFilename}`,
      tags
    };

    videos.push(video);
    updateAllTags(tags);
    await saveData();
    console.log('New video added:', video);
    res.status(200).json(video);
  } catch (error) {
    console.error('Error during file upload:', error);
    res.status(500).json({ error: 'An error occurred during file upload' });
  }
});

// Endpoint per ottenere tutti i tag
app.get('/tags', (req, res) => {
  res.json(Array.from(allTags));
});

// Endpoint per ottenere un video specifico
app.get('/videos/:id', (req, res) => {
  const video = videos.find(v => v.id === req.params.id);
  if (video) {
    res.json(video);
  } else {
    res.status(404).json({ error: 'Video not found' });
  }
});

// Endpoint per aggiornare un video
app.put('/videos/:id', async (req, res) => {
  const { title, transcript, tags } = req.body;
  const videoId = req.params.id;
  const videoIndex = videos.findIndex(v => v.id === videoId);

  if (videoIndex === -1) {
    return res.status(404).json({ error: 'Video not found' });
  }

  videos[videoIndex] = {
    ...videos[videoIndex],
    title: title || videos[videoIndex].title,
    transcript: transcript || videos[videoIndex].transcript,
    tags: tags || videos[videoIndex].tags
  };

  updateAllTags(videos[videoIndex].tags);
  await saveData();
  res.json(videos[videoIndex]);
});

// Endpoint per eliminare un video
app.delete('/videos/:id', async (req, res) => {
  const videoId = req.params.id;
  const videoIndex = videos.findIndex(v => v.id === videoId);

  if (videoIndex === -1) {
    return res.status(404).json({ error: 'Video not found' });
  }

  const video = videos[videoIndex];

  try {
    // Elimina i file associati
    await fs.unlink(path.join(__dirname, video.videoUrl));
    await fs.unlink(path.join(__dirname, video.thumbnailUrl));
    
    // Rimuovi il video dall'array
    videos.splice(videoIndex, 1);
    
    await saveData();
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video files:', error);
    res.status(500).json({ error: 'An error occurred while deleting the video' });
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
  await loadData();
});

// Endpoint forzato per le anteprime
app.get('/preview/:id', (req, res) => {
  const id = req.params.id;
  console.log(`Richiesta anteprima per il video con ID: ${id}`);
  
  // Creiamo un'anteprima fittizia
  const preview = `Questa è un'anteprima fittizia per il video ${id}. In un'implementazione reale, qui ci sarebbe il vero contenuto dell'anteprima.`;
  
  console.log(`Invio anteprima per il video ${id}: ${preview.substring(0, 50)}...`);
  res.json({ preview: preview });
});