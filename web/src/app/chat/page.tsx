import { isNextAuthEnabled } from "@/lib/authEnabled.server";
import ChatClient from "./ChatClient";

export default function ChatPage() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <ChatClient authEnabled={isNextAuthEnabled()} />
    </div>
  );
}
