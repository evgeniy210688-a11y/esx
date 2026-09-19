import ConnectClient from './ConnectClient';
export default async function ConnectPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <ConnectClient token={token} />;
}
