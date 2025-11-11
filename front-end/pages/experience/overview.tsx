import Head from "next/head";
import { useEffect, useState } from "react";
import Header from "@components/header";
import CreateExperienceForm from "@components/experiences/CreateExperienceForm";
import { Experience, LoggedInUser } from "@types";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import ExperienceService from "@services/ExperienceService";
import Link from "next/link";

const Experiences: React.FC = () => {
  const [error, setError] = useState<string>("");
  const [loggedInUser, setLoggedInUser] = useState<LoggedInUser | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    const loggedInUserString = sessionStorage.getItem("loggedInUser");
    if (loggedInUserString) {
      setLoggedInUser(JSON.parse(loggedInUserString));
    }
  }, []);

  const getExperiences = async () => {
    setError("");
    const response = await ExperienceService.getAllExperiences();
    if (!response.ok) {
      setError(
        response.status === 401
          ? "You are not authorized to view this page. Please login first."
          : response.statusText
      );
      return;
    }
    const experiencesData: Experience[] = await response.json();
    setExperiences(experiencesData);
  };

  const getMyExperiences = async () => {
    if (!loggedInUser?.id) return;
    setError("");
    const response = await ExperienceService.getExperiencesByOrganiser(
      loggedInUser.id
    );
    if (!response.ok) {
      setError(
        response.status === 401
          ? "You are not authorized to view this page. Please login first."
          : response.statusText
      );
      return;
    }
    const experiencesData: Experience[] = await response.json();
    setExperiences(experiencesData);
  };

  useEffect(() => {
    if (loggedInUser) {
      getExperiences();
      setShowOnlyMine(false);
    }
  }, [loggedInUser]);

  const handleToggleMine = async () => {
    if (!loggedInUser) return;
    if (showOnlyMine) {
      await getExperiences();
      setShowOnlyMine(false);
    } else {
      await getMyExperiences();
      setShowOnlyMine(true);
    }
  };

  return (
    <>
      <Head>
        <title>Experiences</title>
      </Head>
      <Header />

      <main className="p-6 min-h-screen flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-6">Travel Experiences</h1>

        {/* Niet-ingelogd */}
        {!loggedInUser && (
          <div className="mt-8 text-center max-w-md">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-blue-800 mb-2">
                Login Required
              </h2>
              <p className="text-blue-700 mb-4">
                You need to be logged in to view travel experiences. Please log
                in to discover amazing experiences and events!
              </p>
              <Link
                href="/login"
                className="bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg text-sm px-5 py-2.5 inline-block"
              >
                Go to Login
              </Link>
            </div>
          </div>
        )}

        {/* Ingelogd */}
        {loggedInUser && (
          <>
            {loggedInUser.role === "ORGANISER" && (
              <div className="mt-4 mb-4 flex gap-3">
                <button
                  onClick={handleToggleMine}
                  className="bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg text-sm px-5 py-2.5"
                >
                  {showOnlyMine ? "Show All Experiences" : "Show Only Mine"}
                </button>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg text-sm px-5 py-2.5"
                >
                  Create New Experience
                </button>
              </div>
            )}

            {error && <div className="text-red-800">{error}</div>}

            <div className="mt-4 w-full max-w-3xl">
              <h2 className="text-xl font-semibold mb-4">
                {showOnlyMine ? "My Experiences" : "Available Experiences"} (
                {experiences.length})
              </h2>

              {experiences.length === 0 ? (
                <p>No experiences found.</p>
              ) : (
                <div className="grid gap-4">
                  {experiences.map((e) => (
                    <div
                      key={e.id}
                      className="p-4 border rounded-lg bg-white shadow-sm"
                    >
                      <h3 className="font-bold text-lg">{e.name}</h3>
                      <p className="text-gray-600 mb-2">{e.description}</p>
                      <p className="text-sm">📍 {e.location}</p>
                      <p className="text-sm">
                        📅 {new Date(String(e.date)).toLocaleDateString()}
                      </p>
                      <p className="text-sm">
                        👤 Organiser: {e.organiser?.firstName}{" "}
                        {e.organiser?.lastName}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {showCreateForm && loggedInUser?.role === "ORGANISER" && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* backdrop */}
                <div
                  className="absolute inset-0 bg-black/50"
                  onClick={() => setShowCreateForm(false)}
                  aria-hidden="true"
                />

                {/* modal content */}
                <div className="relative z-10 w-[92vw] max-w-lg">
                  <div className="bg-white rounded-xl shadow-2xl">
                    <div className="flex items-center justify-between px-5 pt-5">
                      <h3 className="text-xl font-semibold">
                        Create New Experience
                      </h3>
                      <button
                        onClick={() => setShowCreateForm(false)}
                        className="text-gray-500 hover:text-gray-700 text-xl leading-none"
                        aria-label="Close"
                      >
                        ×
                      </button>
                    </div>

                    <div className="px-5 pb-5">
                      <CreateExperienceForm
                        onSuccess={async () => {
                          setShowCreateForm(false);
                          if (showOnlyMine) {
                            await getMyExperiences();
                          } else {
                            await getExperiences();
                          }
                        }}
                        onCancel={() => setShowCreateForm(false)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
};

export const getServerSideProps = async (context: { locale: any }) => {
  const { locale } = context;
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", ["common"])),
    },
  };
};

export default Experiences;
