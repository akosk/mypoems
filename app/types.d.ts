declare module '#auth-utils' {
  interface User {
    email: string
    googleId: string
    name: string
    picture: string
    isAdmin: boolean
  }
}

export {}
