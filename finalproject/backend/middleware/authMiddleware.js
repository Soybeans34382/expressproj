const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const User = require('../model/userModel')

const getTokenFromCookieHeader = (cookieHeader = '') => {
  const tokenPair = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('token='))

  if (!tokenPair) return null
  return decodeURIComponent(tokenPair.slice('token='.length))
}

const protect = asyncHandler(async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token && req.headers.cookie) {
    token = getTokenFromCookieHeader(req.headers.cookie)
  }

  if (!token) {
    res.status(401)
    throw new Error('Not authorized, no token')
  }

  try {
    const secret = (process.env.JWT_SECRET || '').trim()
    if (!secret) {
      res.status(500)
      throw new Error('Server misconfiguration')
    }
    const decoded = jwt.verify(token, secret)
    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      res.status(401)
      throw new Error('Not authorized, user not found')
    }

    req.user = user
    return next()
  } catch (err) {
    res.status(401)
    throw new Error('Not authorized')
  }

})

module.exports = { protect }