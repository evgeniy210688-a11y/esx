import { supabase } from './supabase';

export async function changeMessage(chatId: string, messageId: string | number, action: 'edit' | 'delete', privateChat: boolean, replacement?: string) {
  const { error } = await supabase.rpc('esx_change_message', {
    room_id: chatId, message_id: String(messageId), operation: action,
    private_chat: privateChat, replacement: replacement ?? null,
  });
  if (error) throw error;
}
