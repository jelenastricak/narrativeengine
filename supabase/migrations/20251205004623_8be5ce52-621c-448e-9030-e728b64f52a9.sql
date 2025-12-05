-- Create table to store narrative analyses
CREATE TABLE public.narrative_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  input_text TEXT NOT NULL,
  analysis_result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.narrative_analyses ENABLE ROW LEVEL SECURITY;

-- Users can only see their own analyses
CREATE POLICY "Users can view their own analyses"
ON public.narrative_analyses
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own analyses
CREATE POLICY "Users can create their own analyses"
ON public.narrative_analyses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own analyses
CREATE POLICY "Users can delete their own analyses"
ON public.narrative_analyses
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster user lookups
CREATE INDEX idx_narrative_analyses_user_id ON public.narrative_analyses(user_id);
CREATE INDEX idx_narrative_analyses_created_at ON public.narrative_analyses(created_at DESC);