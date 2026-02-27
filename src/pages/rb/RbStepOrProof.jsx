import { useParams } from "react-router-dom";
import RbStepPage from "./RbStepPage";
import RbProofPage from "./RbProofPage";

export default function RbStepOrProof() {
  const { stepSlug } = useParams();

  if (stepSlug === "proof") return <RbProofPage />;
  return <RbStepPage />;
}
