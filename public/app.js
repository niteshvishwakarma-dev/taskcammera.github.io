// API Base URL
const API_BASE = window.location.origin;
const socket = io();

// State Management
let appState = {
  role: null, // 'share' or 'view'
  sessionId: null,
  shareCode: null,
  shareLink: null,
  stream: null,
  peerConnection: null,
  viewers: [],
  userId: localStorage.getItem('userId') || generateUserId()
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  localStorage.setItem('userId', appState.userId);
});

// Event Listeners Setup
function setupEventListeners() {
  // Role Selection
  document.getElementById('shareBtn').addEventListener('click', selectRole('share'));
  document.getElementById('viewBtn').addEventListener('click', selectRole('view'));

  // Share Section
  document.getElementById('startSharingBtn').addEventListener('click', startSharing);
  document.getElementById('stopSharingBtn').addEventListener('click', stopSharing);
  document.getElementById('copyLinkBtn').addEventListener('click', copyShareLink);

  // View Section
  document.getElementById('connectBtn').addEventListener('click', connectToCamera);
  document.getElementById('disconnectBtn').addEventListener('click', disconnectCamera);
}

// Role Selection
function selectRole(role) {
  return async () => {
    appState.role = role;
    
    if (role === 'share') {
      showSection('shareSection');
      await generateShareLink();
      setupOwnerSocket();
    } else {
      showSection('viewSection');
    }
  };
}

// Utility Functions
function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');
}

function goBack() {
  showSection('roleSection');
  // Stop sharing if active
  if (appState.stream) {
    stopSharing();
  }
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function generateUserId() {
  return 'user_' + Math.random().toString(36).substr(2, 9);
}

function generateShareLink() {
  return fetch(`${API_BASE}/api/generate-link`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: appState.userId })
  })
  .then(res => res.json())
  .then(data => {
    appState.sessionId = data.sessionId;
    appState.shareCode = data.shareCode;
    appState.shareLink = data.shareUrl;
    document.getElementById('shareLink').value = appState.shareLink;
    showToast('Share link generated successfully!', 'success');
  })
  .catch(err => {
    console.error('Error generating link:', err);
    showToast('Failed to generate link', 'error');
  });
}

function copyShareLink() {
  const link = document.getElementById('shareLink').value;
  navigator.clipboard.writeText(link).then(() => {
    showToast('Link copied to clipboard! 📋', 'success');
  });
}

// WebRTC Setup
function setupWebRTC() {
  return new RTCPeerConnection({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  });
}

// Sharing Camera
async function startSharing() {
  try {
    // Request camera permission
    appState.stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false
    });

    const video = document.getElementById('ownerVideo');
    video.srcObject = appState.stream;
    
    document.getElementById('startSharingBtn').disabled = true;
    document.getElementById('stopSharingBtn').disabled = false;
    document.getElementById('previewStatus').textContent = '🟢 Sharing Active';
    document.getElementById('previewStatus').style.backgroundColor = '#28a745';

    // Setup WebRTC
    appState.peerConnection = setupWebRTC();
    
    // Add video tracks to peer connection
    appState.stream.getTracks().forEach(track => {
      appState.peerConnection.addTrack(track, appState.stream);
    });

    // Setup ICE candidates
    appState.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('send-ice-candidate', {
          sessionId: appState.sessionId,
          candidate: event.candidate
        });
      }
    };

    // Socket: owner join
    socket.emit('owner-join', { sessionId: appState.sessionId });

    showToast('Camera sharing started! 🎥', 'success');
  } catch (error) {
    console.error('Error accessing camera:', error);
    showToast('Camera access denied. Please check permissions.', 'error');
  }
}

function stopSharing() {
  if (appState.stream) {
    appState.stream.getTracks().forEach(track => track.stop());
    appState.stream = null;
  }

  if (appState.peerConnection) {
    appState.peerConnection.close();
    appState.peerConnection = null;
  }

  document.getElementById('ownerVideo').srcObject = null;
  document.getElementById('startSharingBtn').disabled = false;
  document.getElementById('stopSharingBtn').disabled = true;
  document.getElementById('previewStatus').textContent = '⚫ Sharing Stopped';
  document.getElementById('previewStatus').style.backgroundColor = '#dc3545';

  showToast('Camera sharing stopped', 'success');
}

// Socket Events for Owner
function setupOwnerSocket() {
  socket.on('permission-request', (data) => {
    const { requestId, viewerId } = data;
    displayPermissionRequest(requestId, viewerId);
  });
}

