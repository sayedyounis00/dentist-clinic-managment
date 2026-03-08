import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const url = new URL(req.url)
    const patientId = url.searchParams.get('id')

    if (patientId) {
      // Get single patient with treatments, payments, appointments
      const [patient, treatments, payments, appointments] = await Promise.all([
        supabase.from('patients').select('*').eq('id', patientId).single(),
        supabase.from('treatments').select('*').eq('patient_id', patientId),
        supabase.from('payments').select('*').eq('patient_id', patientId),
        supabase.from('appointments').select('*').eq('patient_id', patientId),
      ])

      if (patient.error) {
        return new Response(JSON.stringify({ error: 'Patient not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({
        patient: patient.data,
        treatments: treatments.data || [],
        payments: payments.data || [],
        appointments: appointments.data || [],
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get all patients
    const { data, error } = await supabase.from('patients').select('*').order('created_at', { ascending: false })

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ patients: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
