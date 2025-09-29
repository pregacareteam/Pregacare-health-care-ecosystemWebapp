-- ============================================================================
-- REMOVE ALL SAMPLE DATA FOR PRODUCTION USE
-- ============================================================================

-- Remove all sample data from tables in correct order (respecting foreign keys)
DELETE FROM public.messages;
DELETE FROM public.conversations;
DELETE FROM public.notifications;
DELETE FROM public.tasks;
DELETE FROM public.medical_records;
DELETE FROM public.appointments;
DELETE FROM public.patients;
DELETE FROM public.providers;
DELETE FROM public.users;

-- Keep subscription packages as they are core business offerings
-- DELETE FROM public.subscription_packages;

-- Reset sequences for clean ID generation
ALTER SEQUENCE IF EXISTS users_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS patients_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS providers_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS appointments_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS medical_records_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS conversations_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS messages_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS notifications_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS tasks_id_seq RESTART WITH 1;

-- ============================================================================
-- UTILITY FUNCTIONS FOR FRESH START
-- ============================================================================

-- Function to verify clean database state
CREATE OR REPLACE FUNCTION verify_clean_database()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'users_count', (SELECT COUNT(*) FROM public.users),
        'patients_count', (SELECT COUNT(*) FROM public.patients),
        'providers_count', (SELECT COUNT(*) FROM public.providers),
        'appointments_count', (SELECT COUNT(*) FROM public.appointments),
        'medical_records_count', (SELECT COUNT(*) FROM public.medical_records),
        'conversations_count', (SELECT COUNT(*) FROM public.conversations),
        'messages_count', (SELECT COUNT(*) FROM public.messages),
        'notifications_count', (SELECT COUNT(*) FROM public.notifications),
        'tasks_count', (SELECT COUNT(*) FROM public.tasks),
        'subscription_packages_count', (SELECT COUNT(*) FROM public.subscription_packages),
        'database_ready_for_production', CASE 
            WHEN (SELECT COUNT(*) FROM public.users) = 0 AND
                 (SELECT COUNT(*) FROM public.patients) = 0 AND
                 (SELECT COUNT(*) FROM public.providers) = 0 THEN true
            ELSE false
        END
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment to track migration
COMMENT ON FUNCTION verify_clean_database() IS 'Verifies that all sample data has been removed and database is ready for production use';

-- Log the cleanup completion
DO $$
BEGIN
    RAISE NOTICE 'Sample data cleanup completed. Database is now ready for production use.';
    RAISE NOTICE 'Use SELECT verify_clean_database(); to confirm clean state.';
END $$;