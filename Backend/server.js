require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const Admin = require('./models/Admin');

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Programmatically drop old global indexes that interfere with event-scoped registration
    try {
      const Registration = require('./models/Registration');
      const collection = mongoose.connection.collection('registrations');
      const indexes = await collection.indexes();
      
      const indexesToDrop = ['email_1', 'phone_1', 'bikeRegistrationNumber_1', 'licenseNumber_1'];
      for (const indexName of indexesToDrop) {
        if (indexes.find(idx => idx.name === indexName)) {
          console.log(`Dropping old index: ${indexName}`);
          await collection.dropIndex(indexName);
        }
      }
    } catch (err) {
      console.warn('Note: Could not drop some indexes (they might already be gone):', err.message);
    }
    
    // Create initial admin if not exists
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const admin = new Admin({
        username: process.env.ADMIN_USERNAME || 'admin',
        password: process.env.ADMIN_PASSWORD || 'admin123'
      });
      await admin.save();
      console.log('Initial admin created');
    }
  })
  .catch(err => console.error('Could not connect to MongoDB', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ 
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
