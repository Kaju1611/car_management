export interface User {
  _id: string;
  fullName: string;
  email: string;
  createdAt: string;
}

export interface CarTags {
  company: string;
  carType: string;
  dealer: string;
  customTags: string[];
}

export interface Car {
  _id: string;
  title: string;
  description: string;
  tags: CarTags;
  images: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface CarsListResponse {
  success: boolean;
  data: Car[];
  pagination: Pagination;
  query?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface CarStats {
  totalCars: number;
  totalCompanies: number;
  totalDealers: number;
}

export interface RegisterForm {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface CarFormData {
  title: string;
  description: string;
  company: string;
  carType: string;
  dealer: string;
  customTags: string;
}
