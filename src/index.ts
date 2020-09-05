import express from "express";
import ytdl from "ytdl-core";
import fs from "fs";
import path from "path";
import cors from "cors";
const app = express();
app.use(cors());
app.use(express.static("dist/client"));
app.use(express.json());

app.use("/songs", express.static("dist/songs"));

const songsPath = path.join(__dirname, "songs");
fs.exists(songsPath, (exists) => {
  !exists && fs.mkdir(songsPath, (er) => console.log(er));
});

app.post("/ping", (req, res) => {
  const id = req.body.id;
  const videoName = id + ".mp3";

  fs.readdir(songsPath, async (_, files) => {
    if (files.includes(videoName)) {
      res.send(videoName);
    } else {
      const videoLink = "https://www.youtube.com/watch?v=" + id;
      const audioInfo = await ytdl.getInfo(videoLink);
      let downloadComplete = false;
      ytdl
        .downloadFromInfo(audioInfo, {
          filter: "audioonly",
          quality: "highestaudio",
        })
        .on("progress", (_, downloaded, total) => {
          if (downloaded === Number(total)) {
            downloadComplete = true;
          }
        })
        .pipe(fs.createWriteStream(path.join(songsPath, videoName)))

        .on("close", () => {
          if (downloadComplete) {
            res.send(videoName);
          } else {
            fs.exists(path.join(songsPath, videoName), (exists) => {
              if (exists) fs.unlink(path.join(songsPath, videoName), () => {});
            });
            res.status(404).send("ERROR");
          }
        });
    }
  });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("App is listening on " + PORT));
