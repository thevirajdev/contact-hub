-- Create contacts table
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (anyone can view contacts)
CREATE POLICY "Anyone can view contacts" 
ON public.contacts 
FOR SELECT 
USING (true);

-- Create policy for public insert access (anyone can add contacts)
CREATE POLICY "Anyone can add contacts" 
ON public.contacts 
FOR INSERT 
WITH CHECK (true);

-- Create policy for public delete access (anyone can delete contacts)
CREATE POLICY "Anyone can delete contacts" 
ON public.contacts 
FOR DELETE 
USING (true);

-- Add index for sorting by created_at and name
CREATE INDEX idx_contacts_created_at ON public.contacts (created_at DESC);
CREATE INDEX idx_contacts_name ON public.contacts (name ASC);