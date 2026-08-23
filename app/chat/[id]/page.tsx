import ChatRoomClient from "./ChatRoomClient";

export default async function ChatRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ChatRoomClient chatId={id} />;
}