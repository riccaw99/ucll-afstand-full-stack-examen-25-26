import { credentials } from "@types";

const loginUser = (credentials: credentials) => {
  return fetch(process.env.NEXT_PUBLIC_API_URL + "/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });
};

const UserService = {
  loginUser,
};

export default UserService;
