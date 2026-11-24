import { createClient } from '@/utils/supabase/client';

export async function uploadReceiptImage(file: File): Promise<{ url: string | null; error: string | null }> {
  try {
    const supabase = createClient();
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `receipt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filePath = `receipts/${fileName}`;

    const { data, error } = await supabase.storage
      .from('receipts')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      return { url: null, error: error.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from('receipts')
      .getPublicUrl(filePath);

    return { url: publicUrlData.publicUrl, error: null };
  } catch (err: any) {
    return { url: null, error: err.message || 'Failed to upload receipt' };
  }
}

export async function uploadLoanDocument(file: File, borrowerId: string): Promise<{ url: string | null; error: string | null }> {
  try {
    const supabase = createClient();
    const ext = file.name.split('.').pop() || 'pdf';
    const fileName = `doc_${borrowerId}_${Date.now()}.${ext}`;
    const filePath = `documents/${fileName}`;

    const { data, error } = await supabase.storage
      .from('receipts')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      return { url: null, error: error.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from('receipts')
      .getPublicUrl(filePath);

    return { url: publicUrlData.publicUrl, error: null };
  } catch (err: any) {
    return { url: null, error: err.message || 'Failed to upload document' };
  }
}
