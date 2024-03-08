import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request) {
  const { pdfUrl } = await request.json();

  try {
    // Check if the file already exists in Supabase storage
    const { data: existingFile, error: existingFileError } = await supabase
      .storage
      .from('pdfs')
      .getPublicUrl(pdfUrl.split('/').pop());

    if (existingFile && !existingFileError) {
      return new Response(JSON.stringify({ fileStoreUrl: existingFile.publicURL }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Download the PDF file
    const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
    const fileSize = response.data.byteLength;

    if (fileSize > MAX_FILE_SIZE) {
      return new Response(JSON.stringify({ error: 'File size exceeds the maximum limit' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Upload the file to Supabase storage
    const { data, error } = await supabase
      .storage
      .from('pdfs')
      .upload(pdfUrl.split('/').pop(), response.data, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (error) {
      return new Response(JSON.stringify({ error: 'Failed to upload file to Supabase storage' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the public URL of the uploaded file
    const { data: { publicURL }, error: publicURLError } = await supabase
      .storage
      .from('pdfs')
      .getPublicUrl(data.path);

    if (publicURLError) {
      return new Response(JSON.stringify({ error: 'Failed to get public URL of the uploaded file' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ fileStoreUrl: publicURL }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'An error occurred' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
