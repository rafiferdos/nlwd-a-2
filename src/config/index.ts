import dotenv from 'dotenv'
import path from 'path'

dotenv.config({
  path: path.join(process.cwd(), '.env')
})

const config = {
  connection_string: process.env.CONNECTION_STRING as string,
  port: process.env.PORT,
  jwt_secret: process.env.JWT_SECRET as string,
  allowed_origin: process.env.ALLOWED_ORIGIN as string
}

export default config
