'use server';

import { execSync } from 'child_process';

export async function downloadQuizzesFromMinIO(): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> {
  try {
    // Execute the download script
    const result = execSync('node scripts/download-quizzes.js', {
      cwd: process.cwd(),
      encoding: 'utf-8',
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
