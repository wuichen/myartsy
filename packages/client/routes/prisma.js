/**
 * Defines an endpoint that returns a list of users. You must be signed in and
 * have "admin": true set in your profile to be able to call the /admin/users
 * end point (you will need to configure persistant Mongo database to do that).
 *
 * Note: These routes only work if you have actually configured a MONGO_URI!
 * They do not work if you are using the fallback in-memory database.
 **/
'use strict'
const { prisma } = require('../prisma/generated/prisma-client')

module.exports = (expressApp) => {
  if (expressApp === null) {
    throw new Error('expressApp option must be an express server instance')
  }
  expressApp.post('/prisma/:action', async (req, res) => {
    const result = await prisma[req.params.action](JSON.parse(req.body.data))
    return res.json(result)
  })
}
