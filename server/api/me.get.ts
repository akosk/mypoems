export default defineEventHandler(async (event) => {
  const session = await getUserSession(event).catch(() => null)
  const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase()
  const email = session?.user?.email?.toLowerCase() || ''

  return {
    loggedIn: Boolean(session?.user),
    user: session?.user || null,
    isAdmin: Boolean(adminEmail && email && email === adminEmail)
  }
})
