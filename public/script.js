const socket =  io('/')

const videoGrid = document.getElementById('video-grid')

const myPeer = new Peer()
const cache = {}
const myVideo = document.createElement('video')
myVideo.muted = true
const streamId = new Set()
navigator.mediaDevices.getUserMedia({
    video:true,
    audio: true
}).then( stream => {
  addVideoStream(myVideo, stream)
  myPeer.on('call', call => {
      call.answer(stream)
      const video = document.createElement('video')
      call.on('stream', userStream => {
           addVideoStream(video, userStream)
      })
  })

  socket.on('user-connected', userId => {
      console.log(userId + '进来')
      connectToNewUser(userId, stream)
  })
})

socket.on('user-disconnected', userId => {
     if ( cache[userId]) {
        cache[userId].close(userId)
     } else {
         
     }
     if (videoGrid.hasChildNodes(myVideo)) {
         videoGrid.removeChild(myVideo)
     }
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id) 
})

function addVideoStream(video , stream) {
    if (streamId.has(stream.id)) {
        return
    }
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.appendChild(video)
    streamId.add(stream.id)
}

function connectToNewUser(userId, stream) {
    console.log(userId)
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userStream => {
        addVideoStream(video, userStream)
    })
    call.on('close', (userId) => {
        videoGrid.removeChild(video)
    })
    cache[userId] = call
}

