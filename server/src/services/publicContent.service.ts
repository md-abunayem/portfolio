import { listAchievements } from "./achievement.service";
import { listEducation } from "./education.service";
import { listExperiences } from "./experience.service";
import { listAllPublishedProjects } from "./project.service";
import { listResearch } from "./research.service";
import { listSkills } from "./skill.service";
import { listCertifications } from "./certification.service";
import { getPublicProfile } from "./profile.service";

export const getPortfolio = async () => {
  const [
    profile,
    projects,
    skills,
    experiences,
    education,
    achievements,
    research,
    certifications,
  ] =
    await Promise.all([
      getPublicProfile(),
      listAllPublishedProjects(),
      listSkills(),
      listExperiences(),
      listEducation(),
      listAchievements(),
      listResearch(),
      listCertifications(),
    ]);

  return {
    profile,
    projects,
    skills,
    experiences,
    education,
    achievements,
    research,
    certifications,
  };
};
