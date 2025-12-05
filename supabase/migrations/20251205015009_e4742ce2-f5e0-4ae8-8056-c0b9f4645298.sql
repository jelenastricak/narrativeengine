-- Add is_shared column for workspace-wide visibility
ALTER TABLE public.narrative_analyses 
ADD COLUMN is_shared BOOLEAN NOT NULL DEFAULT false;

-- Create index for shared analyses queries
CREATE INDEX idx_narrative_analyses_shared ON public.narrative_analyses(is_shared) WHERE is_shared = true;

-- Update RLS policies to allow viewing shared analyses
DROP POLICY IF EXISTS "Users can view their own analyses" ON public.narrative_analyses;

CREATE POLICY "Users can view their own or shared analyses" 
ON public.narrative_analyses 
FOR SELECT 
USING (auth.uid() = user_id OR is_shared = true);

-- Keep existing policies for create/update/delete (owner only)
-- These should already exist, but let's ensure they're correct
DROP POLICY IF EXISTS "Users can create their own analyses" ON public.narrative_analyses;
DROP POLICY IF EXISTS "Users can update their own analyses" ON public.narrative_analyses;
DROP POLICY IF EXISTS "Users can delete their own analyses" ON public.narrative_analyses;

CREATE POLICY "Users can create their own analyses" 
ON public.narrative_analyses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analyses" 
ON public.narrative_analyses 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analyses" 
ON public.narrative_analyses 
FOR DELETE 
USING (auth.uid() = user_id);

-- Enable realtime for presence tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.narrative_analyses;