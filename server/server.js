const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs").promises;
const ffmpeg = require("fluent-ffmpeg");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const moment = require("moment");

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const app = express();
app.use(cors());
app.use(express.json());

// Array per memorizzare i dati dei video
let videos = [];

// Array per memorizzare i dati delle playlist
let playlists = [];

// Strutture dati per memorizzare le analytics
let videoAnalytics = {};
let userAnalytics = {};

// Funzione per salvare i dati di analytics
const saveAnalyticsData = async () => {
  try {
    await fs.writeFile(
      "data/videoAnalytics.json",
      JSON.stringify(videoAnalytics)
    );
    await fs.writeFile(
      "data/userAnalytics.json",
      JSON.stringify(userAnalytics)
    );
    console.log("Analytics data saved successfully");
  } catch (error) {
    console.error("Error saving analytics data:", error);
  }
};

// Funzione per caricare i dati di analytics
const loadAnalyticsData = async () => {
  try {
    const videoAnalyticsData = await fs.readFile(
      "data/videoAnalytics.json",
      "utf8"
    );
    const userAnalyticsData = await fs.readFile(
      "data/userAnalytics.json",
      "utf8"
    );
    videoAnalytics = JSON.parse(videoAnalyticsData);
    userAnalytics = JSON.parse(userAnalyticsData);
    console.log("Analytics data loaded successfully");
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log(
        "No existing analytics data found. Starting with empty data."
      );
      videoAnalytics = {};
      userAnalytics = {};
      await saveAnalyticsData();
    } else {
      console.error("Error loading analytics data:", error);
      videoAnalytics = {};
      userAnalytics = {};
    }
  }
};

// Funzione per generare ID unici
const generateId = () =>
  Date.now().toString() + Math.random().toString().slice(2);

// Funzione per creare le cartelle di upload se non esistono
const createUploadDirectories = async () => {
  const dirs = ["uploads/videos", "uploads/thumbnails", "data"];
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
    cb(null, "uploads/videos");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Serve i file statici
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Funzione per generare la thumbnail e ottenere la durata del video
const processVideo = (videoPath, thumbnailPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        count: 1,
        folder: path.dirname(thumbnailPath),
        filename: path.basename(thumbnailPath),
        size: "320x240",
      })
      .ffprobe((err, metadata) => {
        if (err) {
          console.error("Error processing video:", err);
          reject(err);
        } else {
          resolve({
            thumbnailPath: thumbnailPath,
            duration: metadata.format.duration,
          });
        }
      });
  });
};

// Funzione per salvare i dati in un file JSON
const saveData = async () => {
  try {
    await fs.writeFile("data/videos.json", JSON.stringify(videos));
    console.log("Data saved successfully");
  } catch (error) {
    console.error("Error saving data:", error);
  }
};

// Funzione per salvare i dati delle playlist
const savePlaylistsData = async () => {
  try {
    await fs.writeFile("data/playlists.json", JSON.stringify(playlists));
    console.log("Playlists data saved successfully");
  } catch (error) {
    console.error("Error saving playlists data:", error);
  }
};

// Funzione per caricare i dati da file JSON
const loadData = async () => {
  try {
    const videosData = await fs.readFile("data/videos.json", "utf8");
    videos = JSON.parse(videosData);
    console.log("Data loaded successfully");
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log("No existing data found. Starting with empty data.");
      videos = [];
      // Salva i file vuoti per evitare questo errore in futuro
      await saveData();
    } else {
      console.error("Error loading data:", error);
      // Se c'è un altro tipo di errore, inizializza comunque con array vuoto
      videos = [];
    }
  }
};

// Funzione per caricare i dati delle playlist
const loadPlaylistsData = async () => {
  try {
    const playlistsData = await fs.readFile("data/playlists.json", "utf8");
    playlists = JSON.parse(playlistsData);
    console.log("Playlists data loaded successfully");
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log(
        "No existing playlists data found. Starting with empty data."
      );
      playlists = [];
      await savePlaylistsData();
    } else {
      console.error("Error loading playlists data:", error);
      playlists = [];
    }
  }
};

// Endpoint per ottenere tutti i video
app.get("/videos", (req, res) => {
  console.log("Richiesta ricevuta per /videos");
  const videosWithValidDates = videos.map(video => ({
    ...video,
    uploadDate: video.uploadDate || new Date().toISOString()
  }));
  console.log(`Invio di ${videosWithValidDates.length} video`);
  res.json(videosWithValidDates);
});

// Endpoint per ottenere tutte le playlist
app.get("/playlists", (req, res) => {
  res.json(playlists);
});

// Endpoint per creare una nuova playlist
app.post("/playlists", async (req, res) => {
  const { name, videos, color } = req.body;
  const newPlaylist = {
    id: generateId(),
    name,
    color,
    videos,
  };
  playlists.push(newPlaylist);
  await savePlaylistsData();
  res.status(201).json(newPlaylist);
});

