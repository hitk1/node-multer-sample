import 'dotenv/config'
import express from 'express'
import { errors } from 'celebrate'

import { routes } from './routes'

const server = express()

server.use(express.json())
server.use(express.urlencoded({ extended: true }))
server.use(routes)
server.use(errors())

server.listen(process.env.PORT, () => {
    console.log('Server online')
})
