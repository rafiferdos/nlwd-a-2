import app from './app'
import config from './config'
import { databaseInitializer } from './db'

const main = () => {
  databaseInitializer()
  app.listen(config.port, () => {
    console.log(`Example app listening on port ${config.port}`)
  })
}

main()
