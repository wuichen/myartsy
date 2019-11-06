import { NextAuth } from 'next-auth/client'
import { reject } from 'q'

const prisma = (action, data) => {
  return new Promise(async (resolve, reject) => {
    const formData = {
      _csrf: await NextAuth.csrfToken(),
      data: JSON.stringify(data)
    }

    // URL encode form
    // Note: This uses a x-www-form-urlencoded rather than sending JSON so that
    // the form also in browsers without JavaScript
    const encodedForm = Object.keys(formData).map((key) => {
      if (typeof formData[key])
        return encodeURIComponent(key) + '=' + encodeURIComponent(formData[key])
    }).join('&')

    fetch('/prisma/' + action, {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: encodedForm
    }).then(response => response.json())
      .then(data => {
        resolve(data)
      }).catch((err) => {
        console.log(err)
        reject(err)
      })
  })

}

module.exports = prisma