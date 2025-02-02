# Video Streaming Backend

A robust backend service for video streaming platforms with user authentication, video management, and playlist features.

## Features 

- **User Authentication**
  - ✅ JWT-based registration/login
  - 🔒 Protected routes
  - 🔑 Password encryption
- **Video Management**
  - 📤 Video upload with metadata
  - 📺 Video streaming endpoints
  - 🖼️ Thumbnail generation
  - 🔄 Video transcoding
- **Playlist System**
  - 📝 Create/update/delete playlists
  - ➕➖ Add/remove videos from playlists
  - 👤 User-specific playlist management
- **Additional Features**
  - 📄 Paginated API responses
  - 🚨 Advanced error handling
  - ⏱️ Rate limiting
  - 🔍 Search functionality
  - 📚 API documentation

## Tech Stack 

| Category        | Technologies                          |
|-----------------|---------------------------------------|
| **Backend**     | Node.js, Express.js                   |
| **Database**    | MongoDB, Mongoose                      |
| **Auth**        | JWT, Bcrypt                           |
| **Caching**     | Redis                                 |
| **Media**       | FFmpeg, Sharp                         |
| **Storage**     | Cloudinary, Multer                    |
| **Logging**     | Winston                               |

## Getting Started 

### Prerequisites

- Node.js (v18+)
- MongoDB (v6.0+)
- Redis (v7.0+)
- FFmpeg (v6.0+)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/adarsh-naik-2004/video-backend.git
cd video-backend
```
2. Install dependencies:
```bash
npm install dependencies
```
4. Create .env file:
   
| **Variable**                 | **Description**                      | **Required** |
|------------------------------|--------------------------------------|--------------|
| **PORT**                      | Server port                          | Yes          |
| **MONGODB_URI**               | MongoDB connection URL               | Yes          |
| **JWT_SECRET**                | JWT encryption secret                | Yes          |
| **JWT_EXPIRY**                | JWT expiration time                  | Yes          |
| **CLOUDINARY_CLOUD_NAME**     | Cloudinary cloud name                | Yes          |
| **CLOUDINARY_API_KEY**        | Cloudinary API key                   | Yes          |
| **CLOUDINARY_API_SECRET**     | Cloudinary API secret                | Yes          |
| **REDIS_URL**                 | Redis connection URL                 | No           |

## Schema Components

### Users
- Primary identifier (id)
- Username and email
- Full name
- Avatar and cover image
- Password (encrypted)
- Watch history
- Timestamps (createdAt, updatedAt)

### Videos
- Primary identifier (id)
- Title and description
- Thumbnail
- Duration and view count
- Owner reference
- Publication status
- Timestamps (createdAt, updatedAt)

### Playlists
- Primary identifier (id)
- Name and description
- Owner reference
- Videos collection
- Timestamps (createdAt, updatedAt)

### Comments
- Primary identifier (id)
- Content
- Owner reference
- Timestamps (createdAt, updatedAt)

### Likes
- Primary identifier (id)
- Comment reference
- Video reference
- User reference
- Timestamps (createdAt, updatedAt)

### Tweets
- Primary identifier (id)
- Content
- Owner reference
- Timestamps (createdAt, updatedAt)

### Subscriptions
- Primary identifier (id)
- Subscriber reference
- Channel reference
- Timestamps (createdAt, updatedAt)

### Relationships
- Users can create multiple videos, playlists, comments, and tweets
- Videos can have multiple comments and likes
- Users can subscribe to multiple channels
- Playlists can contain multiple videos
- Comments can receive multiple likes
  
## Schema Visualization
The complete database schema visualization is available at [Eraser.io Workspace](https://app.eraser.io/workspace/fl0B1qyECDxriwR6Ypcw?origin=share)

## License

[MIT](https://github.com/adarsh-naik-2004/video-backend?tab=MIT-1-ov-file#readme)
