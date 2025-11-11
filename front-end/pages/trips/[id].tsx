import Head from "next/head";
import { useState, useEffect } from "react";
import { Holiday } from "@types";
import Header from "@components/header";
import TripService from "@services/TripService";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { useRouter } from "next/router";

const TripDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [trip, setTrip] = useState<Holiday | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const getTrip = async (tripId: string) => {
    setError("");
    setLoading(true);

    const response = await TripService.getTripById(tripId);

    if (!response.ok) {
      setError(
        response.status === 401
          ? "You are not authorized to view this page. Please login first."
          : response.statusText
      );
      setTrip(null);
    } else {
      const data: Holiday = await response.json();
      setTrip(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (typeof id === "string") {
      getTrip(id);
    }
  }, [id]);

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading Trip...</title>
        </Head>
        <Header />
        <main className="p-6 min-h-screen flex flex-col items-center">
          <div>Loading trip details...</div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Trip Not Found</title>
        </Head>
        <Header />
        <main className="p-6 min-h-screen flex flex-col items-center">
          <div className="text-red-800">{error}</div>
          <Link
            href="/trips"
            className="mt-4 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg text-sm px-4 py-2"
          >
            ← Back to Trips
          </Link>
        </main>
      </>
    );
  }

  if (!trip) {
    return (
      <>
        <Head>
          <title>Trip Not Found</title>
        </Head>
        <Header />
        <main className="p-6 min-h-screen flex flex-col items-center">
          <div>Trip not found</div>
          <Link
            href="/trips"
            className="mt-4 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg text-sm px-4 py-2"
          >
            ← Back to Trips
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{trip.destination} - Holiday Details</title>
      </Head>
      <Header />
      <main className="p-6 min-h-screen flex flex-col items-center">
        <div className="max-w-4xl w-full">
          <Link
            href="/trips"
            className="mb-6 inline-block bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg text-sm px-4 py-2"
          >
            ← Back to Trips
          </Link>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-4">🏖️ {trip.destination}</h1>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h2 className="text-xl font-semibold mb-3">Trip Details</h2>
                <div className="space-y-2">
                  <p>
                    <strong>📅 Start Date:</strong>{" "}
                    {new Date(trip.startDate).toLocaleDateString("en-GB", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p>
                    <strong>📅 End Date:</strong>{" "}
                    {new Date(trip.endDate).toLocaleDateString("en-GB", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p>
                    <strong>⏱️ Duration:</strong>{" "}
                    {Math.ceil(
                      (new Date(trip.endDate).getTime() -
                        new Date(trip.startDate).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    days
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">Organiser</h2>
                <div className="space-y-2">
                  <p>
                    <strong>👤 Name:</strong> {trip.organiser?.firstName}{" "}
                    {trip.organiser?.lastName}
                  </p>
                  {trip.organiser?.email && (
                    <p>
                      <strong>✉️ Email:</strong> {trip.organiser.email}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <p className="text-gray-700 leading-relaxed">
                {trip.description}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">
                Attendees ({trip.attendees?.length || 0})
              </h2>
              {trip.attendees && trip.attendees.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {trip.attendees.map((a) => (
                    <div key={a.id} className="bg-gray-100 rounded-lg p-3">
                      <p className="font-medium">
                        {a.firstName} {a.lastName}
                      </p>
                      {a.email && (
                        <p className="text-sm text-gray-600">{a.email}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No attendees yet.</p>
              )}
            </div>
          </div>
        </div>
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

export default TripDetail;
