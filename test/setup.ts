// Mock the pdf-parse module
jest.mock('pdf-parse', () => {
  return jest.fn().mockImplementation(() => {
    return Promise.resolve({
      text: 'Mocked PDF content',
    });
  });
});

// Mock axios for AI service calls
jest.mock('axios', () => ({
  post: jest.fn().mockImplementation(() => {
    return Promise.resolve({
      data: {
        analysis: {
          strengths: ['Technical skills', 'Experience'],
          weaknesses: ['Communication'],
          overallFit: 'Good match',
        },
      },
    });
  }),
}));

// Mock environment variables
// process.env.API_ENDPOINT = 'https://test-api.example.com';
// process.env.AUTH_TOKEN = 'test-token'; 