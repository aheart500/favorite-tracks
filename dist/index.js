"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const app = express_1.default();
app.use(cors_1.default());
app.use(express_1.default.static("dist/client"));
app.use(express_1.default.json());
app.use("/songs", express_1.default.static("dist/songs"));
const songsPath = path_1.default.join(__dirname, "songs");
fs_1.default.exists(songsPath, (exists) => {
    !exists && fs_1.default.mkdir(songsPath, (er) => console.log(er));
});
app.post("/ping", (req, res) => {
    const id = req.body.id;
    const videoName = id + ".mp3";
    console.log("here 1");
    fs_1.default.readdir(songsPath, (_, files) => __awaiter(void 0, void 0, void 0, function* () {
        if (files.includes(videoName)) {
            console.log("here 2");
            res.send(videoName);
        }
        else {
            const videoLink = "https://www.youtube.com/watch?v=" + id;
            console.log("here 3");
            const audioInfo = yield ytdl_core_1.default.getInfo(videoLink);
            let downloadComplete = false;
            console.log("here 4");
            ytdl_core_1.default
                .downloadFromInfo(audioInfo, {
                filter: "audioonly",
                quality: "highestaudio",
            })
                .on("progress", (_, downloaded, total) => {
                if (downloaded === Number(total)) {
                    downloadComplete = true;
                }
            })
                .pipe(fs_1.default.createWriteStream(path_1.default.join(songsPath, videoName)))
                .on("close", () => {
                if (downloadComplete) {
                    res.send(videoName);
                    console.log("here 5");
                }
                else {
                    fs_1.default.exists(path_1.default.join(songsPath, videoName), (exists) => {
                        if (exists)
                            fs_1.default.unlink(path_1.default.join(songsPath, videoName), () => { });
                    });
                    res.status(404).send("ERROR");
                }
            });
        }
    }));
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("App is listening on " + PORT));
//# sourceMappingURL=index.js.map