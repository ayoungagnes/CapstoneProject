import ResultsPage from "@/app/components/results/ResultsPage";

//
// THIS IS THE FIX: Explicitly tell Next.js to render this page dynamically
//
export const dynamic = 'force-dynamic';

export default function ResultsPageWrapper({ params }) {
  // Now that the page is in the correct rendering mode,
  // this access will work as expected.
  const sessionId = params.id;

  return <ResultsPage sessionId={sessionId} />;
}