-- Store short-lived signup OTPs (accessed only via server-side functions)
CREATE TABLE IF NOT EXISTS public.signup_otps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_signup_otps_email ON public.signup_otps (email);

-- Lock down: no direct client access (only server-side role should use it)
ALTER TABLE public.signup_otps ENABLE ROW LEVEL SECURITY;