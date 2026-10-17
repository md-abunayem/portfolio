import prisma from "../config/prisma";
import { profileUpdateSchema } from "../validations/profile.validation";

export const getProfile = async () => {
  const profile = await prisma.portfolioProfile.findUnique({
    where: { id: "default" },
  });
  return (
    profile ?? {
      id: "default",
      name: "",
      headline: null,
      shortBio: null,
      about: null,
      profileImageUrl: null,
      profileImagePublicId: null,
      heroImageUrl: null,
      heroImagePublicId: null,
      resumeUrl: null,
      updatedAt: null,
    }
  );
};

export const getPublicProfile = async () => {
  const profile = await prisma.portfolioProfile.findUnique({
    where: { id: "default" },
    select: {
      name: true,
      headline: true,
      shortBio: true,
      about: true,
      profileImageUrl: true,
      heroImageUrl: true,
      resumeUrl: true,
    },
  });
  return (
    profile ?? {
      name: "",
      headline: null,
      shortBio: null,
      about: null,
      profileImageUrl: null,
      heroImageUrl: null,
      resumeUrl: null,
    }
  );
};

export const updateProfile = (data: typeof profileUpdateSchema._output) =>
  prisma.portfolioProfile.upsert({
    where: { id: "default" },
    create: { id: "default", ...data },
    update: data,
  });
