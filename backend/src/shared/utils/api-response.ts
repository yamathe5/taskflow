type SuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type ErrorResponse = {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
};

export function successResponse<T>(params: {
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}): SuccessResponse<T> {
  return {
    success: true,
    message: params.message,
    data: params.data,
    ...(params.meta ? { meta: params.meta } : {}),
  };
}

export function errorResponse(params: {
  message: string;
  errors?: Record<string, string[]>;
}): ErrorResponse {
  return {
    success: false,
    message: params.message,
    ...(params.errors ? { errors: params.errors } : {}),
  };
}

export function buildPaginationMeta(params: {
  page: number;
  limit: number;
  total: number;
}) {
  return {
    page: params.page,
    limit: params.limit,
    total: params.total,
    totalPages: Math.ceil(params.total / params.limit),
  };
}