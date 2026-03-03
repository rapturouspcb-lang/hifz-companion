export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Hifz Companion API',
    version: '1.0.0',
    description: 'A production-grade Quran memorization companion API for Huffaz',
    contact: {
      name: 'API Support',
      email: 'support@hifz-companion.com',
    },
  },
  servers: [
    { url: 'http://localhost:3001/api/v1', description: 'Development server' },
    { url: 'https://api.hifz-companion.com/api/v1', description: 'Production server' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          displayName: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Surah: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          nameArabic: { type: 'string' },
          nameEnglish: { type: 'string' },
          ayahCount: { type: 'integer' },
          revelationType: { type: 'string', enum: ['Meccan', 'Medinan'] },
        },
      },
      Ayah: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          surahId: { type: 'integer' },
          ayahNumber: { type: 'integer' },
          textArabic: { type: 'string' },
          textUrdu: { type: 'string', nullable: true },
          textEnglish: { type: 'string', nullable: true },
        },
      },
      Error: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['fail', 'error'] },
          message: { type: 'string' },
          code: { type: 'string', nullable: true },
        },
      },
    },
  },
  paths: {
    '/users/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  displayName: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'User registered successfully' },
          '400': { description: 'Validation error' },
          '409': { description: 'Email already registered' },
        },
      },
    },
    '/users/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Login successful' },
          '401': { description: 'Invalid credentials' },
        },
      },
    },
    '/quran/surahs': {
      get: {
        tags: ['Quran'],
        summary: 'Get all surahs',
        responses: {
          '200': {
            description: 'List of all surahs',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Surah' },
                },
              },
            },
          },
        },
      },
    },
    '/quran/surahs/{id}': {
      get: {
        tags: ['Quran'],
        summary: 'Get surah by ID with ayahs',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          '200': { description: 'Surah details with ayahs' },
          '404': { description: 'Surah not found' },
        },
      },
    },
    '/progress': {
      get: {
        tags: ['Progress'],
        summary: 'Get user progress overview',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Progress overview' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/progress/revision/plan': {
      get: {
        tags: ['Progress'],
        summary: 'Get daily revision plan',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Revision plan' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/progress/mistakes': {
      get: {
        tags: ['Progress'],
        summary: 'Get user mistakes',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'List of mistakes' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/search': {
      get: {
        tags: ['Search'],
        summary: 'Search Quran',
        parameters: [
          { name: 'q', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['all', 'arabic', 'translation'] } },
        ],
        responses: {
          '200': { description: 'Search results' },
        },
      },
    },
  },
};
