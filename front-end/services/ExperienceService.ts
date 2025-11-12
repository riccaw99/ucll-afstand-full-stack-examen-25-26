import { ExperienceInput } from "@types";

const getToken = (): string => {
  const loggedInUserString = sessionStorage.getItem("loggedInUser");
  return loggedInUserString ? JSON.parse(loggedInUserString).token : "";
};

const getAllExperiences = () => {
  return fetch(process.env.NEXT_PUBLIC_API_URL + "/events", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

const getExperiencesByOrganiser = (organiserId: number) => {
  return fetch(
    process.env.NEXT_PUBLIC_API_URL + `/events/organiser/${organiserId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
};

const createExperience = (experience: ExperienceInput) => {
  return fetch(process.env.NEXT_PUBLIC_API_URL + "/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(experience),
  });
};

const ExperienceService = {
  getAllExperiences,
  getExperiencesByOrganiser,
  createExperience,
};

export default ExperienceService;
