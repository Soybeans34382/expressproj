const mongoose = require('mongoose')
const User = require('../model/userModel')

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)

        await ensureUserIndexes()

        console.log('MongoDB connected', conn.connection.host)
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

const ensureUserIndexes = async () => {
    try {
        const indexes = await User.collection.indexes()
        const emailIndex = indexes.find((index) => index.name === 'email_1')

        if (emailIndex && !emailIndex.sparse) {
            await User.collection.dropIndex('email_1')
            await User.collection.createIndex(
                { email: 1 },
                { unique: true, sparse: true, name: 'email_1' }
            )
        }
    } catch (error) {
        console.log('Index check warning:', error.message)
    }
}

module.exports = connectDB