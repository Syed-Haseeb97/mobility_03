import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="page-shell">
      <h1 className="page-heading">404 · Page Not Found</h1>
      <p className="page-intro" style={{ margin: "20px 0" }}>
        That road didn&apos;t lead anywhere. Return to the collection.
      </p>
      <Link className="text-link" href="/rent">
        <ArrowLeft size={15} /> Back to the collection
      </Link>
    </main>
  );
}
