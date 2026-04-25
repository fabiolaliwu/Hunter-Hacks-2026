import dotenv from "dotenv";
import express from "express";
import routes from "./routes.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

app.use("/api", routes);



app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
