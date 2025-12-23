export default defineOAuthGoogleEventHandler({
  async onSuccess(event, { user, tokens }) {
    await setUserSession(event, {
      user: {
        googleId: user.sub,
        email: user.email,
        name: user.name,
        picture: user.picture
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
