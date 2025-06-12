import { useParams } from "react-router-dom";

export default function Threads() {
  const { threadId } = useParams();
  return <div>Thread {threadId}</div>;
}