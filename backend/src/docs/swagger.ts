import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Car Management API',
      version: '1.0.0',
      description: 'A production-ready Car Management API with authentication, CRUD operations, image uploads, and global search.',
      contact: {
        name: 'API Support',
        email: 'support@carmanagement.com',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? 'https://your-render-app.onrender.com'
          : `http://localhost:${process.env.PORT || 5000}`,
        description: process.env.NODE_ENV === 'production' ? 'Production' : 'Development',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token from login/register response',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '66a123abc456def789012345' },
            fullName: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        CarTags: {
          type: 'object',
          properties: {
            company: { type: 'string', example: 'Toyota' },
            carType: { type: 'string', example: 'SUV' },
            dealer: { type: 'string', example: 'AutoDealer Pro' },
            customTags: {
              type: 'array',
              items: { type: 'string' },
              example: ['luxury', 'awd', '2024'],
            },
          },
        },
        Car: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '66a123abc456def789012345' },
            title: { type: 'string', example: '2024 Toyota RAV4 XLE Premium' },
            description: { type: 'string', example: 'Excellent condition, one owner, full service history' },
            tags: { $ref: '#/components/schemas/CarTags' },
            images: {
              type: 'array',
              items: { type: 'string', format: 'uri' },
              example: ['https://res.cloudinary.com/demo/image/upload/sample.jpg'],
            },
            createdBy: { type: 'string', example: '66a123abc456def789012345' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Login successful' },
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            user: { $ref: '#/components/schemas/User' },
          },
        },
        CarResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Car created successfully' },
            data: { $ref: '#/components/schemas/Car' },
          },
        },
        CarsListResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Car' },
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 10 },
                total: { type: 'integer', example: 25 },
                pages: { type: 'integer', example: 3 },
                hasNext: { type: 'boolean', example: true },
                hasPrev: { type: 'boolean', example: false },
              },
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Unauthorized' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Cars', description: 'Car management endpoints' },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
