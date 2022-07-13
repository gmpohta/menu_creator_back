import express from 'express'
import apiRouter  from './routes/apiRouter'
const cors = require('cors')
const fileUpload = require('express-fileupload')

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(fileUpload({
  createParentPath: true
}));
app.use(express.json())
app.use(apiRouter)

app.use(express.static('public')); 

app.use((req, res, next) => {
  res.status(404);
  res.json(`Not found for path: ${req.path}`);
});

app.listen(port, () => {
  console.log(`Listening to requests on port ${port}`)
})
