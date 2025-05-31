import { PatientRouteParams } from '@/types/misc';
import { createFileRoute } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter';

const PatientRoute = () => {
  const { id: patientId } = Route.useSearch();

  return (
    <>
      {/* Additional patient details can be rendered here */}
    </>
  );
}

export const Route = createFileRoute('/patient')({
  component: PatientRoute,
  validateSearch: zodValidator(PatientRouteParams)
})
