const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET;

function generateFileName(originalName) {
  const ext = originalName.split('.').pop() || 'jpg';
  const random = crypto.randomBytes(8).toString('hex');
  return `${Date.now()}-${random}.${ext}`;
}

async function uploadFile(file) {
  const key = generateFileName(file.originalname);

  await s3Client.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read',
  }));

  const publicUrl = process.env.R2_PUBLIC_URL;
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000';
  const url = publicUrl 
    ? `${publicUrl}/${key}`
    : `${baseUrl}/api/upload/file/${key}`;
  return url;
}

async function deleteFile(url) {
  const key = url.split('/').pop();
  await s3Client.send(new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  }));
}

async function getFile(key) {
  const { GetObjectCommand } = require('@aws-sdk/client-s3');
  const response = await s3Client.send(new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  }));
  return response;
}

module.exports = { uploadFile, deleteFile, getFile };
