import classNames from "classnames";
import { useRouter } from "next/router";
import React, { useState } from "react";
import UserService from "@services/UserService";
import { StatusMessage, LoggedInUser } from "@types";
import { useTranslation } from "next-i18next";

const UserLoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [statusMessages, setStatusMessages] = useState<StatusMessage[]>([]);
  const router = useRouter();
  const { t } = useTranslation();

  const clearErrors = () => {
    setStatusMessages([]);
    setEmailError(null);
    setPasswordError(null);
  };
  const validate = (): boolean => {
    let result = true;

    if (!email || email.trim() === "") {
      setEmailError(t("login.validate.emailRequired"));
      result = false;
    }
    if (!password || password.trim() === "") {
      setPasswordError(t("login.validate.password"));
      result = false;
    }
    return result;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearErrors();

    if (!validate()) return;

    const user = { email, password };
    const res = await UserService.loginUser(user);
    const data = await res.json();

    if (res.status === 200) {
      setStatusMessages([{ message: t("login.success"), type: "success" }]);

      const user: LoggedInUser = {
        id: data.id,
        token: data.token,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
      };
      sessionStorage.setItem("loggedInUser", JSON.stringify(user));

      setTimeout(() => {
        router.push("/");
      }, 1200);
    } else if (res.status === 401) {
      const msg = data?.errorMessage ?? t("general.error");
      setStatusMessages([{ message: msg, type: "error" }]);
    } else {
      setStatusMessages([{ message: t("general.error"), type: "error" }]);
    }
  };

  return (
    <div className="max-w-sm m-auto">
      <h3 className="px-0">{t("login.title")}</h3>

      {!!statusMessages.length && (
        <div className="row">
          <ul className="list-none mb-3 mx-auto">
            {statusMessages.map(({ message, type }, index) => (
              <li
                key={index}
                className={classNames({
                  "text-red-800": type === "error",
                  "text-green-800": type === "success",
                })}
              >
                {message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="emailInput"
            className="block mb-2 text-sm font-medium"
          >
            {t("login.label.email")}
          </label>
          <input
            id="emailInput"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          />
          {emailError && <div className="text-red-800">{emailError}</div>}
        </div>

        <div className="mt-2">
          <label
            htmlFor="passwordInput"
            className="block mb-2 text-sm font-medium"
          >
            {t("login.label.password")}
          </label>
          <input
            id="passwordInput"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          />
          {passwordError && <div className="text-red-800">{passwordError}</div>}
        </div>

        <div className="row mt-3">
          <button
            className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            type="submit"
          >
            {t("login.button")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserLoginForm;
