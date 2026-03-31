'use server';

import { execSync } from 'child_process';

export async function downloadQuizzesFromMinIO(): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> {
  try {
    // Check for required environment variables
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      return {
        success: false,
        message: 'Missing AWS credentials',
        error: 'AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables are required. Please set them in your .env file or environment.',
      };
    }

    // Execute the download script
    const result = execSync('node scripts/download-quizzes.js', {
      cwd: process.cwd(),
      encoding: 'utf-8',
      env: {
        ...process.env,
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
        MINIO_ENDPOINT: process.env.MINIO_ENDPOINT || 'https://minio.angelator312.top',
        QUIZZES_BUCKET_NAME: process.env.QUIZZES_BUCKET_NAME || 'quizzes',
      },
    });

    return {
      success: true,
      message: 'Quizzes downloaded successfully!',
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to download quizzes';
    console.error('Download error:', errorMessage);

    return {
      success: false,
      message: 'Failed to download quizzes',
      error: errorMessage,
    };
  }
}
