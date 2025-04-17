import express from "express";
import { Request, Response } from "express";
import fileUpload from "express-fileupload";
import { analyzeDataset } from "./lib/analyzer";
import { loadAnalysisOf, saveFile } from "./repository";
import { UploadRequest } from "./types/analyzerTypes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(fileUpload());

app.post("/upload", async (req: Request, res: Response) => {
    const uploadReq = req as UploadRequest
    if (!uploadReq.files || !uploadReq.files.file) {
        return res.status(400).send("No file uploaded.")
    }

    const file = uploadReq.files.file

    if (Array.isArray(file)) {
        return res.status(400).send("Multiple files not supported")
    }
    const text = file.data.toString()
    const summary = analyzeDataset(text)
    const saved = await saveFile(file.name, uploadReq.userId, summary)

    res.send({ id: saved.id, preview: summary })
});

app.get("/analysis/:id", async (req, res) => {
    const { id } = req.params
    const analysis = await loadAnalysisOf(id)
    if (!analysis) res.status(400).send({ message: `id ${id} doesn't exist.` })
    res.send({ analysis })
})

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
