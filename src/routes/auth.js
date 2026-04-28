const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../database')

// Register a new user
router.post('/register', (req, res) => {
  const { name, email, password, securityQuestion, securityAnswer } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' })
  }

  try {
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered.' })
    }

    const hashedPassword = bcrypt.hashSync(password, 10)
    const hashedAnswer = securityAnswer ? bcrypt.hashSync(securityAnswer.toLowerCase(), 10) : null

    const result = db.prepare(
      'INSERT INTO users (name, email, password, security_question, security_answer) VALUES (?, ?, ?, ?, ?)'
    ).run(name, email, hashedPassword, securityQuestion || null, hashedAnswer)

    const token = jwt.sign(
      { id: result.lastInsertRowid, name, email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: { id: result.lastInsertRowid, name, email }
    })
  } catch (err) {
    res.status(500).json({ error: 'Server error. Please try again.' })
  }
})

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' })
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' })
    }

    const validPassword = bcrypt.compareSync(password, user.password)
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid email or password.' })
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Login successful!',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    })
  } catch (err) {
    res.status(500).json({ error: 'Server error. Please try again.' })
  }
})

// Get security question for email
router.post('/forgot-password', (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' })
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
    if (!user) {
      return res.status(400).json({ error: 'No account found with that email.' })
    }
    if (!user.security_question) {
      return res.status(400).json({ error: 'No security question set for this account.' })
    }

    res.json({ securityQuestion: user.security_question })
  } catch (err) {
    res.status(500).json({ error: 'Server error. Please try again.' })
  }
})

// Verify security answer and reset password
router.post('/reset-password', (req, res) => {
  const { email, securityAnswer, newPassword } = req.body

  if (!email || !securityAnswer || !newPassword) {
    return res.status(400).json({ error: 'All fields are required.' })
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' })
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
    if (!user) {
      return res.status(400).json({ error: 'No account found with that email.' })
    }

    const validAnswer = bcrypt.compareSync(securityAnswer.toLowerCase(), user.security_answer)
    if (!validAnswer) {
      return res.status(400).json({ error: 'Incorrect security answer.' })
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10)
    db.prepare('UPDATE users SET password = ? WHERE email = ?').run(hashedPassword, email)

    res.json({ message: 'Password reset successfully! Please login.' })
  } catch (err) {
    res.status(500).json({ error: 'Server error. Please try again.' })
  }
})

module.exports = router