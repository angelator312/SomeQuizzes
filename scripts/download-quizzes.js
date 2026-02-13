#!/usr/bin/env node

import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { createWriteStream, mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = dirname(__dirname);

// Configuration from environment variables
const minioEndpoint = process.env.MINIO_ENDPOINT || 'https://minio.angelator312.top';
const bucketName = process.env.QUIZZES_BUCKET_NAME || 'quizzes';
const prefix = process.env.QUIZZES_PREFIX || '';
const downloadDir = `${projectRoot}/src/quizes`;

// Validate required environment variables
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.error('❌ Error: AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables are required');
  process.exit(1);
}

// Initialize S3 client with MinIO configuration
const s3Client = new S3Client({
  endpoint: minioEndpoint,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true, // Required for MinIO
});

async function downloadQuizzes() {
  try {
    console.log(`📥 Downloading quizzes from MinIO: ${minioEndpoint}/${bucketName}`);
    console.log(`📂 Destination: ${downloadDir}`);

    // Ensure download directory exists
    if (!existsSync(downloadDir)) {
      mkdirSync(downloadDir, { recursive: true });
      console.log(`✅ Created directory: ${downloadDir}`);
    }

    // List all objects in the bucket
    let continuationToken;
    let fileCount = 0;

    do {
      const listCommand = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      });

      const listResponse = await s3Client.send(listCommand);

      if (!listResponse.Contents || listResponse.Contents.length === 0) {
        console.log('⚠️  No files found in bucket');
        break;
      }

      // Download each object
      for (const object of listResponse.Contents) {
        if (object.Key.endsWith('/')) {
          // Skip directories
          continue;
        }

        const fileName = object.Key.replace(prefix, '').replace(/^\//, '');
        const filePath = `${downloadDir}/${fileName}`;
        const fileDir = dirname(filePath);

        // Create directory structure
        if (!existsSync(fileDir)) {
          mkdirSync(fileDir, { recursive: true });
        }

        // Download the file
        const getCommand = new GetObjectCommand({
          Bucket: bucketName,
          Key: object.Key,
        });

        const getResponse = await s3Client.send(getCommand);
        const writeStream = createWriteStream(filePath);

        await new Promise((resolve, reject) => {
          getResponse.Body.pipe(writeStream);
          writeStream.on('finish', resolve);
          writeStream.on('error', reject);
        });

        fileCount++;
        console.log(`✅ Downloaded: ${fileName}`);
      }

      continuationToken = listResponse.NextContinuationToken;
    } while (continuationToken);

    console.log(`\n✨ Successfully downloaded ${fileCount} file(s) from MinIO`);
  } catch (error) {
    console.error('❌ Error downloading quizzes:', error.message);
    if (error.code === 'NoSuchBucket') {
      console.error(`   Bucket "${bucketName}" does not exist on MinIO`);
    } else if (error.code === 'InvalidAccessKeyId') {
      console.error('   Invalid AWS credentials. Check AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY');
    } else if (error.code === 'SignatureDoesNotMatch') {
      console.error('   Invalid AWS secret key. Check AWS_SECRET_ACCESS_KEY');
    }
    process.exit(1);
  }
}

downloadQuizzes();
