'use client'

interface Match {
  id: string
  round: number
  matchNumber: number
  team1: { name: string; tag?: string } | null
  team2: { name: string; tag?: string } | null
  score?: { team1: number; team2: number } | null
  winnerId?: string | null
  team1Id?: string | null
  team2Id?: string | null
  status: string
}

interface Props {
  matches: Match[]
  primaryColor: string
}

export default function BracketViewer({ matches, primaryColor }: Props) {
  const rounds = matches.reduce((acc, m) => {
    if (!acc[m.round]) acc[m.round] = []
    acc[m.round].push(m)
    return acc
  }, {} as Record<number, Match[]>)

  const roundNumbers = Object.keys(rounds).map(Number).sort((a, b) => a - b)
  const totalRounds = roundNumbers.length

  const ROUND_NAMES: Record<number, string> = {
    [totalRounds]: 'Grand Final',
    [totalRounds - 1]: 'Semi Finals',
    [totalRounds - 2]: 'Quarter Finals',
  }

  function getRoundName(round: number) {
    return ROUND_NAMES[round] || `Round ${round}`
  }

  const FALLBACK_MATCHES: Match[] = [
    { id: '1', round: 1, matchNumber: 1, team1: { name: 'Team Alpha', tag: 'ALPH' }, team2: { name: 'Team Beta', tag: 'BETA' }, score: { team1: 2, team2: 0 }, winnerId: 't1', team1Id: 't1', status: 'COMPLETED' },
    { id: '2', round: 1, matchNumber: 2, team1: { name: 'Team Nexus', tag: 'NXS' }, team2: { name: 'Squad X', tag: 'SQX' }, score: { team1: 1, team2: 2 }, winnerId: 't4', team2Id: 't4', status: 'COMPLETED' },
    { id: '3', round: 1, matchNumber: 3, team1: { name: 'ProGamingIN', tag: 'PGI' }, team2: { name: 'Clutch Kings', tag: 'CK' }, score: { team1: 2, team2: 1 }, winnerId: 't5', team1Id: 't5', status: 'COMPLETED' },
    { id: '4', round: 1, matchNumber: 4, team1: { name: 'Storm Rising', tag: 'SR' }, team2: { name: 'TBD', tag: '?' }, score: null, winnerId: null, status: 'SCHEDULED' },
    { id: '5', round: 2, matchNumber: 1, team1: { name: 'Team Alpha', tag: 'ALPH' }, team2: { name: 'Squad X', tag: 'SQX' }, score: null, winnerId: null, status: 'SCHEDULED' },
    { id: '6', round: 2, matchNumber: 2, team1: { name: 'ProGamingIN', tag: 'PGI' }, team2: { name: 'TBD', tag: '?' }, score: null, winnerId: null, status: 'SCHEDULED' },
    { id: '7', round: 3, matchNumber: 1, team1: { name: 'TBD', tag: '?' }, team2: { name: 'TBD', tag: '?' }, score: null, winnerId: null, status: 'SCHEDULED' },
  ]

  const displayMatches = matches.length > 0 ? matches : FALLBACK_MATCHES
  const displayRounds = displayMatches.reduce((acc, m) => {
    if (!acc[m.round]) acc[m.round] = []
    acc[m.round].push(m)
    return acc
  }, {} as Record<number, Match[]>)
  const displayRoundNumbers = Object.keys(displayRounds).map(Number).sort((a, b) => a - b)
  const displayTotalRounds = displayRoundNumbers.length

  function getDisplayRoundName(round: number) {
    const names: Record<number, string> = {
      [displayTotalRounds]: 'Grand Final',
      [displayTotalRounds - 1]: 'Semi Finals',
      [displayTotalRounds - 2]: 'Quarter Finals',
    }
    return names[round] || `Round ${round}`
  }

  return (
    <div style={{ overflowX: 'auto', paddingBottom: '16px' }}>
      <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', minWidth: 'max-content', padding: '8px 4px' }}>
        {displayRoundNumbers.map((round, roundIdx) => (
          <div key={round} style={{ display: 'flex', flexDirection: 'column', gap: '0', alignItems: 'center' }}>
            {/* Round label */}
            <div style={{
              fontSize: '11px', fontWeight: 700, color: primaryColor,
              letterSpacing: '1px', marginBottom: '16px', padding: '4px 12px',
              borderRadius: '20px', background: `${primaryColor}18`,
              border: `1px solid ${primaryColor}33`,
            }}>
              {getDisplayRoundName(round)}
            </div>

            {/* Matches */}
            <div style={{
              display: 'flex', flexDirection: 'column',
              gap: `${Math.pow(2, roundIdx) * 20}px`,
              justifyContent: 'center',
            }}>
              {(displayRounds[round] || []).sort((a, b) => a.matchNumber - b.matchNumber).map(match => {
                const t1Win = match.winnerId && match.team1Id && match.winnerId === match.team1Id
                const t2Win = match.winnerId && match.team2Id && match.winnerId === match.team2Id
                const isLive = match.status === 'LIVE' || match.status === 'ONGOING'

                return (
                  <div key={match.id} style={{
                    width: '200px',
                    background: '#0a0a0f',
                    border: `1px solid ${isLive ? primaryColor : '#ffffff0a'}`,
                    borderRadius: '10px', overflow: 'hidden',
                    boxShadow: isLive ? `0 0 16px ${primaryColor}33` : 'none',
                  }}>
                    {isLive && <div style={{ height: '2px', background: primaryColor }} />}

                    {/* Team 1 */}
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 12px',
                      background: t1Win ? `${primaryColor}18` : 'transparent',
                      borderBottom: '1px solid #ffffff06',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '20px', height: '20px', borderRadius: '4px',
                          background: `${primaryColor}22`, display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          fontSize: '9px', fontWeight: 800, color: primaryColor,
                        }}>
                          {match.team1?.tag?.[0] || '?'}
                        </div>
                        <span style={{
                          fontSize: '12px', fontWeight: t1Win ? 700 : 500,
                          color: t1Win ? '#e2e8f0' : match.team1?.name === 'TBD' ? '#334155' : '#94a3b8',
                        }}>
                          {match.team1?.name || 'TBD'}
                        </span>
                      </div>
                      {match.score && (
                        <span style={{
                          fontSize: '14px', fontWeight: 900,
                          color: t1Win ? primaryColor : '#475569',
                          fontFamily: "'Orbitron', monospace",
                        }}>
                          {match.score.team1}
                        </span>
                      )}
                      {t1Win && <span style={{ fontSize: '10px' }}>✓</span>}
                    </div>

                    {/* Team 2 */}
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 12px',
                      background: t2Win ? `${primaryColor}18` : 'transparent',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '20px', height: '20px', borderRadius: '4px',
                          background: '#ffffff08', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          fontSize: '9px', fontWeight: 800, color: '#64748b',
                        }}>
                          {match.team2?.tag?.[0] || '?'}
                        </div>
                        <span style={{
                          fontSize: '12px', fontWeight: t2Win ? 700 : 500,
                          color: t2Win ? '#e2e8f0' : match.team2?.name === 'TBD' ? '#334155' : '#94a3b8',
                        }}>
                          {match.team2?.name || 'TBD'}
                        </span>
                      </div>
                      {match.score && (
                        <span style={{
                          fontSize: '14px', fontWeight: 900,
                          color: t2Win ? primaryColor : '#475569',
                          fontFamily: "'Orbitron', monospace",
                        }}>
                          {match.score.team2}
                        </span>
                      )}
                      {t2Win && <span style={{ fontSize: '10px' }}>✓</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
