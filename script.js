const chatBox = document.getElementById("chat-box");
const input = document.getElementById("message");

let voiceEnabled = true;

let allChats =
JSON.parse(localStorage.getItem("allChats")) || [];

let currentChatId =
localStorage.getItem("currentChatId");

// ======================
// CREATE FIRST CHAT
// ======================
if(allChats.length === 0){

    const firstChat = {
        id: Date.now().toString(),
        title: "New Chat",
        messages: []
    };

    allChats.push(firstChat);

    currentChatId = firstChat.id;

    saveChats();
}

let messages =
allChats.find(c => c.id === currentChatId)?.messages || [];

// ======================
// SAVE CHATS
// ======================
function saveChats(){

    localStorage.setItem(
        "allChats",
        JSON.stringify(allChats)
    );

    localStorage.setItem(
        "currentChatId",
        currentChatId
    );
}

// ======================
// RENDER CHAT LIST
// ======================
function renderChatList(){

    const list =
    document.getElementById("chat-list");

    if(!list) return;

    list.innerHTML = "";

    allChats.forEach(chat=>{

        const div =
        document.createElement("div");

        div.className = "chat-item";

        div.innerText = chat.title;

        div.onclick = ()=>{
            loadChat(chat.id);
        };

        list.appendChild(div);

    });

}

// ======================
// LOAD CHAT
// ======================
function loadChat(id){

    currentChatId = id;

    const chat =
    allChats.find(c=>c.id===id);

    messages = chat.messages;

    chatBox.innerHTML = "";

    messages.forEach(msg=>{

        const div =
        document.createElement("div");

        div.className = msg.type;

        div.textContent = msg.text;

        chatBox.appendChild(div);

    });

    chatBox.scrollTop =
    chatBox.scrollHeight;

    saveChats();
}

// ======================
// NEW CHAT
// ======================
function newChat(){

    const chat = {

        id: Date.now().toString(),

        title: "New Chat",

        messages: []
    };

    allChats.push(chat);

    currentChatId = chat.id;

    messages = chat.messages;

    chatBox.innerHTML = "";

    saveChats();

    renderChatList();
}

// ======================
// ADD MESSAGE
// ======================
function addMessage(text,type){

    const div =
    document.createElement("div");

    div.className = type;

    div.textContent = text;

    chatBox.appendChild(div);

    messages.push({
        text:text,
        type:type
    });

    const currentChat =
    allChats.find(
        c=>c.id===currentChatId
    );

    if(currentChat){

        currentChat.messages =
        messages;

        // Auto rename chat
        if(
            currentChat.title==="New Chat"
        ){
            currentChat.title =
            text.substring(0,25);
        }

    }

    saveChats();

    renderChatList();

    chatBox.scrollTop =
    chatBox.scrollHeight;
}

// ======================
// TYPING EFFECT
// ======================
function typeMessage(element,text){

    let i = 0;

    const interval =
    setInterval(()=>{

        element.textContent =
        text.substring(0,i);

        i++;

        chatBox.scrollTop =
        chatBox.scrollHeight;

        if(i>text.length){

            clearInterval(interval);

        }

    },10);

}

// ======================
// ADD BOT MESSAGE
// ======================
function addBotMessage(text){

    const div =
    document.createElement("div");

    div.className = "bot";

    chatBox.appendChild(div);

    typeMessage(div,text);

    messages.push({
        text:text,
        type:"bot"
    });

    const currentChat =
    allChats.find(
        c=>c.id===currentChatId
    );

    if(currentChat){

        currentChat.messages =
        messages;

    }

    saveChats();
}

// ======================
// SEND MESSAGE
// ======================
async function sendMessage(){

    const message =
    input.value.trim();

    if(!message) return;

    addMessage(message,"user");

    input.value="";

    const typing =
    document.createElement("div");

    typing.className="bot";

    typing.id="typing";

    typing.textContent="Thinking...";

    chatBox.appendChild(typing);

    try{

        const response =
        await fetch("/chat",{

            method:"POST",

            headers:{
                "Content-Type":
                "application/json"
            },

            body:JSON.stringify({
                message:message
            })

        });

        const data =
        await response.json();

        document
        .getElementById("typing")
        ?.remove();

        addBotMessage(
            data.response
        );

        if(voiceEnabled){

            speak(data.response);

        }

    }

    catch(error){

        document
        .getElementById("typing")
        ?.remove();

        addBotMessage(
            "Error connecting to server."
        );

        console.log(error);

    }

}

// ======================
// ENTER KEY
// ======================
input.addEventListener(
"keypress",
function(e){

    if(e.key==="Enter"){

        sendMessage();

    }

});

// ======================
// SPEAK
// ======================
function speak(text){

    speechSynthesis.cancel();

    const utterance =
    new SpeechSynthesisUtterance(
        text
    );

    utterance.rate = 1;

    utterance.pitch = 1;

    speechSynthesis.speak(
        utterance
    );

}

// ======================
// VOICE INPUT
// ======================
function startVoice(){

    const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

    if(!SpeechRecognition){

        alert(
            "Voice not supported"
        );

        return;
    }

    const recognition =
    new SpeechRecognition();

    recognition.lang="en-US";

    recognition.start();

    recognition.onresult =
    function(event){

        input.value =
        event.results[0][0]
        .transcript;

        sendMessage();

    };

}

// ======================
// TOGGLE VOICE
// ======================
const voiceBtn =
document.getElementById(
"voiceToggle"
);

if(voiceBtn){

    voiceBtn.onclick=()=>{

        voiceEnabled =
        !voiceEnabled;

        voiceBtn.innerText =
        voiceEnabled
        ? "🔊 Voice On"
        : "🔇 Voice Off";

    };

}

// ======================
// ON LOAD
// ======================
window.onload = ()=>{

    renderChatList();

    loadChat(currentChatId);

};