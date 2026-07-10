const express = require('express')
const books = require('./data')
const { MongoClient } = require('mongodb')

require('dotenv').config()

const path = require('path')
const PORT = process.env.PORT
const app = express()

const uri = process.env.MONGODB_URI
const dbName = 'book-inventory'
const shouldSeed = process.argv.includes('--seed')

app.use(express.json())

let booksCollection

const initializeDatabase = async () => {
    const client = new MongoClient(uri)
    await client.connect()
    const db = client.db(dbName)
    booksCollection = db.collection("books")
}

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', async (req, res) => {
    const response = await fetch(`http://localhost:${PORT}/api/books`)
    const books = await response.json()
    res.render('index.ejs', {books: books})
})

app.get('/api/books', async (req, res) => {
    const books = await booksCollection.find().toArray()
    res.json(books)
})

app.post('/api/books', async (req, res) => {
    const inserted = await booksCollection.insertOne(req.body)
    res.status(201).json(inserted)
})

const seedDatabaseThroughApi = async () => {
    await booksCollection.deleteMany({})

    for (const book of books) {
        const response = await fetch(`http://localhost:${PORT}/api/books`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(book)
        })

        if (!response.ok) {
            const text = await response.text()
            throw new Error(`Seed failed for "${book.title}": ${response.status} ${text}`)
        }
    }

    console.log(`Seed complete: ${books.length} books inserted`)
}

initializeDatabase().then(() => {
    const server = app.listen(PORT, async () => {
        console.log(`Server listening on port ${PORT}.`)

        if (!shouldSeed) return

        try {
            await seedDatabaseThroughApi()
            console.log('Manual seed finished')
        } catch (error) {
            console.error(error.message)
            process.exitCode = 1
        } finally {
            server.close(() => process.exit(process.exitCode || 0))
        }
    })
}).catch((error) => {
    console.error('Database initialization failed:', error.message)
    process.exit(1)
})