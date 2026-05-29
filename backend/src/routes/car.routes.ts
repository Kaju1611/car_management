import { Router } from 'express';
import {
  createCar,
  getCars,
  getCar,
  updateCar,
  deleteCar,
  searchCars,
  getCarStats,
  carValidation,
} from '../controllers/car.controller';
import { protect } from '../middleware/auth.middleware';
import { upload } from '../config/cloudinary';

const router = Router();

// All car routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/cars/search:
 *   get:
 *     summary: Search cars by title, description, company, dealer, carType, or custom tags
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *         example: toyota
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CarsListResponse'
 *       400:
 *         description: Query parameter missing
 *       401:
 *         description: Unauthorized
 */
router.get('/search', searchCars);

/**
 * @swagger
 * /api/cars/stats:
 *   get:
 *     summary: Get dashboard statistics for logged-in user
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalCars:
 *                       type: integer
 *                     totalCompanies:
 *                       type: integer
 *                     totalDealers:
 *                       type: integer
 */
router.get('/stats', getCarStats);

/**
 * @swagger
 * /api/cars:
 *   get:
 *     summary: Get all cars for the logged-in user
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [-createdAt, createdAt]
 *           default: -createdAt
 *     responses:
 *       200:
 *         description: List of cars
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CarsListResponse'
 *       401:
 *         description: Unauthorized
 */
router.get('/', getCars);

/**
 * @swagger
 * /api/cars:
 *   post:
 *     summary: Create a new car listing
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: ["title", "description", "tags[company]", "tags[carType]", "tags[dealer]", "images"]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               tags[company]:
 *                 type: string
 *               tags[carType]:
 *                 type: string
 *               tags[dealer]:
 *                 type: string
 *               tags[customTags]:
 *                 type: string
 *                 description: JSON array string or comma-separated
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 10
 *     responses:
 *       201:
 *         description: Car created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CarResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', upload.array('images', 10), carValidation, createCar);

/**
 * @swagger
 * /api/cars/{id}:
 *   get:
 *     summary: Get a single car by ID (owner only)
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Car data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CarResponse'
 *       404:
 *         description: Car not found
 */
router.get('/:id', getCar);

/**
 * @swagger
 * /api/cars/{id}:
 *   put:
 *     summary: Update a car (owner only)
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               tags[company]:
 *                 type: string
 *               tags[carType]:
 *                 type: string
 *               tags[dealer]:
 *                 type: string
 *               tags[customTags]:
 *                 type: string
 *               existingImages:
 *                 type: string
 *                 description: JSON array of existing image URLs to keep
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Car updated successfully
 *       404:
 *         description: Car not found
 */
router.put('/:id', upload.array('images', 10), updateCar);

/**
 * @swagger
 * /api/cars/{id}:
 *   delete:
 *     summary: Delete a car (owner only)
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Car deleted successfully
 *       404:
 *         description: Car not found
 */
router.delete('/:id', deleteCar);

export default router;
