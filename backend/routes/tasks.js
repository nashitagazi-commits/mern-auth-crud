const express = require('express');
const asyncHandler = require('express-async-handler');
const { body, query, validationResult } = require('express-validator');
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect); // every task route requires a valid access token

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }
  next();
};

// @route   GET /api/tasks
// Supports: ?page=1&limit=10&status=todo&priority=high&search=keyword&sort=-createdAt
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const filter = { user: req.user._id };

    if (req.query.status === 'overdue') {
      // "overdue" isn't a stored status - it's computed from dueDate vs now
      filter.status = { $ne: 'done' };
      filter.dueDate = { $lt: new Date() };
    } else if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.priority) filter.priority = req.query.priority;

    if (req.query.search) {
      // Partial, case-insensitive match on title/description - matches as you type,
      // unlike MongoDB's $text search which only matches whole words.
      const escaped = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = [{ title: regex }, { description: regex }];
    }

    const sort = req.query.sort ? req.query.sort.split(',').join(' ') : '-createdAt';

    const [tasks, total] = await Promise.all([
      Task.find(filter).sort(sort).skip(skip).limit(limit),
      Task.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: tasks.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      tasks,
    });
  })
);

// @route   GET /api/tasks/stats  (bonus: quick dashboard summary)
router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const [stats, overdue] = await Promise.all([
      Task.aggregate([
        { $match: { user: req.user._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Task.countDocuments({
        user: req.user._id,
        status: { $ne: 'done' },
        dueDate: { $lt: new Date() },
      }),
    ]);
    const summary = { todo: 0, 'in-progress': 0, done: 0, overdue };
    stats.forEach((s) => (summary[s._id] = s.count));
    res.json({ success: true, stats: summary });
  })
);

// @route   GET /api/tasks/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }
    res.json({ success: true, task });
  })
);

// @route   POST /api/tasks
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('status').optional().isIn(['todo', 'in-progress', 'done']),
    body('priority').optional().isIn(['low', 'medium', 'high']),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { title, description, status, priority, dueDate } = req.body;
    const task = await Task.create({
      user: req.user._id,
      title,
      description,
      status,
      priority,
      dueDate,
    });
    res.status(201).json({ success: true, task });
  })
);

// @route   PUT /api/tasks/:id
router.put(
  '/:id',
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('status').optional().isIn(['todo', 'in-progress', 'done']),
    body('priority').optional().isIn(['low', 'medium', 'high']),
  ],
  validate,
  asyncHandler(async (req, res) => {
    let task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    const fields = ['title', 'description', 'status', 'priority', 'dueDate'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) task[f] = req.body[f];
    });

    await task.save();
    res.json({ success: true, task });
  })
);

// @route   DELETE /api/tasks/:id
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }
    res.json({ success: true, message: 'Task deleted' });
  })
);

module.exports = router;
