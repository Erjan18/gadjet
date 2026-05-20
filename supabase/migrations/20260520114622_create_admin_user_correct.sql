/*
  # Create Admin User Correctly

  Creates admin user with all required auth.users and auth.identities fields
  so Supabase Auth email/password sign-in works properly.
*/

DO $$
DECLARE
  v_user_id uuid := gen_random_uuid();
  v_email text := 'gadjet.admin@proton.me';
  v_password text := 'Gadj3t@Adm1n#2024';
BEGIN
  -- Remove old broken user if exists
  DELETE FROM auth.identities WHERE provider = 'email' AND identity_data->>'email' = v_email;
  DELETE FROM admins WHERE user_id IN (SELECT id FROM auth.users WHERE email = v_email);
  DELETE FROM auth.users WHERE email = v_email;

  -- Insert properly formed user
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    last_sign_in_at,
    confirmation_sent_at
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    v_email,
    crypt(v_password, gen_salt('bf')),
    now(),
    '',
    '',
    '',
    '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Gadjet Admin"}'::jsonb,
    false,
    now(),
    now(),
    now(),
    now()
  );

  -- Insert identity record (required for email/password login)
  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    provider,
    identity_data,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    v_user_id,
    v_email,
    'email',
    jsonb_build_object(
      'sub', v_user_id::text,
      'email', v_email,
      'email_verified', true,
      'provider', 'email'
    ),
    now(),
    now(),
    now()
  );

  -- Register as admin
  INSERT INTO admins (user_id) VALUES (v_user_id)
  ON CONFLICT (user_id) DO NOTHING;

END $$;
