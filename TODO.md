# TODO: Implement Mijn Opdrachten Page

## Steps to Complete
- [ ] Update pages/api/opdracht/mijn-opdrachten.js to use the same SELECT query as opdrachten.js, adding WHERE user_id = $1 for filtering.
- [ ] Create pages/opdracht/mijn-opdrachten.js by copying opdrachten.js, with changes:
  - Change h1 title to "Mijn Opdrachten".
  - Update fetch URL to `/api/opdracht/mijn-opdrachten?userId=${user.id}`.
  - Make fetchOpdrachten useEffect depend on user state.
  - Bidding remains hidden for posters.
- [ ] Verify the new page loads correctly and displays only the user's assignments.