// Endpoint per aggiornare una playlist
app.put("/playlists/:id", async (req, res) => {
  const { name, videos, color } = req.body;
  const playlistId = req.params.id;
  const playlistIndex = playlists.findIndex((p) => p.id === playlistId);

  if (playlistIndex === -1) {
    return res.status(404).json({ error: "Playlist not found" });
  }

  playlists[playlistIndex] = {
    ...playlists[playlistIndex],
    name: name || playlists[playlistIndex].name,
    color: color || playlists[playlistIndex].color,
    videos: videos || playlists[playlistIndex].videos,
  };

  await savePlaylistsData();
  res.json(playlists[playlistIndex]);
});

// Endpoint per eliminare una playlist
app.delete("/playlists/:id", async (req, res) => {
  const playlistId = req.params.id;
  const playlistIndex = playlists.findIndex((p) => p.id === playlistId);

  if (playlistIndex === -1) {
    return res.status(404).json({ error: "Playlist not found" });
  }

  playlists.splice(playlistIndex, 1);
  await savePlaylistsData();
  res.json({ message: "Playlist deleted successfully" });
});

// Endpoint per il caricamento dei video
app.post("/upload", upload.single("video"), async (req, res) => {
  console.log("Richiesta di upload video ricevuta");
  try {
    const { title, transcript } = req.body;
    let tags = [];
    try {
      tags = JSON.parse(req.body.tags || "[]");
    } catch (error) {
      console.error("Error parsing tags:", error);
    }
    const videoFile = req.file;

    if (!videoFile) {
      return res.status(400).json({ error: "No video file uploaded" });
    }

    const videoPath = videoFile.path;
    const thumbnailFilename = `${Date.now()}_thumbnail.png`;
    const thumbnailPath = path.join(
      __dirname,
      "uploads",
      "thumbnails",
      thumbnailFilename
    );

    // Genera la thumbnail e ottiene la durata
    const { duration } = await processVideo(videoPath, thumbnailPath);

    const video = {
      id: generateId(),
      title: title || "Untitled Video",
      duration,
      transcript,
      videoUrl: `/uploads/videos/${videoFile.filename}`,
      thumbnailUrl: `/uploads/thumbnails/${thumbnailFilename}`,
      tags,
      uploadDate: new Date().toISOString(), // Aggiungi questa riga
    };

    videos.push(video);
    await saveData();
    console.log("New video added:", video);
    res.status(200).json(video);
  } catch (error) {
    console.error("Error during file upload:", error);
    res.status(500).json({ error: "An error occurred during file upload" });
  }
});

// Endpoint per ottenere i video filtrati per tag
app.get("/videos/bytag/:tag", (req, res) => {
  const tag = req.params.tag;
  const filteredVideos = videos.filter((video) => video.tags.includes(tag));
  res.json(filteredVideos);
});

// Endpoint per ottenere tutti i tag
app.get("/tags", (req, res) => {
  const allTags = videos.flatMap((video) => video.tags);
  const uniqueTags = [...new Set(allTags)];
  res.json(uniqueTags);
});

// Endpoint per ottenere un video specifico
app.get("/videos/:id", (req, res) => {
  const video = videos.find((v) => v.id === req.params.id);
  if (video) {
    res.json(video);
  } else {
    res.status(404).json({ error: "Video not found" });
  }
});

// Endpoint per aggiornare un video
app.put("/videos/:id", async (req, res) => {
  const { title, transcript, tags } = req.body;
  const videoId = req.params.id;
  const videoIndex = videos.findIndex((v) => v.id === videoId);

  if (videoIndex === -1) {
    return res.status(404).json({ error: "Video not found" });
  }

  videos[videoIndex] = {
    ...videos[videoIndex],
    title: title || videos[videoIndex].title,
    transcript: transcript || videos[videoIndex].transcript,
    tags: tags || videos[videoIndex].tags,
  };

  await saveData();
  res.json(videos[videoIndex]);
});

// Endpoint per eliminare un video
app.delete("/videos/:id", async (req, res) => {
  const videoId = req.params.id;
  const videoIndex = videos.findIndex((v) => v.id === videoId);

  if (videoIndex === -1) {
    return res.status(404).json({ error: "Video not found" });
  }

  const video = videos[videoIndex];

  try {
    // Elimina i file associati
    await fs.unlink(path.join(__dirname, video.videoUrl));
    await fs.unlink(path.join(__dirname, video.thumbnailUrl));

    // Rimuovi il video dall'array
    videos.splice(videoIndex, 1);

    await saveData();
    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Error deleting video files:", error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the video" });
  }
});

// Gestione degli errori
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Avvio del server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await createUploadDirectories();
  await loadData();
  await loadPlaylistsData();
});

// Endpoint forzato per le anteprime
app.get("/preview/:id", (req, res) => {
  const id = req.params.id;
  console.log(`Richiesta anteprima per il video con ID: ${id}`);

  // Creiamo un'anteprima fittizia
  const preview = `Questa è un'anteprima fittizia per il video ${id}. In un'implementazione reale, qui ci sarebbe il vero contenuto dell'anteprima.`;

  console.log(
    `Invio anteprima per il video ${id}: ${preview.substring(0, 50)}...`
  );
  res.json({ preview: preview });
});
