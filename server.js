const express = require('express')
const books = require('./data')
const { MongoClient } = require('mongodb')

require('dotenv').config()

const path = require('path')
const PORT = process.env.PORT
const app = express()

const uri = process.env.MONGODB_URI
const dbName = 'book-inventory'

app.use(express.json())

let booksCollection

const initializeDatabase = async () => {
    const client = new MongoClient(uri)
    await client.connect()
    const db = client.db(dbName)
    booksCollection = db.collection("books")
}

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    res.render('index.ejs', { books: books })
})

app.get('/api/books', (req, res) => {
    res.json(books)
})

app.post('/api/books', async (req, res) => {})

initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}.`)
    })
})