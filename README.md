# credit-pmqa-task-track

A React/Vite task and QA capacity tracker for the Credit PM team.

## Run locally

Install dependencies with `npm install`, then start the Vite dev server with `npm run dev`.

## Connect real shared data

1. Create a project at Supabase and open its SQL Editor.
2. Run the contents of `supabase/schema.sql` to create and seed the `team_members` table.
3. Copy `.env.example` to `.env.local`.
4. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from the Supabase project API settings.
5. Restart the dev server with `npm run dev`.

When these variables are present, the People tab loads and saves members through Supabase. Without them, it uses the sample data in `src/people/data.js` for local UI development.

For production, add the same variables to your hosting provider and replace the starter public database policies in `supabase/schema.sql` with authenticated-user policies before storing sensitive team data.

## Included

- Feature-linked task queue with search and status filters
- QA timeline showing assignments by person and day
- Capacity summary and release readiness panel
- New task modal that updates the live queue

The React entry point is `src/main.jsx`, with the dashboard shell in `src/App.jsx`.

People configuration is split into its own feature folder:

- `src/people/PeoplePanel.jsx` - People tab and member list
- `src/people/PeopleModal.jsx` - Add and edit member form
- `src/people/data.js` - Initial team members
- `src/config.js` - Available roles

Feature configuration is split into `src/features/`:

- `src/features/FeaturePanel.jsx` - List and Kanban views
- `src/features/FeatureModal.jsx` - Feature form
- `src/features/data.js` - Local fallback feature data
- `src/features/config.js` - Products, priorities, and statuses
- `src/features/repository.js` - Supabase feature CRUD

To change the available People roles, edit `src/config.js` and update the `peopleRoles` list. The People filters and Add person form will use the updated list automatically.

To enable persistent Features data in Supabase, run `supabase/features.sql` in the SQL Editor after `supabase/schema.sql`. The Features tab stores PM and QA PICs as foreign-key IDs linked to `team_members`; names are resolved from the People table when displayed. The migration backfills existing name-based PIC values, then removes the redundant name columns. Both scripts are safe to run again: existing policies are recreated and seed records are not duplicated by name.