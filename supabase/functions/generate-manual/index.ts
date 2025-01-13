import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { jsPDF } from "https://esm.sh/jspdf@2.5.1"
import autoTable from 'https://esm.sh/jspdf-autotable@3.8.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const doc = new jsPDF();
    
    // Title Page
    doc.setFontSize(24);
    doc.text("Pakistan Welfare Association", 20, 30);
    doc.setFontSize(16);
    doc.text("User Manual", 20, 45);
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 60);

    // Table of Contents
    doc.addPage();
    doc.setFontSize(20);
    doc.text("Table of Contents", 20, 30);
    
    const sections = [
      { title: "1. Getting Started", page: 3 },
      { title: "2. Member Features", page: 10 },
      { title: "3. Collector Features", page: 20 },
      { title: "4. Admin Features", page: 30 },
      { title: "5. Common Tasks", page: 40 },
      { title: "6. Troubleshooting", page: 50 }
    ];

    let yPos = 50;
    sections.forEach(section => {
      doc.text(section.title, 20, yPos);
      doc.text(section.page.toString(), 180, yPos);
      yPos += 10;
    });

    // Content sections
    doc.addPage();
    doc.setFontSize(20);
    doc.text("1. Getting Started", 20, 30);
    doc.setFontSize(12);
    doc.text("Login Process:", 20, 50);
    doc.text("1. Navigate to the login page", 30, 60);
    doc.text("2. Enter your member number", 30, 70);
    doc.text("3. Click 'Login' to proceed", 30, 80);

    // Save to Supabase Storage
    const pdfBytes = doc.output('arraybuffer');
    const fileName = `manual_${new Date().toISOString().slice(0, 10)}.pdf`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documentation')
      .upload(fileName, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) {
      throw uploadError;
    }

    // Create documentation entry
    const { error: dbError } = await supabase
      .from('documentation')
      .insert({
        title: 'PWA User Manual',
        version: '1.0',
        file_path: fileName,
        is_current: true,
        metadata: {
          sections: sections,
          pageCount: doc.getNumberOfPages()
        }
      });

    if (dbError) {
      throw dbError;
    }

    // Get public URL
    const { data: { publicUrl }, error: urlError } = await supabase.storage
      .from('documentation')
      .getPublicUrl(fileName);

    if (urlError) {
      throw urlError;
    }

    return new Response(
      JSON.stringify({ 
        message: 'Manual generated successfully',
        url: publicUrl
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error generating manual:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    );
  }
})