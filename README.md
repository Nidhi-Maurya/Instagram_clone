# Instagram Clone

A full-stack Instagram-inspired social media application built with the MERN stack. It includes authentication, posts, reels, profile management, follow requests, realtime chat, notifications, explore feed, bookmarks, comments, and responsive Instagram-style UI.

## Screenshots

Add your screenshots inside `docs/screenshots/` and update the file names below if needed.

| Login | Home Feed | Profile |
| --- | --- | --- |
| ![Login](docs/screenshots/login.png) | ![Home Feed](docs/screenshots/home.png) | ![Profile](docs/screenshots/profile.png) |

| Explore | Reels | Chat |
| --- | --- | --- |
| ![Explore](docs/screenshots/explore.png) | ![Reels](docs/screenshots/reels.png) | ![Chat](docs/screenshots/chat.png) |

## Features

- Secure signup, login, logout, protected routes, and 1-day session expiry.
- Instagram-style responsive feed with posts, likes, comments, bookmarks, and post deletion.
- Profile editing with username, bio, gender, and profile picture upload.
- Follow request workflow with accept, reject, cancel, followers, and following lists.
- Realtime notifications for likes, follow requests, and messages using Socket.IO.
- Realtime chat with message notifications and Enter-key message sending.
- Search users and send follow requests directly from search or suggestions.
- Explore page using public posts ranked by recency, likes, comments, and suggested authors.
- Reels feed with video upload, seeded demo reels, likes, comments, save/share actions, and responsive controls.
- Account deletion flow and logout confirmation.
- Mobile-first responsive UI for feed, profile, create post, chat, reels, and sidebar navigation.

## Tech Stack

**Frontend**

- React 18
- Vite
- Redux Toolkit
- React Redux
- React Router DOM
- Axios
- Socket.IO Client
- Tailwind CSS
- Radix UI
- Lucide React
- React Icons
- Sonner Toast

**Backend**

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- Cookie Parser
- Multer
- Cloudinary
- Sharp
- Socket.IO
- CORS

## Project Structure

```txt
.
|-- frontend/
|   |-- public/
|   `-- src/
|       |-- components/
|       |-- hooks/
|       |-- lib/
|       `-- redux/
|-- server/
|   |-- controllers/
|   |-- middlewares/
|   |-- models/
|   |-- routes/
|   |-- scripts/
|   |-- utils/
|   |-- index.js
|   `-- socket.js
|-- package.json
`-- README.md
```

## Environment Variables

Create a `.env` file in the root folder.

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
SECRET_KEY=your_jwt_secret
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
CLIENT_URL=http://localhost:5173
```

For deployed frontend/backend URLs, set:

```env
CLIENT_URL=https://your-frontend-url.vercel.app
RENDER_EXTERNAL_URL=https://your-backend-url.onrender.com
```

Optional frontend environment variable:

```env
VITE_API_BASE_URL=http://localhost:8000
```

If `VITE_API_BASE_URL` is not set, the frontend uses `http://localhost:8000` on localhost and same-origin API calls in production.

## Local Setup

1. Clone the repository.

```bash
git clone <your-repository-url>
cd <your-project-folder>
```

2. Install backend dependencies.

```bash
npm install
```

3. Install frontend dependencies.

```bash
npm install --prefix frontend
```

4. Add environment variables in `.env`.

5. Start the backend server.

```bash
npm run dev
```

6. Start the frontend in another terminal.

```bash
npm run dev --prefix frontend
```

7. Open the app.

```txt
Frontend: http://localhost:5173
Backend:  http://localhost:8000
```

## Build and Production

Build the frontend:

```bash
npm run build --prefix frontend
```

Build the full project:

```bash
npm run build
```

Start production server:

```bash
npm start
```

The Express server serves the built frontend from `frontend/dist`.

## Seed Demo Reels

To seed demo reels:

```bash
npm run seed:reels
```

Make sure MongoDB and Cloudinary environment variables are configured before running the seed script.

## API Documentation

Base URL:

```txt
http://localhost:8000/api/v1
```

Authentication uses an HTTP-only cookie named `token`. Protected routes require the user to be logged in.

### Auth and Users

| Method | Endpoint | Protected | Description |
| --- | --- | --- | --- |
| `POST` | `/user/register` | No | Create a new account |
| `POST` | `/user/login` | No | Login and set auth cookie |
| `GET` | `/user/logout` | No | Clear auth cookie |
| `GET` | `/user/me` | Yes | Get current logged-in user |
| `DELETE` | `/user/delete-account` | Yes | Permanently delete current account |
| `GET` | `/user/search?q=nidhi` | Yes | Search users by username |
| `GET` | `/user/suggested` | Yes | Get suggested users |
| `GET` | `/user/:id/profile` | Yes | Get user profile |
| `POST` | `/user/profile/edit` | Yes | Edit profile details and profile picture |
| `POST` | `/user/followunfollow/:id` | Yes | Send, cancel, or remove follow relationship |
| `POST` | `/user/follow-request/:id/:action` | Yes | Accept or reject follow request |

