-- ============================================================================
-- PRODUCTION DATABASE CLEANUP SCRIPT
-- ============================================================================
-- Run this script to remove all fake/sample data from your database
-- This makes the database ready for real user accounts and production use

-- IMPORTANT: This will delete ALL user data. Use with caution!
-- Only run this if you want to start fresh with no sample data.

-- ============================================================================
-- REMOVE ALL SAMPLE DATA
-- ============================================================================

BEGIN;

-- Remove all sample data from tables in correct order (respecting foreign keys)
DELETE FROM public.messages WHERE TRUE;
DELETE FROM public.conversations WHERE TRUE;
DELETE FROM public.notifications WHERE TRUE;
DELETE FROM public.tasks WHERE TRUE;
DELETE FROM public.medical_records WHERE TRUE;
DELETE FROM public.appointments WHERE TRUE;
DELETE FROM public.patients WHERE TRUE;
DELETE FROM public.providers WHERE TRUE;
DELETE FROM public.users WHERE TRUE;

-- Optional: Remove subscription packages if you want to recreate them
-- DELETE FROM public.subscription_packages WHERE TRUE;

-- Reset auto-increment sequences (if using serial IDs)
-- This ensures new records start from ID 1
SELECT setval(pg_get_serial_sequence('public.users', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('public.patients', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('public.providers', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('public.appointments', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('public.medical_records', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('public.conversations', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('public.messages', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('public.notifications', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('public.tasks', 'id'), 1, false);

COMMIT;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Run this to verify the cleanup was successful

SELECT 
    'users' as table_name, COUNT(*) as record_count 
FROM public.users
UNION ALL
SELECT 'patients', COUNT(*) FROM public.patients
UNION ALL
SELECT 'providers', COUNT(*) FROM public.providers
UNION ALL
SELECT 'appointments', COUNT(*) FROM public.appointments
UNION ALL
SELECT 'medical_records', COUNT(*) FROM public.medical_records
UNION ALL
SELECT 'conversations', COUNT(*) FROM public.conversations
UNION ALL
SELECT 'messages', COUNT(*) FROM public.messages
UNION ALL
SELECT 'notifications', COUNT(*) FROM public.notifications
UNION ALL
SELECT 'tasks', COUNT(*) FROM public.tasks
UNION ALL
SELECT 'subscription_packages', COUNT(*) FROM public.subscription_packages
ORDER BY table_name;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ PRODUCTION CLEANUP COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Your database is now ready for production use:';
    RAISE NOTICE '   - All fake/sample data has been removed';
    RAISE NOTICE '   - Database is clean and ready for real users';
    RAISE NOTICE '   - Users can now register their own accounts';
    RAISE NOTICE '   - Providers can create their own profiles';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Next steps:';
    RAISE NOTICE '   1. Deploy your application';
    RAISE NOTICE '   2. Enable user registration';
    RAISE NOTICE '   3. Let real users create their accounts';
    RAISE NOTICE '   4. Healthcare providers can sign up and verify credentials';
END $$;