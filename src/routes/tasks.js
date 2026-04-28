const express = require('express')
const router = express.Router()
const db = require('../database')
const authenticateToken = require('../middleware/auth')

// GET all tasks for logged in user
router.get('/', authenticateToken, (req, res) => {
  try {
    const tasks = db.prepare(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC'
    ).all(req.user.id)

    // Convert completed from 0/1 to false/true
    const formatted = tasks.map(t => ({ ...t, completed: t.completed === 1 }))
    res.json(formatted)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks.' })
  }
})

// GET single task by id
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const task = db.prepare(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?'
    ).get(req.params.id, req.user.id)

    if (!task) return res.status(404).json({ error: 'Task not found.' })

    res.json({ ...task, completed: task.completed === 1 })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch task.' })
  }
})

// POST create new task
router.post('/', authenticateToken, (req, res) => {
  const { title, description, priority, category, due_date } = req.body

  if (!title) {
    return res.status(400).json({ error: 'Task title is required.' })
  }

  try {
    const result = db.prepare(
      `INSERT INTO tasks (user_id, title, description, priority, category, due_date)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(req.user.id, title, description || '', priority || 'Low', category || '', due_date || '')

    const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid)
    res.status(201).json({ ...newTask, completed: false })
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task.' })
  }
})

// PUT update task
router.put('/:id', authenticateToken, (req, res) => {
  const { title, description, priority, category, due_date, completed } = req.body

  try {
    const task = db.prepare(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?'
    ).get(req.params.id, req.user.id)

    if (!task) return res.status(404).json({ error: 'Task not found.' })

    db.prepare(
      `UPDATE tasks SET
        title = ?,
        description = ?,
        priority = ?,
        category = ?,
        due_date = ?,
        completed = ?
       WHERE id = ? AND user_id = ?`
    ).run(
      title ?? task.title,
      description ?? task.description,
      priority ?? task.priority,
      category ?? task.category,
      due_date ?? task.due_date,
      completed !== undefined ? (completed ? 1 : 0) : task.completed,
      req.params.id,
      req.user.id
    )

    const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id)
    res.json({ ...updated, completed: updated.completed === 1 })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task.' })
  }
})

// DELETE task
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const task = db.prepare(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?'
    ).get(req.params.id, req.user.id)

    if (!task) return res.status(404).json({ error: 'Task not found.' })

    db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?')
      .run(req.params.id, req.user.id)

    res.json({ message: 'Task deleted successfully.' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task.' })
  }
})

module.exports = router