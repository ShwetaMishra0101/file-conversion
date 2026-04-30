const express = require("express");
const dotenv = require("dotenv");
dotenv.config(); // ✅ Must be first before anything else

const cors = require('cors');
const path      = require('path');
const connectDB = require('./src/config/db');

const mediaRoutes = require('./src/routes/imageRoutes')
const fs = require('fs');

connectDB();

const app = express();


// Create uploads folder if not exists

if(!fs.existsSync('src/uploads')){
    fs.mkdirSync('src/uploads', {recursive:true})
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));

// Routes
app.use('/api/media', mediaRoutes);

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