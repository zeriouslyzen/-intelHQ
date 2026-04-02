import { redirect } from "next/navigation";
import { isNextAuthEnabled } from "@/lib/authEnabled.server";
import SignInClient from "./SignInClient";

export default function SignInPage() {
  if (!isNextAuthEnabled()) redirect("/");
  return <SignInClient />;
}
