export {};

declare global {
  namespace Express {
    interface UserPayload {
      userId: number;
      email: string;
      role: 'admin' | 'project_manager' | 'developer';
    }

    interface Request {
      user?: UserPayload;
    }
  }
}