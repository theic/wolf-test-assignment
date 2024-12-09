# CV Analysis API

This API service analyzes CVs against job descriptions using AI to provide detailed candidate assessments.

## Features

- PDF parsing for both CVs and job descriptions
- AI-powered analysis using Gemini API
- tRPC endpoints for type-safe API calls
- Detailed analysis of candidate strengths, weaknesses, and job fit
- Built-in rate limiting (20 req/min, 300 req/hour)

## Setup

1. Clone the repository:

```bash
git clone git@github.com:theic/wolf-test-assignment.git
```

2. Install dependencies:

```bash
npm install
```

3. Create a .env file:

```bash
cp .env.example .env
```

4. Start the server:

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## API Usage

The API exposes a tRPC endpoint for CV analysis. Here's an example using the tRPC client:

```typescript
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './modules/analysis/analysis.router';

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/trpc',
    }),
  ],
});

// Example usage
// First, upload the files
const cvUpload = await client.uploadFile.mutate({
  file: Array.from(cvPdfBuffer),
  type: 'cv',
  filename: 'resume.pdf'
});

const jobDescUpload = await client.uploadFile.mutate({
  file: Array.from(jobDescPdfBuffer),
  type: 'jobDescription',
  filename: 'job.pdf'
});

// Then analyze using the file IDs
const analysis = await client.analyze.mutate({
  cvId: cvUpload.fileId,
  jobDescriptionId: jobDescUpload.fileId
});
```

## Rate Limits

- 20 requests per minute
- 300 requests per hour

## Testing

Run the test suite:

```bash
npm test
```
