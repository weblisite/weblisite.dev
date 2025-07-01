# Supabase Database Setup Guide

This guide will help you set up the Supabase database for the Weblisite IDE application.

## Prerequisites

- Supabase account (sign up at [supabase.com](https://supabase.com))
- Basic understanding of PostgreSQL

## 1. Create a New Supabase Project

1. Log in to your Supabase dashboard
2. Click "New project"
3. Choose your organization
4. Enter project details:
   - **Name**: `weblisite-ide`
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users

## 2. Set Up Environment Variables

After your project is created, you'll need these environment variables:

```bash
# Add to your .env file
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# Client-side variables (for Vite)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Enable Supabase storage
USE_SUPABASE=true
```

### Finding Your Keys

1. Go to your project settings
2. Navigate to "API" section
3. Copy the following:
   - **Project URL** → `SUPABASE_URL`
   - **anon/public key** → `SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_KEY`

## 3. Run the Database Schema

Copy the contents of `supabase-schema.sql` and run it in your Supabase SQL Editor:

1. Go to the SQL Editor in your Supabase dashboard
2. Create a new query
3. Paste the schema code
4. Click "Run"

The schema includes:

### Tables Created
- `user_profiles` - User account information
- `projects` - User projects
- `project_files` - Project file contents
- `project_deployments` - Deployment history
- `project_configs` - Project configurations

### Security Features
- Row Level Security (RLS) policies
- User data isolation
- Secure authentication integration

### Storage Buckets
- `user-uploads` - File uploads and assets

## 4. Configure Authentication Providers

### Google OAuth Setup

1. Go to Authentication → Providers
2. Enable Google provider
3. Add your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
4. Add redirect URL: `https://your-project-ref.supabase.co/auth/v1/callback`

### GitHub OAuth Setup

1. Enable GitHub provider
2. Add your GitHub OAuth credentials:
   - **Client ID**: From GitHub Developer Settings
   - **Client Secret**: From GitHub Developer Settings
3. Add redirect URL: `https://your-project-ref.supabase.co/auth/v1/callback`

## 5. Set Up Storage

1. Go to Storage section
2. Create a new bucket called `user-uploads`
3. Configure bucket policies (already included in schema)

## 6. Test the Connection

After setting up:

1. Update your `.env` file with the new credentials
2. Restart your development server
3. Check the server logs for successful Supabase connection

You should see:
```
🔄 SupabaseStorage initialized successfully
```

## 7. Verify Schema

You can verify the schema was created correctly by checking:

1. **Tables**: Should see all 5 tables in the Table Editor
2. **Policies**: Check Authentication → Policies
3. **Storage**: Verify `user-uploads` bucket exists

## Common Issues

### Permission Errors
If you see permission errors when running the schema:
- Make sure you're using the service role key
- Some commands may require superuser privileges (remove if needed)

### UUID Extension
If you get UUID generation errors:
```sql
-- Run this if uuid-ossp extension is missing
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### RLS Policies
If authentication isn't working:
- Verify RLS policies are enabled
- Check that `auth.uid()` is accessible
- Ensure JWT secret is configured

## Next Steps

1. Test user registration and login
2. Create a test project to verify database operations
3. Test file upload to storage
4. Verify deployment tracking works

## Security Notes

- Never expose your service role key in client-side code
- Use anon key for client-side operations
- RLS policies protect user data automatically
- All authentication is handled by Supabase Auth

## Support

For issues with this setup:
1. Check the Supabase documentation
2. Review the schema file for any custom modifications needed
3. Test with a simple database query first

---

*This setup guide is part of the Weblisite IDE project documentation.*