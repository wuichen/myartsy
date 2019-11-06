/**
 * next-auth.functions.js Example
 *
 * This file defines functions NextAuth to look up, add and update users.
 *
 * It returns a Promise with the functions matching these signatures:
 *
 * {
 *   find: ({
 *     id,
 *     email,
 *     emailToken,
 *     provider,
 *     poviderToken
 *   } = {}) => {},
 *   update: (user) => {},
 *   insert: (user) => {},
 *   remove: (id) => {},
 *   serialize: (user) => {},
 *   deserialize: (id) => {}
 * }
 *
 * Each function returns Promise.resolve() - or Promise.reject() on error.
 *
 * This specific example supports both Prisma and NeDB, but can be refactored
 * to work with any database.
 *
 * Environment variables for this example:
 *
 * PRISMA_ENDPOINT=https://stylechain-c75dcd094b.herokuapp.com/prismanext/dev
 * EMAIL_FROM=username@gmail.com
 * EMAIL_SERVER=smtp.gmail.com
 * EMAIL_PORT=465
 * EMAIL_USERNAME=username@gmail.com
 * EMAIL_PASSWORD=p4ssw0rd
 *
 * If you wish, you can put these in a `.env` to seperate your environment 
 * specific configuration from your code.
 **/

// Load environment variables from a .env file if one exists
require('dotenv').config()

// This config file uses Prisma for User accounts, as well as session storage.
// This config includes options for NeDB, which it defaults to if no DB URI 
// is specified. NeDB is an in-memory only database intended here for testing.
const NeDB = require('nedb')
const { prisma } = require('./prisma/generated/prisma-client')
// Use Node Mailer for email sign in
const nodemailer = require('nodemailer')
const nodemailerSmtpTransport = require('nodemailer-smtp-transport')
const nodemailerDirectTransport = require('nodemailer-direct-transport')

// Send email direct from localhost if no mail server configured
let nodemailerTransport = nodemailerDirectTransport()
if (process.env.EMAIL_SERVER && process.env.EMAIL_USERNAME && process.env.EMAIL_PASSWORD) {
  nodemailerTransport = nodemailerSmtpTransport({
    host: process.env.EMAIL_SERVER,
    port: process.env.EMAIL_PORT || 25,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  })
}

module.exports = () => {
  return Promise.resolve({
    find: ({ id, email, emailToken, provider } = {}) => {
      let query = {}

      // Find needs to support looking up a user by ID, Email, Email Token,
      // and Provider Name + Users ID for that Provider
      if (id) {
        query = { id: id }
      } else if (email) {
        query = { email: email }
      } else if (emailToken) {
        query = { emailToken: emailToken }
      } else if (provider) {
        query = { [`${provider.name}.id`]: provider.id }
      }

      return new Promise(async (resolve, reject) => {
        try {
          const user = await prisma.user(query)
          return resolve(user)
        } catch (err) {
          console.log(err)
          return reject(err)
        }
      })
    },
    // The user parameter contains a basic user object to be added to the DB.
    // The oAuthProfile parameter is passed when signing in via oAuth.
    //
    // The optional oAuthProfile parameter contains all properties associated
    // with the users account on the oAuth service they are signing in with.
    //
    // You can use this to capture profile.avatar, profile.location, etc.
    insert: (user, oAuthProfile) => {
      return new Promise(async (resolve, reject) => {
        try {
          user.roles = {
            set: ['USER']
          }
          const newUser = await prisma.createUser(user)
          return resolve(newUser)
        } catch (err) {
          console.log(err)
          return reject(err)
        }

      })
    },
    // The user parameter contains a basic user object to be added to the DB.
    // The oAuthProfile parameter is passed when signing in via oAuth.
    //
    // The optional oAuthProfile parameter contains all properties associated
    // with the users account on the oAuth service they are signing in with.
    //
    // You can use this to capture profile.avatar, profile.location, etc.
    update: (user, profile) => {
      return new Promise(async (resolve, reject) => {
        try {
          // TODO: find a better way to clean data
          const id = user.id
          delete user.roles
          delete user.createdAt
          delete user.updatedAt
          delete user.id
          const newUser = await prisma.updateUser({
            where: {
              id
            },
            data: user
          })
          return resolve(newUser)
        } catch (err) {
          console.log(err)
          return reject(err)
        }
      })
    },
    // The remove parameter is passed the ID of a user account to delete.
    //
    // This method is not used in the current version of next-auth but will
    // be in a future release, to provide an endpoint for account deletion.
    remove: (id) => {
      return new Promise(async (resolve, reject) => {
        try {
          await prisma.deleteUser({
            id: id
          })
          return resolve(true)
        } catch (err) {
          console.log(err)
          return reject(err)
        }
      })
    },
    // Seralize turns the value of the ID key from a User object
    serialize: (user) => {
      if (user.id) {
        // Handle responses from deserialize()
        return Promise.resolve(user.id)
      } else {
        return Promise.reject(new Error("Unable to serialise user"))
      }
    },
    // Deseralize turns a User ID into a normalized User object that is
    // exported to clients. It should not return private/sensitive fields,
    // only fields you want to expose via the user interface.
    deserialize: (id) => {
      return new Promise(async (resolve, reject) => {
        try {
          const user = await prisma.user({ id })
          if (user) {
            return resolve(user)
          } else {
            return resolve(null)
          }
        } catch (err) {
          return reject(err)
        }
      })
    },
    // Define method for sending links for signing in over email.
    sendSignInEmail: ({
      email = null,
      url = null
    } = {}) => {
      nodemailer
        .createTransport(nodemailerTransport)
        .sendMail({
          to: email,
          from: process.env.EMAIL_FROM,
          subject: 'Sign in link',
          text: `Use the link below to sign in:\n\n${url}\n\n`,
          html: `<p>Use the link below to sign in:</p><p>${url}</p>`
        }, (err) => {
          if (err) {
            console.error('Error sending email to ' + email, err)
          }
        })
      if (process.env.NODE_ENV === 'development') {
        console.log('Generated sign in link ' + url + ' for ' + email)
      }
    }
  })
}


