import ChatRoomClient from "./ChatRoomClient";

export default function ChatRoomPage({
  params,
}: {
  params: { id: string };
}) {
  return <ChatRoomClient chatId={params.id} />;
}