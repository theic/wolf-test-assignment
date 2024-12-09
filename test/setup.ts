jest.mock('pdf-parse', () => {
  return jest.fn().mockImplementation(() => {
    return Promise.resolve({
      text: 'Mocked PDF content',
    });
  });
});

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
