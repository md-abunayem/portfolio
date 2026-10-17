import assert from "node:assert/strict";
import test from "node:test";
import { loginSchema } from "../src/validations/auth.validation";
import { experienceCreateSchema } from "../src/validations/experience.validation";
import { messageCreateSchema } from "../src/validations/message.validation";
import { projectCreateSchema, projectUpdateSchema } from "../src/validations/project.validation";
import { skillUpdateSchema } from "../src/validations/skill.validation";
import { certificationCreateSchema } from "../src/validations/certification.validation";
import { profileUpdateSchema } from "../src/validations/profile.validation";
import { uploadRequestSchema } from "../src/validations/upload.validation";
import { isValidImageContent } from "../src/middlewares/upload.middleware";

test("login emails are normalized before service use", () => {
  const result = loginSchema.parse({
    email: " Admin@Example.com ",
    password: "correct horse battery staple",
  });
  assert.equal(result.email, "admin@example.com");
});

test("project validation rejects case-insensitive duplicate technologies", () => {
  const result = projectCreateSchema.safeParse({
    title: "Portfolio",
    slug: "portfolio",
    description: "Portfolio project",
    technologies: ["React", " react "],
  });
  assert.equal(result.success, false);
});

test("PATCH schemas reject empty updates", () => {
  assert.equal(projectUpdateSchema.safeParse({}).success, false);
  assert.equal(skillUpdateSchema.safeParse({}).success, false);
});

test("experience validation enforces date order and current role end dates", () => {
  const base = {
    company: "Example",
    position: "Engineer",
    description: "Builds software",
    startDate: "2024-01-01",
  };
  assert.equal(
    experienceCreateSchema.safeParse({
      ...base,
      endDate: "2023-01-01",
    }).success,
    false,
  );
  assert.equal(
    experienceCreateSchema.safeParse({
      ...base,
      current: true,
      endDate: "2025-01-01",
    }).success,
    false,
  );
  const valid = experienceCreateSchema.parse({ ...base, current: true });
  assert.ok(valid.startDate instanceof Date);
});

test("contact validation trims fields and normalizes email", () => {
  const result = messageCreateSchema.parse({
    name: "  Visitor ",
    email: " Visitor@Example.com ",
    subject: " Inquiry ",
    message: "  Hello ",
  });
  assert.equal(result.name, "Visitor");
  assert.equal(result.email, "visitor@example.com");
  assert.equal(result.subject, "Inquiry");
  assert.equal(result.message, "Hello");
});

test("project images require a secure Cloudinary URL and matching public ID", () => {
  const base = {
    title: "Portfolio",
    slug: "portfolio",
    description: "Portfolio project",
  };
  assert.equal(projectCreateSchema.safeParse(base).success, true);
  assert.equal(
    projectCreateSchema.safeParse({
      ...base,
      image: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    }).success,
    false,
  );
  assert.equal(
    projectCreateSchema.safeParse({
      ...base,
      image: "https://example.com/image.jpg",
      imagePublicId: "portfolio/projects/sample",
    }).success,
    false,
  );
  assert.equal(
    projectCreateSchema.safeParse({
      ...base,
      image: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      imagePublicId: "portfolio/projects/sample",
    }).success,
    true,
  );
});

test("profile image fields must be updated as URL and public ID pairs", () => {
  assert.equal(profileUpdateSchema.safeParse({ headline: "Developer" }).success, true);
  assert.equal(
    profileUpdateSchema.safeParse({
      profileImageUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    }).success,
    false,
  );
});

test("certifications reject expiry dates before issue dates", () => {
  assert.equal(
    certificationCreateSchema.safeParse({
      title: "Cloud certification",
      issueDate: "2025-01-01",
      expiryDate: "2024-01-01",
    }).success,
    false,
  );
});

test("upload folder validation only accepts predefined portfolio folders", () => {
  assert.equal(
    uploadRequestSchema.safeParse({ folder: "portfolio/projects" }).success,
    true,
  );
  assert.equal(
    uploadRequestSchema.safeParse({ folder: "private/arbitrary" }).success,
    false,
  );
});

test("upload content validation checks image signatures", () => {
  assert.equal(
    isValidImageContent(Buffer.from([0xff, 0xd8, 0xff, 0x00]), "image/jpeg"),
    true,
  );
  assert.equal(
    isValidImageContent(Buffer.from([0xff, 0xd8, 0xff, 0x00]), "image/png"),
    false,
  );
  assert.equal(isValidImageContent(Buffer.from("not an image")), false);
});
