import { Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import Car from '../models/Car';
import cloudinary from '../config/cloudinary';
import { AuthRequest } from '../middleware/auth.middleware';

export const carValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3-200 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10-2000 characters'),
  body('tags.company')
    .trim()
    .notEmpty().withMessage('Company is required'),
  body('tags.carType')
    .trim()
    .notEmpty().withMessage('Car type is required'),
  body('tags.dealer')
    .trim()
    .notEmpty().withMessage('Dealer is required'),
];

// POST /api/cars
export const createCar = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Clean up uploaded images if validation fails
      if (req.files && Array.isArray(req.files)) {
        for (const file of req.files as Express.Multer.File[]) {
          const publicId = (file as unknown as { filename: string }).filename;
          if (publicId) await cloudinary.uploader.destroy(publicId);
        }
      }
      res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
      return;
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        message: 'At least one image is required',
      });
      return;
    }

    if (files.length > 10) {
      // Clean up uploaded images
      for (const file of files) {
        const publicId = (file as unknown as { filename: string }).filename;
        if (publicId) await cloudinary.uploader.destroy(publicId);
      }
      res.status(400).json({
        success: false,
        message: 'Maximum 10 images allowed',
      });
      return;
    }

    const imageUrls = files.map((file) => (file as unknown as { path: string }).path);
    const { title, description, tags } = req.body;

    // Parse customTags if sent as string
    let customTags: string[] = [];
    if (tags?.customTags) {
      if (typeof tags.customTags === 'string') {
        try {
          customTags = JSON.parse(tags.customTags);
        } catch {
          customTags = tags.customTags.split(',').map((t: string) => t.trim()).filter(Boolean);
        }
      } else if (Array.isArray(tags.customTags)) {
        customTags = tags.customTags;
      }
    }

    const car = await Car.create({
      title,
      description,
      tags: {
        company: tags?.company,
        carType: tags?.carType,
        dealer: tags?.dealer,
        customTags,
      },
      images: imageUrls,
      createdBy: req.user!._id,
    });

    res.status(201).json({
      success: true,
      message: 'Car created successfully',
      data: car,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/cars
export const getCars = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sort = (req.query.sort as string) || '-createdAt';
    const skip = (page - 1) * limit;

    const query = { createdBy: req.user!._id };

    const [cars, total] = await Promise.all([
      Car.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Car.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: cars,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/cars/search
export const searchCars = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.trim() === '') {
      res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
      return;
    }

    const searchRegex = new RegExp(q.trim(), 'i');
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query = {
      createdBy: req.user!._id,
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { 'tags.company': searchRegex },
        { 'tags.carType': searchRegex },
        { 'tags.dealer': searchRegex },
        { 'tags.customTags': searchRegex },
      ],
    };

    const [cars, total] = await Promise.all([
      Car.find(query).sort('-createdAt').skip(skip).limit(limit).lean(),
      Car.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: cars,
      query: q,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/cars/:id
export const getCar = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const car = await Car.findOne({
      _id: req.params.id,
      createdBy: req.user!._id,
    });

    if (!car) {
      res.status(404).json({
        success: false,
        message: 'Car not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: car,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/cars/:id
export const updateCar = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const car = await Car.findOne({
      _id: req.params.id,
      createdBy: req.user!._id,
    });

    if (!car) {
      res.status(404).json({
        success: false,
        message: 'Car not found or you do not have permission to update it',
      });
      return;
    }

    const { title, description, tags, existingImages } = req.body;
    const newFiles = req.files as Express.Multer.File[];

    // Handle images: keep existing + add new
    let imageUrls: string[] = [];

    if (existingImages) {
      if (typeof existingImages === 'string') {
        try {
          imageUrls = JSON.parse(existingImages);
        } catch {
          imageUrls = [existingImages];
        }
      } else if (Array.isArray(existingImages)) {
        imageUrls = existingImages;
      }
    }

    if (newFiles && newFiles.length > 0) {
      const newUrls = newFiles.map((f) => (f as unknown as { path: string }).path);
      imageUrls = [...imageUrls, ...newUrls];
    }

    if (imageUrls.length === 0) {
      // If no images provided at all, keep existing
      imageUrls = car.images;
    }

    if (imageUrls.length > 10) {
      res.status(400).json({
        success: false,
        message: 'Maximum 10 images allowed',
      });
      return;
    }

    // Find images removed from car and delete from Cloudinary
    const removedImages = car.images.filter((img) => !imageUrls.includes(img));
    for (const imgUrl of removedImages) {
      try {
        // Extract public_id from Cloudinary URL
        const parts = imgUrl.split('/');
        const folder = parts[parts.length - 2];
        const filename = parts[parts.length - 1].split('.')[0];
        await cloudinary.uploader.destroy(`${folder}/${filename}`);
      } catch {
        // Non-critical: log but continue
        console.warn('Could not delete image from Cloudinary:', imgUrl);
      }
    }

    // Parse customTags
    let customTags: string[] = car.tags.customTags;
    if (tags?.customTags !== undefined) {
      if (typeof tags.customTags === 'string') {
        try {
          customTags = JSON.parse(tags.customTags);
        } catch {
          customTags = tags.customTags.split(',').map((t: string) => t.trim()).filter(Boolean);
        }
      } else if (Array.isArray(tags.customTags)) {
        customTags = tags.customTags;
      }
    }

    const updatedCar = await Car.findByIdAndUpdate(
      car._id,
      {
        title: title || car.title,
        description: description || car.description,
        images: imageUrls,
        tags: {
          company: tags?.company || car.tags.company,
          carType: tags?.carType || car.tags.carType,
          dealer: tags?.dealer || car.tags.dealer,
          customTags,
        },
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Car updated successfully',
      data: updatedCar,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cars/:id
export const deleteCar = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const car = await Car.findOne({
      _id: req.params.id,
      createdBy: req.user!._id,
    });

    if (!car) {
      res.status(404).json({
        success: false,
        message: 'Car not found or you do not have permission to delete it',
      });
      return;
    }

    // Delete all images from Cloudinary
    for (const imgUrl of car.images) {
      try {
        const parts = imgUrl.split('/');
        const folder = parts[parts.length - 2];
        const filename = parts[parts.length - 1].split('.')[0];
        await cloudinary.uploader.destroy(`${folder}/${filename}`);
      } catch {
        console.warn('Could not delete image from Cloudinary:', imgUrl);
      }
    }

    await Car.findByIdAndDelete(car._id);

    res.status(200).json({
      success: true,
      message: 'Car deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/cars/stats
export const getCarStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id;

    const [totalCars, companiesAgg, dealersAgg] = await Promise.all([
      Car.countDocuments({ createdBy: userId }),
      Car.aggregate([
        { $match: { createdBy: userId } },
        { $group: { _id: '$tags.company' } },
        { $count: 'count' },
      ]),
      Car.aggregate([
        { $match: { createdBy: userId } },
        { $group: { _id: '$tags.dealer' } },
        { $count: 'count' },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalCars,
        totalCompanies: companiesAgg[0]?.count || 0,
        totalDealers: dealersAgg[0]?.count || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
