import { randomUUID } from "node:crypto";
import { UploadApiResponse } from "cloudinary";
import { getCloudinaryClient } from "../config/cloudinary";
import prisma from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { uploadFolders } from "../validations/upload.validation";

export type UploadedImage = {
  url: string;
  publicId: string;
};

export type AssetCleanupResult =
  | "deleted"
  | "referenced"
  | "pending"
  | "not-managed";

const isUploadFolder = (
  folder: string,
): folder is (typeof uploadFolders)[number] =>
  uploadFolders.some((allowedFolder) => allowedFolder === folder);

const uploadBufferToCloudinary = (
  buffer: Buffer,
  folder: (typeof uploadFolders)[number],
) =>
  new Promise<UploadApiResponse>((resolve, reject) => {
    const client = getCloudinaryClient();
    const stream = client.uploader.upload_stream(
      {
        folder,
        public_id: randomUUID(),
        resource_type: "image",
        overwrite: false,
        unique_filename: false,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result);
        } else {
          reject(new Error("Cloudinary returned an empty upload response."));
        }
      },
    );
    stream.end(buffer);
  });

const deleteRemoteAsset = async (publicId: string) => {
  const result = await getCloudinaryClient().uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  });
  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error("Cloudinary did not confirm asset deletion.");
  }
};

export const uploadImage = async (
  buffer: Buffer,
  folder: (typeof uploadFolders)[number],
): Promise<UploadedImage> => {
  let uploaded: UploadApiResponse;
  try {
    uploaded = await uploadBufferToCloudinary(buffer, folder);
  } catch (error) {
    if (error instanceof ApiError) throw error;

    const httpCode =
      error && typeof error === "object" && "http_code" in error
        ? error.http_code
        : undefined;
    if (httpCode === 401 || httpCode === 403) {
      console.error("Cloudinary rejected image upload credentials.", { httpCode });
      throw new ApiError(
        503,
        "Cloudinary rejected the upload credentials. Verify that the cloud name, API key, and API secret belong to the same Cloudinary account.",
      );
    }

    console.error("Cloudinary image upload failed.", { httpCode });
    throw new ApiError(502, "The image could not be uploaded to Cloudinary.");
  }

  try {
    await prisma.mediaAsset.create({
      data: {
        publicId: uploaded.public_id,
        url: uploaded.secure_url,
        folder,
      },
    });
    return { url: uploaded.secure_url, publicId: uploaded.public_id };
  } catch (error) {
    try {
      await deleteRemoteAsset(uploaded.public_id);
    } catch {
      console.error(
        "Cloudinary upload cleanup failed after the asset registry write failed.",
      );
    }
    console.error("Cloudinary asset registry write failed.", error);
    throw new ApiError(
      500,
      "The image reached Cloudinary but could not be registered. Please try again.",
    );
  }
};

export const uploadImages = async (
  buffers: Buffer[],
  folder: (typeof uploadFolders)[number],
) => {
  const uploaded: UploadedImage[] = [];
  try {
    for (const buffer of buffers) {
      uploaded.push(await uploadImage(buffer, folder));
    }
    return uploaded;
  } catch (error) {
    await Promise.all(
      uploaded.map(async (asset) => {
        try {
          await requestAssetCleanup(asset.publicId);
        } catch {
          console.error(
            "Cloudinary cleanup could not be queued after a partial batch upload.",
            { publicId: asset.publicId },
          );
        }
      }),
    );
    throw error;
  }
};

export const validateManagedAsset = async (url: string, publicId: string) => {
  const asset = await prisma.mediaAsset.findUnique({ where: { publicId } });
  if (!asset || asset.url !== url) {
    throw new ApiError(
      400,
      "Image metadata must match an image uploaded through the admin upload API.",
    );
  }
};

