import { serve } from "https://deno.land/std/http/server.ts"
import { serveDir } from "https://deno.land/std/http/file_server.ts"

const sockets = new Set()

const handler = (req) => {
	if (req.headers.get("upgrade") === "websocket") {
		const { socket, response } = Deno.upgradeWebSocket(req)

		sockets.add(socket)

		socket.onopen = () => {
			const decoder = new TextDecoder()
			const data = Deno.readFileSync("message.json")
			const message = decoder.decode(data)
			socket.send(message)
		}

		socket.onmessage = (e) => {
			const encoder = new TextEncoder()
			const data = encoder.encode(e.data)
			Deno.writeFileSync("message.json", data)

			for (const s of sockets) {
				if (s !== socket) {
					s.send(e.data)
				}
			}
		}

		socket.onclose = () => {
			sockets.delete(socket)
		}

		return response
	} else {
		const wd = Deno.cwd()
		return serveDir(req, wd + req.url)
	}
}

serve(handler, { port: 8000 })