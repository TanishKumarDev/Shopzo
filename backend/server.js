import express from 'express'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Create an Express app
const app = express()

// Define the port
const port = process.env.PORT || 3000

// Middleware
app.use(express.json())

// Import routes
import authRoutes from './routes/auth.route.js'

// Use Routes
app.use('/api/auth', authRoutes)

// Define a simple route
app.get('/', (req, res) => {
  res.send('Shopzo Backend is running')
})

// Start the server
app.listen(port, () => {
  console.log(`Server is running on localhost:${port}`)
})