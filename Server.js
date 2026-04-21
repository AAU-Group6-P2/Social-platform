import express from 'express'
import cors from 'cors'
import db from './db.js'

const app = express()

app.use(cors())
app.use(express.json())

// test route
app.get('/', (req, res) => {
  res.send("Backend is running")
})

// GET all events
app.get('/events', (req, res) => {

  db.query('SELECT * FROM events', (err, result) => {

    if (err) {
      console.error(err)
      return res.status(500).json({ error: "database error" })
    }

    res.json(result)

  })

})

// GET all clubs
app.get('/clubs', (req, res) => {

  db.query('SELECT * FROM clubs', (err, result) => {

    if (err) {
      console.error(err)
      return res.status(500).json({ error: "database error" })
    }

    res.json(result)

  })

})

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000")
})