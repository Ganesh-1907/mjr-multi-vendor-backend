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

  const url = `${process.env.R2_ENDPOINT}/${BUCKET}/${key}`;
  return url;
}

async function deleteFile(url) {
  const key = url.split('/').pop();
  await s3Client.send(new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  }));
}

module.exports = { uploadFile, deleteFile };
