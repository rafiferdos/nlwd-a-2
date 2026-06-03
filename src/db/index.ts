import { Pool } from "pg"
import config from "../config"

export const pool = new Pool({
  connectionString: config.connection_string
})

export const databaseInitializer = async () => {
  try {
    console.log('db is powered on!!') 
  } catch (error) {
    console.log(error)
  }
}