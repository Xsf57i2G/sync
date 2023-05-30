const socket = new WebSocket('ws://localhost:8000')
const video = document.querySelector('video')
const dialog = document.querySelector('dialog')

const state = {
	paused: video.paused,
	time: video.currentTime,
}

window.onload = () => {
	dialog.showModal()
}

video.onpause = () => {
	state.paused = true
	socket.send(JSON.stringify(state))
}

video.onplay = () => {
	state.paused = false
	socket.send(JSON.stringify(state))
}

video.onseeked = () => {
	state.time = video.currentTime
	socket.send(JSON.stringify(state))
}

socket.onmessage = (e) => {
	let message = JSON.parse(e.data)

	if (message.time !== video.currentTime) {
		video.currentTime = message.time
	}

	if (message.paused !== video.paused) {
		if (message.paused) {
			video.pause()
		} else {
			video.play()
		}
	}
}

socket.onerror = (e) => {
	console.log(e)
}