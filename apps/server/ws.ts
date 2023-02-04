import expressWs from 'express-ws';
import { Server, WebSocket, OPEN } from 'ws'
import db from './db'

function createWsRouter(router: expressWs.Router, wss: Server<WebSocket>) {
    router.ws('/chat', async function(ws, req) {
        const user_id = req.cookies.userID || 1
        const session_id = 1

        const user = await db.user.findFirst({
            where: {
                id: user_id,
            }
        })


        wss.on('connection', function connection(_ws, _req) {
            console.log('user connected')
        });


        /**
         * 1) get the userID and sessionID from cookies
         */

        /**
         * on every message sent...
         */
        ws.on('message', async function(msg) {
            /**
             * check the userID and sessionID and save the message to the database
             */
            const message = await db.message.create({
                data: {
                    userid: user_id,
                    sessionid: session_id,
                    content: msg.toString(),
                },
            });

            wss.clients.forEach((client) => {
                if (client.readyState == OPEN) {
                    client.send(JSON.stringify({ message, user }))
                }
            });
        });
    });
    return router
}

export default createWsRouter
