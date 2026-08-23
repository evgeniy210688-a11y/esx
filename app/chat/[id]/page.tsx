import ChatRoomClient from "./ChatRoomClient";

export default async function ChatRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <h1>Chat room: {id}</h1>
      <ChatRoomClient chatId={id} />
    </div>
  );
}