const dns = require('dns')
dns.setServers(['8.8.8.8', '1.1.1.1'])

const express = require('express')
const path = require('path')
const cors = require('cors')
require('dotenv').config()

const connectDB = require('./config/db')
const { errorHandler } = require('./middleware/errorMiddleware')

const port = process.env.PORT || 5555
connectDB()
const app = express()

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// API before static files so /api/* is never shadowed by the frontend folder
app.use('/api/products', require('./routes/productRoutes'))
app.use('/api/users', require('./routes/userRoutes'))

app.use(express.static(path.join(__dirname, '../frontend')))
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }))

app.use(errorHandler)
app.listen(port, () => console.log(`Server started on port ${port}`))
