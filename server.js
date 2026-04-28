const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

// Routes
const authRoutes = require('./src/routes/auth')
const taskRoutes = require('./src/routes/tasks')

app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Stasha API is running!' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Stasha backend running on http://localhost:${PORT}`)
})