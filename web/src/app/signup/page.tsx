import { redirect } from "next/navigation";
import { isNextAuthEnabled } from "@/lib/authEnabled.server";
import SignUpClient from "./SignUpClient";

export default function SignUpPage() {
  if (!isNextAuthEnabled()) redirect("/");
  return <SignUpClient />;
}
