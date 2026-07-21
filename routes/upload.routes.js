const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const { uploadFile, deleteFile } = require('../services/upload.service');
const ApiResponse = require('../utils/ApiResponse');
const { restrictTo } = require('../middleware/role.middleware');

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
router.delete('/', authenticate, restrictTo('ADMIN', 'VENDOR'), async (req, res, next) => {
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

// GET /api/upload/file/:key — serve an image from R2 through backend proxy
router.get('/file/:key', async (req, res, next) => {
  try {
    const { getFile } = require('../services/upload.service');
    const response = await getFile(req.params.key);
    res.setHeader('Content-Type', response.ContentType);
    response.Body.pipe(res);
  } catch (error) {
    res.status(404).send('Image not found');
  }
});

module.exports = router;
