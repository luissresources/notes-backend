require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')
const Note = require('./models/note')
const { response } = require('express')


const app = express()
app.use(express.json())
app.use(express.static('build'))

let notes = [
  {
    id: 1,
    content: 'HTML is easy',
    date: '2019-05-30T17:30:31.098Z',
    important: true
  },
  {
    id: 2,
    content: 'Browser can execute only JavaScript',
    date: '2019-05-30T18:39:34.091Z',
    important: false
  },
  {
    id: 3,
    content: 'GET and POST are the most important methods of HTTP protocol',
    date: '2019-05-30T19:20:14.298Z',
    important: true
  }
]

morgan.token('dataPost', function getId (req) {
  const body = JSON.stringify(req.body)
  return body
})

app.use(morgan(':method :url :status - :response-time ms :dataPost'))
app.use(cors())

app.get('/', (req, res) => 
  res.send('hello, world!')
)

app.get('/api/notes',(request, response) => {
  Note.find({})
    .then(notes => {
      response.json(notes)
    })
})

app.get('/api/notes/:id', (request, response) => {
  Note.findById(request.params.id).then(note => {
    response.json(note)
  })
})

app.get('/info', (request, response) => {
  const quantityNotes = notes.length
  const requestDate = new Date()
  const txt = `<p>Notes has info for ${quantityNotes} people</p><p>${requestDate}</p>`
  response.status(200).send(txt)
})

app.post('/api/notes', (req, res) => {
  const body = req.body
  const content = req.body.content
  const important = req.body.important
  console.log({content, important})

  if(!content && important === undefined){
    return res.status(400).json({
      error: 'missing content'
    })
  }

  if(content === undefined) {
    return res.status(400).json({
      error: `content not found`
    })
  } 
  
  if (important === undefined) {
    return res.status(400).json({
      error: `important not found`
    })
  }

  const note = new Note({
    content: content,
    date: new Date(),
    important: important || false
  })
  
  note.save()
    .then(result => {
      res.status(201).send({
        message: 'Note added',
        result
      })
    })
})

app.delete('/api/notes/:id', (req, res) => {
  Note.deleteOne({id: req.params.id}).then(note => {
    res.status(204).end()
    })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})