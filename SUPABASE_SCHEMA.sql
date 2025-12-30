-- Create a bucket for section previews
insert into storage.buckets (id, name, public)
values ('section-previews', 'section-previews', true);

-- Create a table for sections
create table public.sections (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  slug text not null unique,
  description text,
  code text not null,
  category text,
  niches text[],
  preview_url text,
  user_id uuid references auth.users not null,
  author_name text
);

-- Set up Row Level Security (RLS)
alter table public.sections enable row level security;

-- Allow anyone to read sections
create policy "Sections are public"
  on public.sections for select
  using ( true );

-- Allow authenticated users to insert their own sections
create policy "Users can insert their own sections"
  on public.sections for insert
  with check ( auth.uid() = user_id );

-- Allow users to update/delete their own sections
create policy "Users can update own sections"
  on public.sections for update
  using ( auth.uid() = user_id );

create policy "Users can delete own sections"
  on public.sections for delete
  using ( auth.uid() = user_id );

-- Storage policies
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'section-previews' );

create policy "Authenticated users can upload"
  on storage.objects for insert
  with check ( bucket_id = 'section-previews' and auth.role() = 'authenticated' );