Register request:

```json
{
  "username": "nidhi",
  "email": "nidhi@example.com",
  "password": "Password@123"
}
```

Login request:

```json
{
  "email": "nidhi@example.com",
  "password": "Password@123"
}
```

Edit profile request uses `multipart/form-data`:

| Field | Type | Required |
| --- | --- | --- |
| `username` | text | No |
| `bio` | text | No |
| `gender` | text | No |
| `profilePhoto` or `profilePicture` | file | No |

Follow request action values:

```txt
accept
reject
```

### Posts

| Method | Endpoint | Protected | Description |
| --- | --- | --- | --- |
| `POST` | `/post/addpost` | Yes | Create a post with image |
| `GET` | `/post/all` | Yes | Get all feed posts |
| `GET` | `/post/explore` | Yes | Get ranked explore posts |
| `GET` | `/post/userpost/all` | Yes | Get current user's posts |
| `GET` | `/post/:id/like` | Yes | Like a post |
| `GET` | `/post/:id/dislike` | Yes | Remove like from a post |
| `POST` | `/post/:id/comment` | Yes | Add comment to a post |
| `GET` | `/post/:id/comment/all` | Yes | Get all comments of a post |
| `DELETE` | `/post/delete/:id` | Yes | Delete own post |
| `GET` | `/post/:id/bookmark` | Yes | Save or remove bookmark |

Create post request uses `multipart/form-data`:

| Field | Type | Required |
| --- | --- | --- |
| `caption` | text | No |
| `image` | file | Yes |

Add comment request:

```json
{
  "text": "Amazing post!"
}
```

### Messages

| Method | Endpoint | Protected | Description |
| --- | --- | --- | --- |
| `POST` | `/message/send/:id` | Yes | Send message to user |
| `GET` | `/message/all/:id` | Yes | Get conversation with user |

Send message request:

```json
{
  "message": "Hello!"
}
```

### Reels

| Method | Endpoint | Protected | Description |
| --- | --- | --- | --- |
| `POST` | `/reel/create` | Yes | Upload a reel |
| `GET` | `/reel/feed` | Yes | Get reels feed |
| `GET` | `/reel/:id/like` | Yes | Like a reel |
| `GET` | `/reel/:id/dislike` | Yes | Remove like from a reel |
| `POST` | `/reel/:id/comment` | Yes | Add reel comment |
| `POST` | `/reel/:id/view` | Yes | Track reel view |

Create reel request uses `multipart/form-data`:

| Field | Type | Required |
| --- | --- | --- |
| `caption` | text | No |
| `video` | file | Yes |

Add reel comment request:

```json
{
  "text": "Nice reel!"
}
```

## Socket.IO Events

The client connects with the logged-in user id:

```js
io(API_BASE_URL, {
  query: { userId },
  transports: ["websocket"]
});
```

| Event | Direction | Description |
| --- | --- | --- |
| `getOnlineUsers` | Server to client | Sends online user ids |
| `newMessage` | Server to receiver | Sends realtime chat message |
| `messageNotification` | Server to receiver | Sends instant message notification |
| `followRequestNotification` | Server to receiver | Sends follow request or cancel update |
| `notification` | Server to receiver | Sends like/dislike notification |

## Deployment Notes

- Use MongoDB Atlas for production database.
- Use Cloudinary for profile pictures, post images, and reel videos.
- Add required environment variables in Render/Vercel dashboard.
- If frontend and backend are deployed separately, set `VITE_API_BASE_URL` on the frontend.
- If the backend serves `frontend/dist`, deploy the full-stack app to Render and run `npm run build` before `npm start`.
- Make sure cookies and CORS use the correct production URLs.

## Useful Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start backend with nodemon |
| `npm run build` | Install dependencies and build frontend |
| `npm start` | Start production backend |
| `npm run seed:reels` | Seed demo reels |
| `npm run dev --prefix frontend` | Start Vite frontend |
| `npm run build --prefix frontend` | Build frontend only |

## Screenshot Setup for GitHub

1. Create screenshots using your browser or device preview.
2. Save them in `docs/screenshots/`.
3. Recommended names:

```txt
login.png
home.png
profile.png
explore.png
reels.png
chat.png
```

4. Commit the images with `README.md`.
5. GitHub will automatically render them in the screenshots table.

## License

This project is for learning and portfolio use.
