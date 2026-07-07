const express = require('express')
const books = require('./data')

const path = require('path')
const PORT = 3000
const app = express()

app.get('/', (req, res) => {
    res.render('index.ejs', { books: books })
})

app.get('/api/books', (req, res) => {
    res.json(books)
})

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}.`)
})