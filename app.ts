import express from "express";
import { Request, Response } from "express";
import fileUpload from "express-fileupload";
import { analyzeDataset } from "./lib/analyzer";
import { loadAnalysisOf, saveFile, loadResults } from "./repository";
import { Status, UploadRequest } from "./types/analyzerTypes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

app.post("/upload", async (req, res) => {
    try {
        const uploadReq = req as UploadRequest
        if (!uploadReq || !uploadReq.files || !uploadReq.files.file) {
            return res.status(400).send("No file uploaded.")
        }
        console.log("Received userId:", req.body.userId || req.query.userId);
        const file = uploadReq.files.file

        if (Array.isArray(file)) {
            return res.status(400).send("Multiple files not supported")
        }
        const text = file.data.toString()
        const summary = analyzeDataset(text)
        const saved = await saveFile(file.name, uploadReq.body.userId, summary)

        res.send({ id: saved.id, preview: summary })
    } catch (e) {
        throw new Error(`Error caused by: ${e}`)
    }

});

app.get("/analysis/:id", async (req, res) => {
    const { id } = req.params
    const analysis = await loadAnalysisOf(id)
    if (!analysis) res.status(400).send({ message: `id ${id} doesn't exist.` })
    res.send({ analysis })
})

app.get("/results", async (req, res) => {
    const { results, status, message } = await loadResults(req.query)
    if (status === Status.FAIL) {
        res.status(400).send(message)
    }
    res.send({ results })
})

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
