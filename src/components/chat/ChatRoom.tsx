'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { encryptMessage, decryptMessage } from '@/lib/encryption'

interface Message {
  id: string
  senderId: string
  contentEncrypted: string
  type: string
  sentAt: string
  sender: { id: string; username: string; avatar: string | null }
  decrypted?: string
}

interface Room {
  id: string
  name: string | null
  type: string
  myRole: string
  members: Array<{ id: string; username: string; avatar: string | null; role: string }>
  lastMessage: any
  unreadCount: number
}

const EMOJI_LIST = ['😄','😂','🔥','💀','👑','⚡','🎮','🏆','👍','❤️','💯','🎯']

export default function ChatRoom() {
  const { data: session } = useSession()
  const [rooms, setRooms] = useState<Room[]>([])
  const [activeRoom, setActiveRoom] = useState<Room | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showNewRoom, setShowNewRoom] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [inviteUsername, setInviteUsername] = useState('')
  const [inCall, setInCall] = useState(false)
  const [callStatus, setCallStatus] = useState('')
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const pollRef = useRef<NodeJS.Timeout>()

  // Fetch rooms
  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/rooms')
      if (!res.ok) return
      const data = await res.json()
      setRooms(data)
    } catch (err) {
      console.error('Failed to fetch rooms', err)
    } finally {
      setLoadingRooms(false)
    }
  }, [])

  // Fetch messages for active room
  const fetchMessages = useCallback(async (roomId: string) => {
    setLoadingMessages(true)
    try {
      const res = await fetch(`/api/chat/rooms/${roomId}/messages`)
      if (!res.ok) return
      const data = await res.json()
      const decrypted = data.messages.map((m: Message) => ({
        ...m,
        decrypted: decryptMessage(m.contentEncrypted, roomId),
      }))
      setMessages(decrypted)
    } catch (err) {
      console.error('Failed to fetch messages', err)
    } finally {
      setLoadingMessages(false)
    }
  }, [])

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  useEffect(() => {
    if (!activeRoom) return
    fetchMessages(activeRoom.id)

    // Poll for new messages every 3 seconds (simple polling instead of WebSocket)
    pollRef.current = setInterval(() => {
      fetchMessages(activeRoom.id)
    }, 3000)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [activeRoom, fetchMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!input.trim() || !activeRoom || sending) return
    setSending(true)
    const encrypted = encryptMessage(input.trim(), activeRoom.id)
    const optimistic: Message = {
      id: Date.now().toString(),
      senderId: session?.user?.id || '',
      contentEncrypted: encrypted,
      decrypted: input.trim(),
      type: 'TEXT',
      sentAt: new Date().toISOString(),
      sender: { id: session?.user?.id || '', username: session?.user?.name || 'You', avatar: null },
    }
    setMessages(prev => [...prev, optimistic])
    setInput('')

    try {
      await fetch(`/api/chat/rooms/${activeRoom.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: encrypted, type: 'TEXT' }),
      })
      fetchRooms()
    } catch (err) {
      console.error('Failed to send message', err)
    } finally {
      setSending(false)
    }
  }

  async function createRoom() {
    if (!newRoomName.trim()) return
    const res = await fetch('/api/chat/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newRoomName, type: 'PRIVATE', inviteUsernames: inviteUsername ? [inviteUsername] : [] }),
    })
    if (res.ok) {
      setNewRoomName('')
      setInviteUsername('')
      setShowNewRoom(false)
      fetchRooms()
    }
  }

  async function inviteUser() {
    if (!inviteUsername.trim() || !activeRoom) return
    await fetch(`/api/chat/rooms/${activeRoom.id}/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: inviteUsername }),
    })
    setInviteUsername('')
    fetchRooms()
  }

  async function startVoiceCall() {
    if (!activeRoom) return
    setCallStatus('Connecting...')
    setInCall(true)
    try {
      const res = await fetch('/api/chat/livekit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: activeRoom.id }),
      })
      const data = await res.json()
      if (data.warning) {
        setCallStatus('⚠️ ' + data.warning)
      } else {
        setCallStatus('🔴 In Call')
      }
    } catch {
      setCallStatus('Failed to connect')
      setInCall(false)
    }
  }

  function getRoomDisplayName(room: Room): string {
    if (room.name) return room.name
    const others = room.members.filter(m => m.id !== session?.user?.id)
    return others.map(m => m.username).join(', ') || 'Room'
  }

  function formatTime(dateStr: string): string {
    const d = new Date(dateStr)
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  }

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr)
    const today = new Date()
    if (d.toDateString() === today.toDateString()) return 'Today'
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0a0a0f', fontFamily: "'DM Sans', sans-serif", color: '#e2e8f0' }}>
      
      {/* ── Left Sidebar ── */}
      <div style={{ width: '280px', borderRight: '1px solid #ffffff0a', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        {/* Header */}
        <div style={{ padding: '16px', borderBottom: '1px solid #ffffff0a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '14px', fontWeight: 900, color: '#00f5ff' }}>💬 CHAT</div>
          <button onClick={() => setShowNewRoom(true)} style={{
            background: '#00f5ff18', border: '1px solid #00f5ff33', borderRadius: '8px',
            padding: '6px 10px', color: '#00f5ff', fontSize: '12px', fontWeight: 700,
            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          }}>
            + New
          </button>
        </div>

        {/* Room list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loadingRooms ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#334155', fontSize: '13px' }}>Loading...</div>
          ) : rooms.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
              <div style={{ color: '#334155', fontSize: '13px' }}>No rooms yet</div>
              <button onClick={() => setShowNewRoom(true)} style={{
                marginTop: '12px', padding: '8px 16px', background: '#00f5ff18',
                border: '1px solid #00f5ff33', borderRadius: '8px', color: '#00f5ff',
                fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              }}>
                Create Room
              </button>
            </div>
          ) : rooms.map(room => (
            <div key={room.id}
              onClick={() => { setActiveRoom(room); setShowInfo(false) }}
              style={{
                padding: '12px 16px', cursor: 'pointer', transition: 'background 0.15s',
                background: activeRoom?.id === room.id ? '#00f5ff0a' : 'transparent',
                borderLeft: activeRoom?.id === room.id ? '2px solid #00f5ff' : '2px solid transparent',
                display: 'flex', gap: '10px', alignItems: 'center',
              }}
              onMouseEnter={e => { if (activeRoom?.id !== room.id) e.currentTarget.style.background = '#ffffff04' }}
              onMouseLeave={e => { if (activeRoom?.id !== room.id) e.currentTarget.style.background = 'transparent' }}
            >
              {/* Avatar */}
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #00f5ff22, #7c3aed22)',
                border: '1px solid #ffffff14', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '16px', position: 'relative',
              }}>
                {room.type === 'PUBLIC' ? '🌐' : room.members.length > 2 ? '👥' : '💬'}
                {room.unreadCount > 0 && (
                  <div style={{
                    position: 'absolute', top: '-2px', right: '-2px',
                    width: '16px', height: '16px', borderRadius: '50%',
                    background: '#ff4444', fontSize: '9px', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff',
                  }}>
                    {room.unreadCount > 9 ? '9+' : room.unreadCount}
                  </div>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {getRoomDisplayName(room)}
                </div>
                <div style={{ fontSize: '11px', color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {room.lastMessage ? '🔒 Encrypted message' : 'No messages yet'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Chat Area ── */}
      {activeRoom ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Room header */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #ffffff0a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0d0d1a' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ fontSize: '20px' }}>{activeRoom.type === 'PUBLIC' ? '🌐' : '🔒'}</div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0' }}>{getRoomDisplayName(activeRoom)}</div>
                <div style={{ fontSize: '11px', color: '#334155' }}>
                  {activeRoom.members.length} members · E2E Encrypted
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {callStatus && <span style={{ fontSize: '11px', color: inCall ? '#00ff88' : '#ff6b6b' }}>{callStatus}</span>}
              <button onClick={inCall ? () => { setInCall(false); setCallStatus('') } : startVoiceCall} style={{
                padding: '7px 14px', borderRadius: '8px', border: 'none',
                background: inCall ? '#ff444422' : '#00ff8822',
                color: inCall ? '#ff6b6b' : '#00ff88',
                fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {inCall ? '📵 Leave' : '🎙️ Voice'}
              </button>
              <button onClick={() => setShowInfo(!showInfo)} style={{
                padding: '7px 12px', borderRadius: '8px', border: '1px solid #ffffff0a',
                background: showInfo ? '#ffffff0a' : 'transparent',
                color: '#64748b', fontSize: '12px', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
              }}>
                ℹ️
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {loadingMessages ? (
              <div style={{ textAlign: 'center', color: '#334155', padding: '40px', fontSize: '13px' }}>Loading messages...</div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 24px' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔒</div>
                <div style={{ color: '#475569', fontSize: '14px', fontWeight: 600 }}>End-to-end encrypted</div>
                <div style={{ color: '#334155', fontSize: '12px', marginTop: '4px' }}>Send the first message</div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => {
                  const isOwn = msg.senderId === session?.user?.id
                  const prevMsg = messages[i - 1]
                  const showDateSep = !prevMsg || formatDate(msg.sentAt) !== formatDate(prevMsg.sentAt)
                  const showAvatar = !isOwn && (!prevMsg || prevMsg.senderId !== msg.senderId)

                  return (
                    <div key={msg.id}>
                      {showDateSep && (
                        <div style={{ textAlign: 'center', margin: '12px 0', fontSize: '11px', color: '#334155' }}>
                          — {formatDate(msg.sentAt)} —
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start', marginBottom: '2px' }}>
                        {!isOwn && (
                          <div style={{ width: '28px', marginRight: '8px', alignSelf: 'flex-end', flexShrink: 0 }}>
                            {showAvatar && (
                              <div style={{
                                width: '28px', height: '28px', borderRadius: '50%',
                                background: '#00f5ff22', border: '1px solid #00f5ff33',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '12px', fontWeight: 700, color: '#00f5ff',
                              }}>
                                {msg.sender.username[0].toUpperCase()}
                              </div>
                            )}
                          </div>
                        )}
                        <div style={{ maxWidth: '65%' }}>
                          {showAvatar && !isOwn && (
                            <div style={{ fontSize: '11px', color: '#475569', marginBottom: '3px', marginLeft: '2px' }}>
                              {msg.sender.username}
                            </div>
                          )}
                          <div style={{
                            padding: '8px 12px', borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                            background: isOwn ? '#00f5ff22' : '#13131f',
                            border: `1px solid ${isOwn ? '#00f5ff33' : '#ffffff0a'}`,
                            fontSize: '14px', color: '#e2e8f0', lineHeight: 1.5,
                            wordBreak: 'break-word',
                          }}>
                            {msg.decrypted || msg.contentEncrypted}
                          </div>
                          <div style={{ fontSize: '10px', color: '#334155', marginTop: '2px', textAlign: isOwn ? 'right' : 'left', marginLeft: isOwn ? 0 : '2px' }}>
                            {formatTime(msg.sentAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Typing indicator */}
                {typingUsers.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
                    <div style={{ display: 'flex', gap: '3px' }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{
                          width: '6px', height: '6px', borderRadius: '50%', background: '#475569',
                          animation: `bounce 1.4s ${i * 0.2}s infinite`,
                        }} />
                      ))}
                    </div>
                    <span style={{ fontSize: '11px', color: '#475569' }}>{typingUsers[0]} is typing...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input bar */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid #ffffff0a', background: '#0d0d1a' }}>
            {showEmojiPicker && (
              <div style={{
                position: 'absolute', bottom: '70px', right: '24px',
                background: '#13131f', border: '1px solid #ffffff0a',
                borderRadius: '12px', padding: '12px',
                display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px',
                zIndex: 50,
              }}>
                {EMOJI_LIST.map(emoji => (
                  <button key={emoji} onClick={() => { setInput(p => p + emoji); setShowEmojiPicker(false) }}
                    style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', padding: '4px', borderRadius: '6px' }}>
                    {emoji}
                  </button>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button onClick={() => setShowEmojiPicker(p => !p)} style={{
                background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#475569', padding: '4px',
              }}>😊</button>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder="Type a message... (E2E Encrypted)"
                style={{
                  flex: 1, background: '#0a0a0f', border: '1px solid #ffffff0a',
                  borderRadius: '10px', padding: '10px 14px', color: '#e2e8f0',
                  fontSize: '14px', fontFamily: "'DM Sans', sans-serif", outline: 'none',
                  transition: 'border 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#00f5ff44'}
                onBlur={e => e.target.style.borderColor = '#ffffff0a'}
              />
              <button onClick={sendMessage} disabled={!input.trim() || sending} style={{
                padding: '10px 16px', background: input.trim() ? '#00f5ff' : '#ffffff08',
                border: 'none', borderRadius: '10px', color: input.trim() ? '#0a0a0f' : '#334155',
                fontWeight: 700, fontSize: '13px', cursor: input.trim() ? 'pointer' : 'not-allowed',
                fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
              }}>
                {sending ? '...' : '➤'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>💬</div>
          <h2 style={{ fontFamily: "'Orbitron', monospace", fontSize: '20px', color: '#e2e8f0', marginBottom: '8px' }}>Select a Room</h2>
          <p style={{ color: '#334155', fontSize: '14px', marginBottom: '24px' }}>Choose a room from the left or create a new one</p>
          <button onClick={() => setShowNewRoom(true)} style={{
            padding: '12px 24px', background: '#00f5ff18', border: '1px solid #00f5ff44',
            borderRadius: '10px', color: '#00f5ff', fontWeight: 700, fontSize: '14px',
            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          }}>
            + Create Room
          </button>
        </div>
      )}

      {/* ── Room Info Panel ── */}
      {showInfo && activeRoom && (
        <div style={{ width: '260px', borderLeft: '1px solid #ffffff0a', padding: '16px', overflowY: 'auto', flexShrink: 0 }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', letterSpacing: '1px', marginBottom: '16px' }}>MEMBERS</h3>
          {activeRoom.members.map(member => (
            <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: '#00f5ff22', border: '1px solid #00f5ff33',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: 700, color: '#00f5ff', flexShrink: 0,
              }}>
                {member.username[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>{member.username}</div>
                <div style={{ fontSize: '10px', color: '#334155' }}>{member.role}</div>
              </div>
            </div>
          ))}

          <div style={{ borderTop: '1px solid #ffffff0a', paddingTop: '16px', marginTop: '8px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', letterSpacing: '1px', marginBottom: '12px' }}>INVITE</h3>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input value={inviteUsername} onChange={e => setInviteUsername(e.target.value)}
                placeholder="Username" onKeyDown={e => e.key === 'Enter' && inviteUser()}
                style={{ flex: 1, background: '#0a0a0f', border: '1px solid #ffffff0a', borderRadius: '8px', padding: '8px 10px', color: '#e2e8f0', fontSize: '12px', fontFamily: "'DM Sans', sans-serif", outline: 'none' }} />
              <button onClick={inviteUser} style={{
                padding: '8px 10px', background: '#00f5ff22', border: '1px solid #00f5ff33',
                borderRadius: '8px', color: '#00f5ff', fontSize: '12px', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
              }}>+</button>
            </div>
          </div>
        </div>
      )}

      {/* ── New Room Modal ── */}
      {showNewRoom && (
        <div style={{ position: 'fixed', inset: 0, background: '#00000088', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}
          onClick={() => setShowNewRoom(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#13131f', border: '1px solid #00f5ff33', borderRadius: '16px',
            padding: '28px', width: '100%', maxWidth: '380px', margin: '16px',
          }}>
            <h2 style={{ fontFamily: "'Orbitron', monospace", fontSize: '16px', color: '#e2e8f0', marginBottom: '20px' }}>
              New Chat Room
            </h2>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', color: '#475569', fontWeight: 700, letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>ROOM NAME</label>
              <input value={newRoomName} onChange={e => setNewRoomName(e.target.value)}
                placeholder="e.g. BGMI Squad Chat"
                style={{ width: '100%', background: '#0a0a0f', border: '1px solid #ffffff14', borderRadius: '10px', padding: '10px 14px', color: '#e2e8f0', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", outline: 'none' }} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '11px', color: '#475569', fontWeight: 700, letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>INVITE USER (optional)</label>
              <input value={inviteUsername} onChange={e => setInviteUsername(e.target.value)}
                placeholder="Enter username"
                style={{ width: '100%', background: '#0a0a0f', border: '1px solid #ffffff14', borderRadius: '10px', padding: '10px 14px', color: '#e2e8f0', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowNewRoom(false)} style={{
                flex: 1, padding: '10px', background: 'transparent', border: '1px solid #ffffff14',
                borderRadius: '10px', color: '#64748b', fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              }}>Cancel</button>
              <button onClick={createRoom} style={{
                flex: 2, padding: '10px', background: '#00f5ff', border: 'none',
                borderRadius: '10px', color: '#0a0a0f', fontWeight: 800, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              }}>Create Room</button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Orbitron:wght@700;900&display=swap');
        @keyframes bounce { 0%,80%,100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #ffffff14; border-radius: 2px; }
      `}} />
    </div>
  )
}
