import multer, { MulterError } from "multer";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { ApiError } from "../utils/ApiError";

const imageMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10,
    fields: 1,
    fieldSize: 256,
    parts: 11,
  },
  fileFilter(_req, file, callback) {
    if (!imageMimeTypes.has(file.mimetype)) {
      callback(new ApiError(400, "Only JPEG, PNG, WebP, or AVIF images are allowed."));
      return;
    }
    callback(null, true);
  },
});

export const isValidImageContent = (buffer: Buffer, mimeType?: string) => {
  let detectedMimeType: string | undefined;
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    detectedMimeType = "image/jpeg";
  }

  if (!detectedMimeType &&
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    detectedMimeType = "image/png";
  }

  if (!detectedMimeType &&
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    detectedMimeType = "image/webp";
  }

  if (!detectedMimeType &&
    buffer.length >= 12 &&
    buffer.toString("ascii", 4, 8) === "ftyp" &&
    ["avif", "avis"].includes(buffer.toString("ascii", 8, 12))
  ) {
    detectedMimeType = "image/avif";
  }

  return Boolean(detectedMimeType && (!mimeType || detectedMimeType === mimeType));
};

const parseMultipart = (
  parser: RequestHandler,
  validate: (req: Request) => boolean,
  missingMessage: string,
): RequestHandler => (req: Request, res: Response, next: NextFunction) => {
  parser(req, res, (error) => {
    if (error) {
      next(error);
      return;
    }

    if (!validate(req)) {
      next(new ApiError(400, missingMessage));
      return;
    }

    const files =
      "file" in req && req.file
        ? [req.file]
        : "files" in req && Array.isArray(req.files)
          ? req.files
          : [];
    if (
      files.some(
        (file) => !isValidImageContent(file.buffer, file.mimetype),
      )
    ) {
      next(new ApiError(400, "Uploaded file content is not a supported image."));
      return;
    }

    next();
  });
};

export const uploadSingleImage = parseMultipart(
  upload.single("image"),
  (req) => "file" in req && Boolean(req.file),
  "An image file is required in the 'image' field.",
);

export const uploadMultipleImages = parseMultipart(
  upload.array("images", 10),
  (req) => "files" in req && Array.isArray(req.files) && req.files.length > 0,
  "At least one image is required in the 'images' field.",
);

export { MulterError };
