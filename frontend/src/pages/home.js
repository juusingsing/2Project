import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <h1>메인</h1>
      <nav>
        <Link to="/1">Go to Page 1</Link> |{" "}
        <Link to="/2">Go to Page 2</Link>
      </nav>
    </div>
  );
}