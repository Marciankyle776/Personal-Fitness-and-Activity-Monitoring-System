import { Link } from "react-router-dom";
import EmptyState from "../components/ui/EmptyState";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="card">
      <EmptyState icon={Compass} title="Page not found" message="The page you are looking for doesn't exist or has moved."
        action={<Link to="/" className="btn btn-primary">Go to dashboard</Link>} />
    </div>
  );
}
