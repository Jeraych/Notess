require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./mongo");

const app = express();
const noteRoutes = require("./routes/notes");

app.use(cors());
app.use(express.json());
app.use("/api/notes", noteRoutes);

connectDB();

app.get("/", (req, res) => {
  res.send("API running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));