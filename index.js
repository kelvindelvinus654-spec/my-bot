const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const Groq = require("groq-sdk");

// 1. Weka API Key yako ya Groq hapa
const groq = new Groq({ apiKey: "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" });

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox',
             '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
            ],
    }
});

client.on('qr', qr => {
    console.log('SCAN QR CODE HAPA:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Bot imewaka! Inajibu Inbox tu na kwa Kiswahili.');
});

client.on('message', async msg => {
    // ACHA status na magrupu
    if (msg.from === 'status@broadcast') return;
    
    const chat = await msg.getChat();
    if (chat.isGroup) return; // Haitajibu sms za magrupu

    try {
        console.log("Ujumbe mpya toka kwa mtu binafsi:", msg.body);

        process.on('uncaughtException', (err) => {
            console.error('kuna kosa limetokea lakini bot inaendelea:', err);
        });
        process.on('unhandledRejection', (reason, promise) => {
            console.error('kuna kosa limetokea lakini bot inaendelea:',promise,'sababu:', reason);

        });

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { 
                    role: "system", 
                    content: "Wewe ni msaidizi wa binafsi mwenye akili na busara (kama Gemini). Jibu KWA UFUPI SANA (usizidi sentensi tano).mmliki wakoo (Boss wako)anaitwa kelvin,ikiwa mtu akikuuliza jina lako jibu kelvin,ikiwa mtu akikuuliza jina la boss wako jibu kelvin.pia mtu akikuuliza swali ambalo halijui jaribu kutafuta maana yake sehemu mbalimbali.kuwa mtaalamu katika majibu yako.pia mtu akiomba namba yangu ya simu jibu pole sana ntamjulisha boss wangu kelvin 0617852672 inapatikana whatsapp na kawaida wasiliana naye sasa. Jibu maswali yote kwa lugha ya Kiswahili pekee.kuwa na heshima,kuwa mtaalamu katika majibu yako.wape taharifa wateja wako kuhusu boss wako kelvin kuwa ni mtu wa heshima sana. miongozo ya majibu yako ni: 1. jibu kwa lugha ya kiswahili fasaha ,chenye staha na heshima. 2. kuwa na lugha ya kirafiki lakini ya kitaalamu (professional yet friendly) . 3. Ikiwa mtu anashida, mpe pole na msaidie kwa moyo mweupe. 4. Ikiwa mtu atauliza kuhusu mmliki, mpe sifa kelvin kama mtaalamu wa teknolojia na mwanzilishi wako. 5. Epuka majibu marefu sana ya maneno mengi, TUMIA LUGHA FUPI SANA; toa maelezo kidogo na ya kueleweka. 6. Ongeza ucheshi pale inapofaa ili mazungumzo yasiwe magumu."

                },
                { 
                    role: "user", 
                    content: msg.body 
                }
            ],
            model: "llama-3.1-8b-instant",
        });

        const reply = chatCompletion.choices[0].message.content;
        msg.reply(reply);

    } catch (error) {
        console.error("Kosa la Groq:", error.message);
        if (error.message.includes("429")) {
            console.log("Rate limit imefikiwa. Tulia kidogo.");
        }
    }
});

client.initialize();