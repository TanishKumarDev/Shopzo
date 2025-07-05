import express from 'express'
import dotenv from 'dotenv'
import connectDB from './lib/db.js'
import cookieParser from 'cookie-parser';


// Load environment variables
dotenv.config()

// Create an Express app
const app = express()

// Define the port
const port = process.env.PORT || 3000

// Middleware to parse JSON
app.use(express.json())

// Middleware to parse cookies
app.use(cookieParser());

// Import routes
import authRoutes from './routes/auth.route.js'
import productRoutes from './routes/product.route.js'

// Use Routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)

// Connect to MongoDB
connectDB()

// Define a simple route
app.get('/', (req, res) => {
  res.send('Shopzo Backend is running')
})

// Start the server
app.listen(port, () => {
  console.log(`Server is running on localhost:${port}`)
})