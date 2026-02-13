import { execSync } from 'child_process';

/**
 * Downloads quizzes from MinIO by executing the download script
 * This function should only be called from a server-side context
 */
export async function downloadQuizzesFromMinIO(): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> {
  try {
    console.log('[Download] Starting quiz download from MinIO...');
    
    // Execute the download script
    const result = execSync('node scripts/download-quizzes.js', {
      cwd: process.cwd(),
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    
    console.log('[Download] Script output:', result);
    
    return {
      success: true,
      message: 'Quizzes downloaded successfully',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Download] Error downloading quizzes:', errorMessage);
    
    return {
      success: false,
      message: 'Failed to download quizzes',
      error: errorMessage,
    };
  }
}
