### Authentication:

- Password hashing with bcrypt
- JWT creation and validation
- Login / Register

### Authorization:

- Middleware to verify tokens
- Users can only see their own todos
- Checked in all controllers

### Input Validation:

- express-validator for validation
- Error handling with custom messages

### Rate Limiting:

> If too many requests come from one IP in a short time, access gets temporarily blocked.

- Protection against brute-force attacks
- Different limits for different routes (e.g. auth routes vs. general routes)

You can now also safely delete your account. You just need to confirm your password first. Additionally, it's possible to delete all todos at once.

My Frontend Repo: https://github.com/SimonTheDevloper/mini-todoapp-Frontend

made by SimDev 🙈

---

### How to run it locally:

**1. Clone the repo**

```bash
git clone https://github.com/SimonTheDevloper/mini-todoapp-backend.git
cd mini-todoapp-backend
npm install
```

**2. Set up MongoDB**

You have two options:

- **MongoDB Atlas** (cloud, easier) -> create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas) and copy your connection string
- **Local MongoDB** -> install MongoDB on your machine and use `mongodb://localhost:27017`

**3. Create a `.env` file** in the root folder:

```env
MONGO_URI=your_connection_string_here
JWT_SECRET=any_random_secret
JWT_REFRESH_SECRET=any_other_random_secret
PORT=3000
```

**4. Start the server**

```bash
npm run dev
```

Then open `http://localhost:3000` in your browser.
