import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/utils/api'

// Example query hooks - customize based on your API
export const useGameList = () => {
  return useQuery({
    queryKey: ['games'],
    queryFn: () => api.get<{ games: unknown[] }>('/games'),
  })
}

export const useCreateGame = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: { username: string }) => 
      api.post<{ gameId: string }>('/games', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] })
    },
  })
}

export const useJoinGame = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: { gameId: string; username: string }) =>
      api.post<{ success: boolean }>('/games/join', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] })
    },
  })
}

