# S3/MinIO Setup Guide

This project is configured to automatically download quizzes from a MinIO S3-compatible bucket during the build process.

## Configuration

### Environment Variables

You need to set the following environment variables before building:

- **`AWS_ACCESS_KEY_ID`** (required): Your MinIO access key
- **`AWS_SECRET_ACCESS_KEY`** (required): Your MinIO secret key
- **`MINIO_ENDPOINT`** (optional): MinIO server URL (defaults to `https://minio.angelator312.top`)
- **`QUIZZES_BUCKET_NAME`** (optional): Bucket name containing quizzes (defaults to `quizzes`)
- **`QUIZZES_PREFIX`** (optional): Path prefix within the bucket (defaults to empty)

### Local Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your MinIO credentials:
   ```
   AWS_ACCESS_KEY_ID=your_key_here
   AWS_SECRET_ACCESS_KEY=your_secret_here
   ```

3. Build the project:
   ```bash
   npm run build
   ```

The download script will:
- Connect to your MinIO server
- Download all files from the specified bucket
- Place them in `src/quizes` directory
- Preserve the directory structure

## Download Script Details

The download script is located at `scripts/download-quizzes.js` and:

- Automatically creates the `src/quizes` directory if it doesn't exist
- Handles nested directories and file structures
- Provides detailed logging of the download process
- Exits with an error code if credentials are invalid or bucket is unreachable
- Supports paginated listing for buckets with many files

## Troubleshooting

### "NoSuchBucket" Error
- Ensure the bucket name is correct
- Check that the bucket exists in your MinIO instance
- Verify `QUIZZES_BUCKET_NAME` environment variable if customized

### "InvalidAccessKeyId" or "SignatureDoesNotMatch" Error
- Verify your `AWS_ACCESS_KEY_ID` is correct
- Verify your `AWS_SECRET_ACCESS_KEY` is correct
- Ensure there are no leading/trailing spaces in the credentials

### "Connection Refused" Error
- Check that `MINIO_ENDPOINT` is accessible
- Verify the MinIO server is running
- For `https://minio.angelator312.top`, ensure network/firewall allows access

### Script Not Running
- Ensure `@aws-sdk/client-s3` is installed: `npm install`
- Check that environment variables are set before running `npm run build`
- Verify the script has execute permissions: `chmod +x scripts/download-quizzes.js`

## How It Works

The build process now runs in two steps:

1. **Waku Build**: Builds the application
2. **Quiz Download**: Downloads the latest quizzes from MinIO to `src/quizes`

This ensures your application always has the most current quizzes available at build time.

## Development

During development with `npm run dev`, the script does NOT run automatically. To download quizzes manually:

```bash
node scripts/download-quizzes.js
```

This is useful for testing the download process without rebuilding the entire application.
