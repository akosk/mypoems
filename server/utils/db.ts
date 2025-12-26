import postgres from 'postgres'

export const sql = postgres(process.env.DATABASE_URL || '')

declare module '#auth-utils' {
  interface User {
    email: string
    googleId: string
    name: string
    picture: string
    isAdmin: boolean
  }
}