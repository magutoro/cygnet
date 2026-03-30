# Production Security Verification Playbook

This document is the source of truth for what has been **verified in production** versus what is only **implemented in code or migrations**.

## 1. Current expected access model

### Profiles
- Table: `public.profiles`
- RLS must be enabled
- Only the currently authenticated Cygnet user should be able to:
  - read their own profile row
  - insert their own profile row
  - update their own profile row
  - delete their own profile row

Expected owner rule:
- `profiles.id = auth.uid()`

### Resumes table
- Table: `public.resumes`
- RLS must be enabled
- Only the currently authenticated Cygnet user should be able to:
  - read their own resume rows
  - insert their own resume rows
  - update their own resume rows
  - delete their own resume rows

Expected owner rule:
- `resumes.user_id = auth.uid()`

### Resume storage bucket
- Bucket: `resumes`
- Bucket must be private
- Allowed MIME type should be `application/pdf`
- Object paths should be scoped as:
  - `<user-id>/<file>.pdf`

Expected owner rule:
- the first folder segment of `storage.objects.name` must equal `auth.uid()`

## 2. Supabase dashboard checks

Use these checks in the Supabase dashboard after each security-relevant release.

### Database > Table Editor / Policies
Confirm for `public.profiles`:
- RLS is enabled
- Expected policies exist:
  - `Users can read own profile`
  - `Users can insert own profile`
  - `Users can update own profile`
  - `Users can delete own profile`
- No broad policies remain, especially anything equivalent to:
  - allow all `authenticated`
  - allow `anon`
  - unrestricted `select`

Confirm for `public.resumes`:
- RLS is enabled
- Expected policies exist:
  - `Users can read own resumes`
  - `Users can insert own resumes`
  - `Users can update own resumes`
  - `Users can delete own resumes`
- No broad policies remain

### Storage > Buckets
Confirm for `resumes`:
- bucket exists
- `public = false`
- file size limit is `10 MB`
- allowed MIME types show `application/pdf`

### Storage policies
Confirm `storage.objects` policies exist for the `resumes` bucket:
- `Users can upload own resumes`
- `Users can read own resumes`
- `Users can delete own resumes`

Each must scope access to the owner's folder prefix:
- `auth.uid()::text = (storage.foldername(name))[1]`

### Views
Confirm the unused view is not exposed to normal client roles:
- view: `public.profile_additional_fields`
- `anon` should not have access
- `authenticated` should not have access

## 3. Two-user verification flow

Run this test with two separate Cygnet accounts.

### Setup
1. Create test user A
2. Create test user B
3. Log in as user A in the web app
4. Save profile data as user A
5. Upload one resume as user A
6. Record:
   - A's profile row id
   - A's resume row id
   - A's resume `storage_path`

### Expected success for owner
As user A:
- profile load succeeds
- profile save succeeds
- resume list succeeds
- resume parse succeeds
- resume delete succeeds

### Expected failure for non-owner
Log in as user B and verify all of the following fail:
- reading A's profile row
- updating A's profile row
- deleting A's profile row
- reading A's resume row
- deleting A's resume row
- downloading A's resume storage object
- parsing A's resume by sending A's `storage_path`

Expected result:
- all non-owner attempts fail with permission errors or no data

## 4. Server-side and secret verification

### Repo / environment checks
Confirm:
- no Supabase `service_role` key is present in:
  - client-side web code
  - extension code
  - public environment variables

Current repo expectation:
- only anon/public Supabase keys are referenced in client and extension code

### Admin controls
Confirm outside the repo:
- MFA is enabled for:
  - Supabase
  - Vercel
  - GitHub
  - the primary admin email account
- only necessary team members have admin access
- support/admin access to synced user data is auditable

## 5. Verification status template

When you verify a release, record it like this:

```text
Date:
Environment:
Verifier:

Profiles RLS:
Resumes RLS:
Resumes bucket private:
PDF-only bucket:
Unused view locked down:
Two-user access test passed:
Parse route foreign storagePath rejected:
MFA/admin access reviewed:
Notes:
```
