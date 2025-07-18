"use client";

import ResultsPage from "@/app/components/results/ResultsPage";
import * as React from "react";

export const dynamic = "force-dynamic";

export default function Page({ params }) {
  const { id } = React.use(params);

  return <ResultsPage id={id} />;
}
