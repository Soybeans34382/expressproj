const asyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../model/userModel')

const setAuthCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  })
}

const registerUser = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body

  if (!name || !password || (!username && !email)) {
    res.status(400)
    throw new Error('Please add name, password, and username or email')
  }

  const cleanEmail = email ? email.trim().toLowerCase() : undefined
  const cleanUsername = username ? username.trim().toLowerCase() : undefined

  const existingUser = await User.findOne({
    $or: [
      ...(cleanEmail ? [{ email: cleanEmail }] : []),
      ...(cleanUsername ? [{ username: cleanUsername }] : []),
    ],
  })

  if (existingUser) {
    res.status(400)
    throw new Error('User already exists')
  }

  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  const user = await User.create({
    name,
    username: cleanUsername,
    email: cleanEmail,
    password: hashedPassword,
  })

  const token = generateToken(user._id)
  setAuthCookie(res, token)

  res.status(201).json({
    _id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    token,
  })
})

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body

  if (!password || (!email && !username)) {
    res.status(400)
    throw new Error('Please provide password and username or email')
  }

  const query = email
    ? { email: email.trim().toLowerCase() }
    : { username: username.trim().toLowerCase() }

  const user = await User.findOne(query)

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(400)
    throw new Error('Invalid credentials')
  }

  const token = generateToken(user._id)
  setAuthCookie(res, token)

  res.json({
    _id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    token,
  })
})

const getMe = asyncHandler(async (req, res) => {
  const { _id, name, username, email } = await User.findById(req.user.id)
  res.status(200).json({
    id: _id,
    name,
    username,
    email,
  })
})

const generateToken = (id) => {
  const secret = (process.env.JWT_SECRET || '').trim()
  if (!secret) {
    throw new Error('JWT_SECRET is not set')
  }
  return jwt.sign({ id }, secret, { expiresIn: '30d' })
}

module.exports = {
  registerUser,
  loginUser,
  getMe,
}