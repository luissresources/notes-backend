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

app.get('/api/notes/:id', (request, response, next) => {
  Note.findById(request.params.id)
  .then(note => {
    if (note) {
      response.json(note)
    } else {
      response.status(404).end()
    }
  })
  .catch(error => next(error))
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

app.put('/api/notes/:id', (request, response, next) => {
  /* const id = request.params.id
  const content = request.body.content
  const important = request.body.important
  Note.findOne({_id: id})
    .then(note => {
      console.log('note: ',note)
      Note.updateOne({_id : id}, {$set: {content: content, important: important}})
        .then(result => {
          console.log('Updated')
          response.status(200).send({
            message: 'Note updated',
            result
          })
        })
        .catch(error => {
          console.log({error})
          // response.status(400).send({
          //   message: 'Update error',
          //   error
          // })
          next(error)
        })
    }) */

    const body = request.body

    const note = {
      content: body.content,
      important: body.important,
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
    .then(result => {
      console.log({result})
      response.status(204).end()
    })
    .catch(error => {
      console.log({error})
      next(error)
    })
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})