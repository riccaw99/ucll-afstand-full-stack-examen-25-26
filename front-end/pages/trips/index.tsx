import Head from "next/head";
import { useEffect, useState } from "react";
import { Holiday } from "@types";
import Header from "@components/header";
import TripService from "@services/TripService";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";

const Trips: React.FC = () => {
  const [trips, setTrips] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const getTrips = async () => {
    setError("");
    setLoading(true);

    const res = await TripService.getAllTrips();

    if (!res.ok) {
      setTrips([]);
      setError(res.statusText || "Failed to load trips.");
    } else {
      const data: Holiday[] = await res.json();
      setTrips(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    getTrips();
  }, []);

  return (
    <>
      <Head>
        <title>Holidays</title>
      </Head>
      <Header />

      <main className="p-6 min-h-screen flex flex-col items-center">
        <h1 className="text-2xl font-semibold mb-4">Holiday Trips</h1>

        {loading && <p>Loading trips…</p>}
        {error && <div className="text-red-800">{error}</div>}

        {!loading && !error && (
          <div className="mt-4 w-full max-w-3xl">
            <h2 className="text-xl font-semibold mb-4">
              Available Holidays ({trips.length})
            </h2>

            {trips.length === 0 ? (
              <p>No trips found.</p>
            ) : (
              <div className="grid gap-4">
                {trips.map((trip) => (
                  <div key={trip.id} className="p-4 border rounded-lg bg-white">
                    <h3 className="font-bold text-lg">🏖️ {trip.destination}</h3>
                    <p className="text-gray-600 mb-2">{trip.description}</p>
                    <p className="text-sm">
                      📅 {new Date(trip.startDate).toLocaleDateString()} –{" "}
                      {new Date(trip.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm">
                      👤 Organiser: {trip.organiser?.firstName}{" "}
                      {trip.organiser?.lastName}
                    </p>
                    <p className="text-sm mb-3">
                      👥 Attendees: {trip.attendees?.length ?? 0} people
                    </p>
                    <Link
                      href={`/trips/${trip.id}`}
                      className="bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg text-sm px-4 py-2 inline-block"
                    >
                      More Info
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
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

export default Trips;
