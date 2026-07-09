import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ChatRoom from '@/components/chat/ChatRoom'

export default async function ChatPage() {
  const session = await auth()
  if (!session) redirect('/login')

  return <ChatRoom />
}