const imageMetadataPairs = [
  ["image", "imagePublicId"],
  ["imageUrl", "imagePublicId"],
  ["companyLogoUrl", "companyLogoPublicId"],
  ["institutionLogoUrl", "institutionLogoPublicId"],
  ["profileImageUrl", "profileImagePublicId"],
  ["heroImageUrl", "heroImagePublicId"],
] as const;

export const validateImageReferences = async (record: unknown) => {
  if (!record || typeof record !== "object") return;
  const values = record as Record<string, unknown>;
  for (const [urlField, publicIdField] of imageMetadataPairs) {
    const url = values[urlField];
    const publicId = values[publicIdField];
    if (typeof url === "string" && typeof publicId === "string") {
      await validateManagedAsset(url, publicId);
    }
  }
};

export const collectImagePublicIds = (record: unknown): string[] => {
  if (!record || typeof record !== "object") return [];
  return [
    ...new Set(
      Object.entries(record)
        .flatMap(([key, value]) =>
          key.endsWith("PublicId") && typeof value === "string" ? [value] : [],
        ),
    ),
  ];
};

const isAssetReferenced = async (publicId: string) => {
  const referenceCounts = await Promise.all([
    prisma.project.count({ where: { imagePublicId: publicId } }),
    prisma.skill.count({ where: { imagePublicId: publicId } }),
    prisma.achievement.count({ where: { imagePublicId: publicId } }),
    prisma.education.count({ where: { institutionLogoPublicId: publicId } }),
    prisma.experience.count({ where: { companyLogoPublicId: publicId } }),
    prisma.research.count({ where: { imagePublicId: publicId } }),
    prisma.certification.count({ where: { imagePublicId: publicId } }),
    prisma.portfolioProfile.count({
      where: {
        OR: [
          { profileImagePublicId: publicId },
          { heroImagePublicId: publicId },
        ],
      },
    }),
  ]);
  return referenceCounts.some((count) => count > 0);
};

export const requestAssetCleanup = async (
  publicId: string,
): Promise<AssetCleanupResult> => {
  const asset = await prisma.mediaAsset.findUnique({ where: { publicId } });
  if (!asset) return "not-managed";

  await prisma.mediaAsset.update({
    where: { publicId },
    data: { deleteRequestedAt: new Date() },
  });

  if (await isAssetReferenced(publicId)) {
    await prisma.mediaAsset.update({
      where: { publicId },
      data: { deleteRequestedAt: null },
    });
    return "referenced";
  }

  try {
    await deleteRemoteAsset(publicId);
    await prisma.mediaAsset.delete({ where: { publicId } });
    return "deleted";
  } catch {
    console.error("Cloudinary asset cleanup is queued for retry.", { publicId });
    return "pending";
  }
};

export const deleteManagedAsset = async (publicId: string) => {
  const asset = await prisma.mediaAsset.findUnique({ where: { publicId } });
  if (!asset || !isUploadFolder(asset.folder)) {
    throw new ApiError(404, "Managed Cloudinary image not found.");
  }
  if (await isAssetReferenced(publicId)) {
    throw new ApiError(
      409,
      "This image is still referenced by portfolio content and cannot be deleted.",
    );
  }

  const result = await requestAssetCleanup(publicId);
  if (result === "referenced") {
    throw new ApiError(
      409,
      "This image is still referenced by portfolio content and cannot be deleted.",
    );
  }
  return { publicId, deletionPending: result === "pending" };
};

export const retryPendingAssetCleanup = async () => {
  const orphanedBefore = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const assets = await prisma.mediaAsset.findMany({
    where: {
      OR: [
        { deleteRequestedAt: { not: null } },
        { createdAt: { lte: orphanedBefore } },
      ],
    },
    orderBy: [{ deleteRequestedAt: "asc" }, { createdAt: "asc" }],
    take: 100,
  });

  let deleted = 0;
  let pending = 0;
  for (const asset of assets) {
    const result = await requestAssetCleanup(asset.publicId);
    if (result === "deleted") deleted += 1;
    if (result === "pending") pending += 1;
  }

  return { attempted: assets.length, deleted, pending };
};