function displayPermissionRequest(requestId, viewerId) {
  const list = document.getElementById('permissionRequests');
  if (list.querySelector('.empty-state')) {
    list.innerHTML = '';
  }

  const item = document.createElement('div');
  item.className = 'request-item';
  item.innerHTML = `
    <div class="request-info">
      <p><strong>Viewer ID:</strong> ${viewerId.substring(0, 8)}...</p>
      <p><small>Requesting access to your camera</small></p>
    </div>
    <div class="request-actions">
      <button class="btn btn-primary" onclick="respondToRequest('${requestId}', true)" style="padding: 6px 12px;">Allow</button>
      <button class="btn btn-danger" onclick="respondToRequest('${requestId}', false)" style="padding: 6px 12px;">Deny</button>
    </div>
  `;
  list.appendChild(item);
}

function respondToRequest(requestId, approved) {
  fetch(`${API_BASE}/api/respond-permission`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestId, approved })
  })
  .then(res => res.json())
  .then(() => {
    if (approved) {
      showToast('Permission approved ✅', 'success');
    } else {
      showToast('Permission denied', 'success');
    }
  });
}

// Viewing Camera
async function connectToCamera() {
  const input = document.getElementById('shareCodeInput').value.trim();
  if (!input) {
    showToast('Please enter a share code or link', 'error');
    return;
  }

  // Extract share code from link or use directly
  let shareCode = input;
  if (input.includes('/')) {
    shareCode = input.split('/').pop();
  }

  try {
    const response = await fetch(`${API_BASE}/api/session/${shareCode}`);
    if (!response.ok) {
      throw new Error('Invalid share code');
    }

    const data = await response.json();
    appState.sessionId = data.sessionId;
    appState.shareCode = shareCode;

    // Request permission
    await requestPermission();
    
    // Show viewer state
    document.getElementById('viewerState').classList.add('active');
    document.getElementById('connectionStatus').textContent = 'Permission request sent... Waiting for approval';

    // Setup socket
    socket.emit('viewer-join', {
      sessionId: appState.sessionId,
      viewerId: appState.userId
    });

  } catch (error) {
    console.error('Error connecting:', error);
    showToast('Failed to connect. Invalid share code.', 'error');
  }
}

function requestPermission() {
  return fetch(`${API_BASE}/api/request-permission`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: appState.sessionId,
      viewerId: appState.userId
    })
  })
  .then(res => res.json())
  .then(data => {
    console.log('Permission request sent:', data);
  });
}

function disconnectCamera() {
  document.getElementById('viewerVideo').srcObject = null;
  document.getElementById('viewerState').classList.remove('active');
  document.getElementById('shareCodeInput').value = '';
  
  if (appState.peerConnection) {
    appState.peerConnection.close();
    appState.peerConnection = null;
  }

  showToast('Disconnected from camera', 'success');
}

// Socket Events for Viewer
socket.on('permission-response', (data) => {
  const { approved, sessionId } = data;
  
  if (approved) {
    showToast('✅ Permission approved! Connecting to camera...', 'success');
    document.getElementById('connectionStatus').textContent = 'Connected! Receiving video stream...';
    setupViewerWebRTC();
  } else {
    showToast('❌ Permission denied by camera owner', 'error');
    document.getElementById('connectionStatus').textContent = 'Permission denied';
  }
});

async function setupViewerWebRTC() {
  appState.peerConnection = setupWebRTC();
  const videoElement = document.getElementById('viewerVideo');

  // Handle remote stream
  appState.peerConnection.ontrack = (event) => {
    videoElement.srcObject = event.streams[0];
  };

  // Create offer
  const offer = await appState.peerConnection.createOffer();
  await appState.peerConnection.setLocalDescription(offer);

  socket.emit('send-offer', {
    sessionId: appState.sessionId,
    offer: offer
  });

  // Handle ICE candidates
  appState.peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('send-ice-candidate', {
        sessionId: appState.sessionId,
        candidate: event.candidate
      });
    }
  };
}

// Socket: Receive answer
socket.on('receive-answer', (data) => {
  const { answer } = data;
  appState.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

// Socket: Receive ICE candidate
socket.on('receive-ice-candidate', (data) => {
  const { candidate } = data;
  appState.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
});

// Socket: Receive offer (for owner)
socket.on('receive-offer', async (data) => {
  const { offer } = data;
  appState.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  
  const answer = await appState.peerConnection.createAnswer();
  await appState.peerConnection.setLocalDescription(answer);

  socket.emit('send-answer', {
    sessionId: appState.sessionId,
    answer: answer
  });
});
