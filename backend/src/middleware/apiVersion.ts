import { Request, Response, NextFunction } from 'express';

const API_VERSION = 'v1';
const SUPPORTED_VERSIONS = ['v1'];

export const apiVersionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Set API version header
  res.setHeader('X-API-Version', API_VERSION);
  res.setHeader('X-API-Supported-Versions', SUPPORTED_VERSIONS.join(', '));

  // Add version info to response
  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    if (body && typeof body === 'object') {
      body.apiVersion = API_VERSION;
    }
    return originalJson(body);
  };

  next();
};

export const versionedRoute = (version: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const requestVersion = req.headers['x-api-version'] || version;

    if (!SUPPORTED_VERSIONS.includes(requestVersion as string)) {
      return res.status(400).json({
        status: 'fail',
        message: `Unsupported API version. Supported versions: ${SUPPORTED_VERSIONS.join(', ')}`,
      });
    }

    next();
  };
};
