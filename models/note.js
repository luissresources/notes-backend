const mongoose = require('mongoose')
require('dotenv').config()

// connection
// const password = process.argv[2]
// eslint-disable-next-line no-undef
// console.log(process.env.MONGODB_URI)
// eslint-disable-next-line no-undef
const url = process.env.MONGODB_URI
// console.log(url)

// console.log('connecting to ',url)

mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const noteSchema = new mongoose.Schema({
  content: {
    type: String,
    minlength: 3,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  important: Boolean,
})

noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Note',noteSchema)