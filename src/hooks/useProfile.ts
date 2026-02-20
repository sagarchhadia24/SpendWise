import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types/database'

export function useProfile() {
  const { user, profile, refreshProfile } = useAuth()

  async function updateProfile(updates: Partial<Pick<Profile, 'name' | 'family_members' | 'currency'>>) {
    if (!user) throw new Error('Not authenticated')
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
    if (error) throw error
    await refreshProfile()
  }

  async function changePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
  }

  async function deleteAccount() {
    if (!user) throw new Error('Not authenticated')
    const { error } = await supabase
      .from('profiles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', user.id)
    if (error) throw error
    await supabase.auth.signOut()
  }

  return {
    profile,
    updateProfile,
    changePassword,
    deleteAccount,
  }
}
