import TourDateForm from "@/components/dashboard/TourDateForm";

export default function NewTourDatePage() {
  return (
    <div>
      <h1 className="font-display text-3xl text-white tracking-wide mb-6">ADD TOUR DATE</h1>
      <TourDateForm mode="create" />
    </div>
  );
}
