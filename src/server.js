import express from 'express'
import cors from 'cors'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, CLOSE_DB } from './config/mongodb.js'
import { env } from './config/environment.js'
import { APIs_V1 } from './routes/v1/index.js'
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware.js'
import { corsOptions } from './config/cors.js'
import cookieParser from 'cookie-parser'
import { Server } from 'socket.io'
import http from 'http'
import { inviteUserToBoardSocket } from './sockets/inviteUserToBoardSocket.js'


const START_SERVER = () => {
  const app = express()

  // Fix Cache from disk của ExpressJS
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  app.use(cookieParser())

  app.use(cors(corsOptions))

  app.use(express.json())

  app.use('/v1', APIs_V1)

  app.use(errorHandlingMiddleware)

  // Tạo môt cái server mới bọc thằng app của express để làm realtime với socket.io
  const server = http.createServer(app)
  const io = new Server(server, { cors: corsOptions })
  io.on('connection', (socket) => {
    inviteUserToBoardSocket(socket)
  })

  if (env.BUILD_MODE === 'production') {
    //Production
    server.listen(process.env.PORT, () => {
      console.log(`3. Production: Hello ${ env.AUTHOR }, I am running at Port: ${process.env.PORT}`)
    })
  } else {
    //Dev
    server.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
      console.log(`3. Local Dev: Hello ${ env.AUTHOR }, I am running at ${ env.LOCAL_DEV_APP_HOST }:${ env.LOCAL_DEV_APP_PORT }/`)
    })
  }

  exitHook(() => {
    console.log('4. Server is shutting down...')
    CLOSE_DB()
    console.log('5. Disconnecting from MongoDB Cloud Atlas')
  })
}

(async () => {
  try {
    console.log('1. Connecting to MongoDB Cloud Atlas...')
    await CONNECT_DB()
    console.log('2. Connected to MongoDB Cloud Atlas!')

    START_SERVER()
  } catch (error) {
    console.error(error)
    process.exit(0)
  }
})()
