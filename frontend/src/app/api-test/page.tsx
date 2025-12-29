'use client'

/**
 * API Test Page
 * Test page to verify all API endpoints are working correctly
 */

import { useState } from 'react'
import * as authService from '@/services/auth.service'
import * as userService from '@/services/user.service'
import * as roomService from '@/services/room.service'
import * as matchService from '@/services/match.service'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ApiTestPage() {
  const [results, setResults] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const testApi = async (name: string, fn: () => Promise<any>) => {
    setLoading((prev) => ({ ...prev, [name]: true }))
    try {
      const result = await fn()
      setResults((prev) => ({ ...prev, [name]: { success: true, data: result } }))
    } catch (error: any) {
      setResults((prev) => ({
        ...prev,
        [name]: {
          success: false,
          error: error.message || 'Unknown error',
          details: error.details,
        },
      }))
    } finally {
      setLoading((prev) => ({ ...prev, [name]: false }))
    }
  }

  // Test data
  const [testEmail, setTestEmail] = useState('test@example.com')
  const [testPassword, setTestPassword] = useState('Test123456')
  const [testUsername, setTestUsername] = useState('testuser')
  const [testUserId, setTestUserId] = useState('')
  const [testRoomCode, setTestRoomCode] = useState('')
  const [testMatchId, setTestMatchId] = useState('')

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">API Test Page</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Auth Tests */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Auth Service</h2>
          <div className="space-y-3">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Username</Label>
              <Input
                value={testUsername}
                onChange={(e) => setTestUsername(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button
              onClick={() =>
                testApi('register', () =>
                  authService.register({
                    email: testEmail,
                    password: testPassword,
                    username: testUsername,
                  })
                )
              }
              disabled={loading.register}
              className="w-full"
            >
              {loading.register ? 'Loading...' : 'Register'}
            </Button>
            <Button
              onClick={() =>
                testApi('login', () =>
                  authService.login({
                    email: testEmail,
                    password: testPassword,
                  })
                )
              }
              disabled={loading.login}
              className="w-full"
              variant="outline"
            >
              {loading.login ? 'Loading...' : 'Login'}
            </Button>
          </div>
        </Card>

        {/* User Tests */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">User Service</h2>
          <div className="space-y-3">
            <div>
              <Label>User ID</Label>
              <Input
                value={testUserId}
                onChange={(e) => setTestUserId(e.target.value)}
                className="mt-1"
                placeholder="Enter user ID"
              />
            </div>
            <Button
              onClick={() => testApi('getAllUsers', () => userService.getAllUsers(10, 0))}
              disabled={loading.getAllUsers}
              className="w-full"
            >
              {loading.getAllUsers ? 'Loading...' : 'Get All Users'}
            </Button>
            <Button
              onClick={() => testApi('getUserCount', () => userService.getUserCount())}
              disabled={loading.getUserCount}
              className="w-full"
              variant="outline"
            >
              {loading.getUserCount ? 'Loading...' : 'Get User Count'}
            </Button>
            <Button
              onClick={() =>
                testApi('getUserByEmail', () => userService.getUserByEmail(testEmail))
              }
              disabled={loading.getUserByEmail}
              className="w-full"
              variant="outline"
            >
              {loading.getUserByEmail ? 'Loading...' : 'Get User By Email'}
            </Button>
            {testUserId && (
              <Button
                onClick={() => testApi('getUserById', () => userService.getUserById(testUserId))}
                disabled={loading.getUserById}
                className="w-full"
                variant="outline"
              >
                {loading.getUserById ? 'Loading...' : 'Get User By ID'}
              </Button>
            )}
          </div>
        </Card>

        {/* Room Tests */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Room Service</h2>
          <div className="space-y-3">
            <div>
              <Label>Room Code</Label>
              <Input
                value={testRoomCode}
                onChange={(e) => setTestRoomCode(e.target.value)}
                className="mt-1"
                placeholder="Enter room code"
              />
            </div>
            <Button
              onClick={() => testApi('getAvailableRooms', () => roomService.getAvailableRooms())}
              disabled={loading.getAvailableRooms}
              className="w-full"
            >
              {loading.getAvailableRooms ? 'Loading...' : 'Get Available Rooms'}
            </Button>
            <Button
              onClick={() => testApi('createRoom', () => roomService.createRoom({}))}
              disabled={loading.createRoom}
              className="w-full"
              variant="outline"
            >
              {loading.createRoom ? 'Loading...' : 'Create Room'}
            </Button>
            {testRoomCode && (
              <>
                <Button
                  onClick={() => testApi('getRoom', () => roomService.getRoom(testRoomCode))}
                  disabled={loading.getRoom}
                  className="w-full"
                  variant="outline"
                >
                  {loading.getRoom ? 'Loading...' : 'Get Room'}
                </Button>
                <Button
                  onClick={() => testApi('joinRoom', () => roomService.joinRoom({ roomCode: testRoomCode }))}
                  disabled={loading.joinRoom}
                  className="w-full"
                  variant="outline"
                >
                  {loading.joinRoom ? 'Loading...' : 'Join Room'}
                </Button>
              </>
            )}
          </div>
        </Card>

        {/* Match Tests */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Match Service</h2>
          <div className="space-y-3">
            <div>
              <Label>Match ID</Label>
              <Input
                value={testMatchId}
                onChange={(e) => setTestMatchId(e.target.value)}
                className="mt-1"
                placeholder="Enter match ID"
              />
            </div>
            {testMatchId && (
              <>
                <Button
                  onClick={() => testApi('getMatch', () => matchService.getMatch(testMatchId))}
                  disabled={loading.getMatch}
                  className="w-full"
                >
                  {loading.getMatch ? 'Loading...' : 'Get Match'}
                </Button>
                <Button
                  onClick={() =>
                    testApi('getMatchHistory', () => matchService.getMatchHistory(testMatchId))
                  }
                  disabled={loading.getMatchHistory}
                  className="w-full"
                  variant="outline"
                >
                  {loading.getMatchHistory ? 'Loading...' : 'Get Match History'}
                </Button>
              </>
            )}
            {testUserId && (
              <Button
                onClick={() =>
                  testApi('getUserMatches', () => matchService.getUserMatches(testUserId))
                }
                disabled={loading.getUserMatches}
                className="w-full"
                variant="outline"
              >
                {loading.getUserMatches ? 'Loading...' : 'Get User Matches'}
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Results */}
      <Card className="p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4">Results</h2>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {Object.entries(results).map(([name, result]) => (
            <div key={name} className="border-b pb-4">
              <h3 className="font-semibold text-lg">{name}</h3>
              {result.success ? (
                <div className="mt-2 p-3 bg-green-50 rounded">
                  <pre className="text-sm overflow-x-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="mt-2 p-3 bg-red-50 rounded">
                  <p className="text-red-600 font-semibold">Error: {result.error}</p>
                  {result.details && (
                    <pre className="text-sm mt-2 overflow-x-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

