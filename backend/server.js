const express = require("express");
const dotenv = require("dotenv");
dotenv.config(); // ✅ Must be first before anything else

const cors = require('cors');
const connectDB = require('./src/config/db');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    console.log("checking");
    res.send('API is running ✅');
});

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 7001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} 🚀`);
}); 