require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Note = require('./models/note')

const app = express()
app.use(express.json())
app.use(express.static('build'))

morgan.token('dataPost', function getId (request) {
  const body = JSON.stringify(request.body)
  return body
})

app.use(morgan(':method :url :status - :response-time ms :dataPost'))
app.use(cors())

app.get('/api/notes',(request, response) => {
  Note.find({})
    .then(notes => {
      response.json(notes)
    })
})

app.get('/api/notes/:id', (request, response, next) => {
  Note.findById(request.params.id)
    .then(note => {
      note
        ? response.json(note)
        : response.status(404).end()
    })
    .catch(error => next(error))
})

app.get('/info', (request, response) => {
  Note.find({})
    .then(notes => {
      const txt = `<p>Notes has info for ${notes.length} people</p><p>${new Date()}</p>`
      response.status(200).send(txt)
    })
})

app.post('/api/notes', (request, response, next) => {

  const note = new Note({
    content: request.body.content,
    date: new Date(),
    important: request.body.important || false
  })

  note.save()
    .then(noteSaved => noteSaved.toJSON())
    .then(saveAndFormattedNote => response.json(saveAndFormattedNote))
    .catch(error => next(error))
})

app.put('/api/notes/:id', (request, response, next) => {

  const note = {
    content: request.body.content,
    important: request.body.important,
  }

  // new: true returns the updated object
  Note.findByIdAndUpdate(request.params.id, note, { new: true })
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})

app.delete('/api/notes/:id', (request, response, next) => {
  Note.findByIdAndRemove(request.params.id)
    // the result is the same whether it exists or not. could be changed
    .then(() => response.status(204).end())
    .catch(error => {
      console.log({ error })
      next(error)
    })
})

const unknownEndpoint = (request, response) => response.status(404).send({ error: 'unknown endpoint' })
// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})