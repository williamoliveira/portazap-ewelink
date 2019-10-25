const Ewelink = require('ewelink-api');
const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios')

const httpApp = express()

httpApp.use(bodyParser.json())
httpApp.use(bodyParser.urlencoded())

const HTTP_PORT = 8082

const API_URL = 'https://xxxx-api.mandeumzap.com.br' // Api URL do MandeUmZap
const CONTACT_ID = '' // ContactId do grupo (do MandeUmZap)
const ACCESS_TOKEN = '' // Access Token do MandeUmZap

const OPEN_WORDS = ['abrir', 'open']

const EWE_EMAIL = ''; // Email da eWeLink
const EWE_PASSWORD = ''; // Senha da eWeLink
let EWE_DEVICE_ID; // DeviceId da eWeLink

const connection = new Ewelink({
    email: EWE_EMAIL,
    password: EWE_PASSWORD,
});

(async () => {
    const devices = await connection.getDevices()
    EWE_DEVICE_ID = devices.map(d => d.deviceid)[0]
})()

const sendMessage = (text) => {
    return axios.post(
        `${API_URL}/v1/messages`,
        { contactId: CONTACT_ID, text },
        { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } },
    ).catch(console.error)
}

const open = async () => {
    await connection.toggleDevice(EWE_DEVICE_ID);
    sendMessage('Aberto.')
}

// httpApp.get('/open', async (req, res) => {
//     await open()
//     res.sendStatus(200)
// })

httpApp.post('/webhook', (req, res) => {
    const event = req.body

    const eventType = event.event
    const contactId = event.data.contactId
    const text = event.data.text.toLowerCase().trim()

    if (eventType === 'message.created' && contactId === CONTACT_ID) {
        if (OPEN_WORDS.includes(text)) {
            open()
        }

        // if (text === 'victor') {
        //     sendMessage('O Victor só faz merda.')
        // }
    }

    res.sendStatus(200)
})

httpApp.listen(HTTP_PORT, function () {
    console.log('app listening on port ', HTTP_PORT)
})
