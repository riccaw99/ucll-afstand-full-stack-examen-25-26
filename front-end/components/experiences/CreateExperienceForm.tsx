import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ExperienceService from "@services/ExperienceService";
import { ExperienceInput } from "@types";

type Props = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

const CreateExperienceForm = ({ onSuccess, onCancel }: Props) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState<Date | null>(null);

  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Name is required.");
    if (!description.trim()) return setError("Description is required.");
    if (!location.trim()) return setError("Location is required.");
    if (!date) return setError("Date is required.");

    const exp: ExperienceInput = {
      name,
      description,
      location,
      date: date.toISOString(),
    };

    const response = await ExperienceService.createExperience(exp);
    const data = await response.json();

    if (!response.ok) {
      setError(data?.message ?? "Failed to create experience.");
    } else {
      setStatus("Experience created successfully.");
      setTimeout(() => {
        onSuccess?.();
        setStatus("");
      }, 1000);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto"
    >
      {/* Messages */}
      <div className="mb-4">
        {error && (
          <p className="text-red-700 font-medium mb-2" role="alert">
            {error}
          </p>
        )}
        {status && (
          <p className="text-green-700 font-medium mb-2" role="alert">
            {status}
          </p>
        )}
      </div>

      {/* Name */}
      <div className="mb-3">
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Experience Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setError("");
            setName(e.target.value);
          }}
          placeholder="Enter experience name"
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Description */}
      <div className="mb-3">
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Description *
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => {
            setError("");
            setDescription(e.target.value);
          }}
          placeholder="Describe the experience"
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Date */}
      <div className="mb-3">
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Date *
        </label>
        <DatePicker
          selected={date}
          onChange={(d) => {
            setError("");
            setDate(d);
          }}
          showTimeSelect
          dateFormat="MMMM d, yyyy HH:mm"
          timeFormat="HH:mm"
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Location */}
      <div className="mb-5">
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Location *
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => {
            setError("");
            setLocation(e.target.value);
          }}
          placeholder="Enter location"
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 justify-end">
        <button
          type="submit"
          className="bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg text-sm px-5 py-2.5"
        >
          Create Experience
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg text-sm px-5 py-2.5"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CreateExperienceForm;
