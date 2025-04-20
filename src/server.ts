import { createApp } from "./app";

const PORT = process.env.PORT || 3000;
const app = createApp()
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    console.log(`Database is connected to ${process.env.DATABASE_URL}`)
})