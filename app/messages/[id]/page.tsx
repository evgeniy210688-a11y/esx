import PrivateChat from './PrivateChat';
export default async function MessagesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PrivateChat chatId={id} />;
}
