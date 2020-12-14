const socket  = io('/')
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

// peer connection
var peer = new Peer(undefined, {
    host : '/',
    // port : '3031'
    port : '443'
}); 

let myVideoStream;
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on('call', call => {
        call.answer(stream); // Answer the call with an A/V stream.
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video,userVideoStream)
        });
    });

    //when someone else connects
    socket.on('user-connected',userId => {
        // connectToNewUser(userId,stream);
        setTimeout(() => {
            // user joined
            connectToNewUser(userId, stream)
          }, 3000)
    })

    //chats
    let text = $('input')

    $('html').keydown((e) => {
        if(e.which == 13 && text.val().length !== 0){
            console.log(text.val())
            socket.emit('message', text.val());
            text.val('')
        }
    })


    socket.on('createMessage',message => {
        console.log('from server',message)
        $('.messages').append(`<li class="message"><b>user</b><br/>${message}</li>`)
        scrollBottom()
    })
})


//when i open this connection , i get the id
peer.on('open',id => {
    socket.emit('join-room',ROOM_ID, id) // here we listen to that id
})


//here we send the user our video stream
const connectToNewUser = (userId,stream) => {
    const call = peer.call(userId,stream) // we call userid and send our stream
    const video = document.createElement('video')
    call.on('stream',userVideoStream => {
        addVideoStream(video,userVideoStream) //add their video stream 
    })
}

const addVideoStream = (video,stream) =>{
    video.srcObject = stream;
    video.addEventListener('loadedmetadata',() =>{
        video.play();
    })
    videoGrid.append(video);
}


const scrollBottom = () =>{
    var d = $('.main__chat_window');
    d.scrollTop(d.prop("scrollHeight"));
}

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if(enabled){
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    }
    else{
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const setMuteButton = () =>{
    const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () =>{
    const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const playStop = () =>{
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if(enabled){
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo()
    }
    else{
        setStopVideo()
        myVideoStream.getVideoTracks()[0].enabled = true;

    }
}


const setStopVideo = () =>{
    const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () =>{
    const html = `
    <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}



