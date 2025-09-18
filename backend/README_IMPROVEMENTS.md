
# Backend Improvements (automated)

Applied conservative, safe improvements to the backend:
- Added security & performance middleware in `server.js`:
  - helmet, compression, cors, morgan, express-rate-limit
  - increased express.json limit to 10mb
- Rewrote `routes/blogRoutes.js` to:
  - support pagination and search (`GET /api/blogs?page=1&limit=10&q=term`)
  - add express-validator input validation for create/update endpoints
  - return total and totalPages in list endpoint
  - consistent error handling and populated author fields
- Updated `package.json` scripts: `start` and `dev`
- Added development dependencies in `package.json` (please run `npm install` in backend)
- No changes were made to authentication middleware or models (only routing logic replaced).
