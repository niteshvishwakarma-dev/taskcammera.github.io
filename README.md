# 📹 CameraShare - Real-Time Camera Sharing Platform

**A secure, permission-based real-time camera sharing application** that lets you share your camera feed with others through a simple link. Get instant access to anyone's camera with their approval!

---

## ✨ Features

✅ **Share Your Camera** - Generate a unique link and share it with anyone  
✅ **Permission-Based** - Camera owner controls who can view  
✅ **Real-Time Streaming** - WebRTC for low-latency video  
✅ **No Installation** - Works directly in the browser  
✅ **Secure** - No permanent recording or data storage  
✅ **Mobile Friendly** - Responsive design for all devices  
✅ **Easy to Use** - Copy-paste share link, viewer requests permission  

---

## 🏗️ Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Backend:** Node.js, Express.js
- **Real-Time Communication:** Socket.IO
- **Video Streaming:** WebRTC (P2P)
- **Hosting:** GitHub Pages / Any Node.js host

---

## 📋 How It Works

### For Camera Owners (Sharers)

1. Click **"Share My Camera"** button
2. Allow camera access in your browser
3. A unique link is generated automatically
4. Share the link with anyone
5. When someone requests access, approve or deny
6. Their video stream appears in your viewer list

### For Viewers

1. Click **"View Camera"** button
2. Paste the share link or code
3. Click **"Connect to Camera"**
4. Wait for camera owner's approval
5. Once approved, live camera feed displays
6. Can disconnect anytime

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- npm
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone the repository
git clone https://github.com/niteshvishwakarma-dev/taskcammera.github.io.git
cd taskcammera.github.io

# Install dependencies
npm install

# Start the server
npm start
```

Server will run on `http://localhost:3000`

### For Development

```bash
npm run dev
```

Uses nodemon for auto-restart on file changes.

---

## 📂 Project Structure

```
taskcammera.github.io/
├── server.js              # Express + Socket.IO backend
├── package.json           # Dependencies
├── public/
│   ├── index.html         # Main application interface
│   ├── styles.css         # Complete styling
│   ├── app.js             # Client-side logic
│   └── favicon.ico        # Website icon (optional)
├── README.md              # This file
└── .gitignore
```

---

## 🔌 API Endpoints

### POST `/api/generate-link`
Generate a new share session
```json
{
  "userId": "user_123"
}
```
**Response:**
```json
{
  "sessionId": "uuid",
  "shareCode": "ABC123",
  "shareUrl": "http://localhost:3000/share/ABC123"
}
```

### GET `/api/session/:shareCode`
Check if session exists and is active
```json
{
  "sessionId": "uuid",
  "shareCode": "ABC123",
  "isActive": true
}
```

### POST `/api/request-permission`
Viewer requests camera access
```json
{
  "sessionId": "uuid",
  "viewerId": "user_456"
}
```

### POST `/api/respond-permission`
Owner approves/denies permission
```json
{
  "requestId": "uuid",
  "approved": true
}
```

---

## 🔌 WebSocket Events

### Owner Events
- **`owner-join`** - Owner connects
- **`receive-offer`** - Receive WebRTC offer from viewer
- **`receive-ice-candidate`** - Receive ICE candidate
- **`permission-request`** - New permission request received

### Viewer Events
- **`viewer-join`** - Viewer connects
- **`permission-response`** - Permission approved/denied
- **`receive-answer`** - Receive WebRTC answer from owner
- **`receive-ice-candidate`** - Receive ICE candidate

---

## 🎨 UI Components

### Role Selection Screen
- Clean two-button interface
- Camera icons for each role
- Smooth animations

### Share Camera Section
- Live video preview
- Real-time status indicator
- Copy-to-clipboard share link
- Permission requests panel
- Active viewers list

### View Camera Section
- Share code/link input
- Connection status updates
- Live video player
- Quick disconnect button

---

## 🔒 Security Features

✅ **No Server-Side Storage** - No permanent records  
✅ **WebRTC P2P** - Direct peer-to-peer encryption  
✅ **Permission Control** - Owner explicitly approves access  
✅ **Session-Based** - Links expire when closed  
✅ **Unique Codes** - 6-character alphanumeric codes  
✅ **HTTPS Ready** - SSL/TLS compatible  

---

## 📱 Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome  | ✅ Full | Recommended |
| Firefox | ✅ Full | Works great |
| Safari  | ✅ Full | iOS 11+ |
| Edge    | ✅ Full | Chromium-based |
| Opera   | ✅ Full | No issues |

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file:
```env
PORT=3000
NODE_ENV=development
BASE_URL=http://localhost:3000
```

### Production Deployment

For production, set:
```env
NODE_ENV=production
BASE_URL=https://yourdomain.com
```

---

## 🐛 Troubleshooting

### Camera not working?
- ✅ Check browser permissions
- ✅ Ensure HTTPS or localhost
- ✅ Restart browser
- ✅ Check camera is not in use elsewhere

### Can't connect?
- ✅ Verify share code is correct
- ✅ Check internet connection
- ✅ Ensure owner is online
- ✅ Check firewall settings

### Audio issues?
- Currently audio is disabled to reduce overhead
- Can be enabled by modifying constraints in `app.js`

---

## 📊 Performance

- **Video Bitrate:** Adaptive (100kbps - 2.5Mbps)
- **Resolution:** Up to 1280×720
- **Latency:** 100-500ms (depends on network)
- **Connection:** WebRTC P2P (direct)

---

## 🚀 Deployment

### Deploy to Heroku

```bash
heroku login
heroku create your-app-name
git push heroku main
```

### Deploy to Vercel (Frontend Only)

```bash
vercel --prod
```

### Deploy to Railway

```bash
railway link
railway deploy
```

---

## 📈 Future Enhancements

- [ ] Screen sharing (in addition to camera)
- [ ] Recording capability
- [ ] Multiple viewers support
- [ ] Chat messages during call
- [ ] Mobile app version
- [ ] Database for session history
- [ ] User authentication
- [ ] Payment/subscription model
- [ ] Advanced analytics
- [ ] Custom branding

---

## 💡 Use Cases

🎥 **Remote Support** - Screen sharing for tech support  
🎓 **Online Teaching** - Live classroom demos  
📹 **Job Interviews** - Secure video interviews  
🏥 **Telemedicine** - Doctor-patient consultations  
🎮 **Gaming** - Stream your gameplay  
📸 **Content Creation** - Live streaming base  

---

## 📄 License

MIT License - Feel free to use, modify, and distribute!

---

## 🤝 Contributing

Want to improve CameraShare?

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📞 Support

Need help?
- 💬 Open an issue on GitHub
- 📧 Email: niteshvishwakarma7267980881@gmail.com
- 🐙 GitHub: [@niteshvishwakarma-dev](https://github.com/niteshvishwakarma-dev)

---

## 🙏 Credits

- WebRTC Technology
- Socket.IO Real-time Library
- Express.js Framework
- Modern Web Standards

---

## 📌 Changelog

### v1.0.0 (Current)
- ✨ Initial release
- 🎥 Camera sharing functionality
- 🔐 Permission-based access
- 💬 Real-time WebRTC streaming
- 📱 Mobile responsive UI

---

<div align="center">

**Made with ❤️ by [Nitesh Vishwakarma](https://github.com/niteshvishwakarma-dev)**

⭐ If you like this project, please give it a star!

</div>
