const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const { uploadFile, deleteFile } = require('../services/upload.service');
const ApiResponse = require('../utils/ApiResponse');

// POST /api/upload — upload a single image to R2
router.post('/', authenticate, (req, res, next) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json(ApiResponse.error(err.message));
    }

    if (!req.file) {
      return res.status(400).json(ApiResponse.error('No file provided'));
    }

    try {
      const url = await uploadFile(req.file);
      res.json(ApiResponse.success({ url }, 'File uploaded successfully'));
    } catch (error) {
      next(error);
    }
  });
});

// DELETE /api/upload — delete an image from R2 by URL
router.delete('/', authenticate, async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json(ApiResponse.error('URL is required'));
    }

    await deleteFile(url);
    res.json(ApiResponse.success(null, 'File deleted successfully'));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
