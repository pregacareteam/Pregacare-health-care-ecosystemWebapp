-- Create policies for audit_logs (admin access only)
CREATE POLICY "Admin access to audit logs" 
ON public.audit_logs 
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'
));