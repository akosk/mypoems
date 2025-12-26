export default defineOAuthGoogleEventHandler({
  async onSuccess(event, { user, tokens }) {
    const adminEmail = process.env.ADMIN_EMAIL || ''
    console.log("adminEmail", adminEmail);
    console.log("user.email", user.email);
    const isAdmin = Boolean(
      adminEmail
      && user.email
      && user.email.toLowerCase() === adminEmail.toLowerCase()
    )

    try {
      const [existingUser] = await sql`
        SELECT id, first_name, last_name FROM users WHERE email = ${user.email}
      `

      if (!existingUser) {
        await sql`
          INSERT INTO users (email, avatar_url, first_name, last_name, created_at)
          VALUES (${user.email}, ${user.picture}, ${user.given_name}, ${user.family_name}, ${new Date()})
        `
      } else {
        // Update names if missing or changed
        if (user.given_name !== existingUser.first_name || user.family_name !== existingUser.last_name) {
           await sql`
            UPDATE users 
            SET first_name = ${user.given_name}, last_name = ${user.family_name}, avatar_url = ${user.picture}
            WHERE email = ${user.email}
          `
        }
      }
    } catch (error) {
      console.error('Database error during login:', error)
    }

    await setUserSession(event, {
      user: {
        googleId: user.sub,
        email: user.email,
        name: user.name,
        picture: user.picture,
        isAdmin
      },
      loggedInAt: new Date()
    })
    return sendRedirect(event, '/')
  },
  // Optional, will return a json error and 401 status code by default
  onError(event, error) {
    console.error('Google OAuth error:', error)
    return sendRedirect(event, '/')
  },
})
