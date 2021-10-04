const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.get('/', function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});
app.listen(3000, () => console.log(`FUNCIONAMIENTO CORRECTO`));

//----------------------------- SISTEMA 24/7 -----------------------------//

//const Discord = require("discord.js");
//const client = new Discord.Client();


//client.on("ready", () => {
//   console.log(`INICIADO COMO BOT: ${client.user.tag}`); 
//});

//---------------------------- CODIGO DEL BOT ----------------------------//

// Lista de palabras
const wordList = require("./palabras.json");
// Token del bot
const mySecretToken = process.env['TOKEN'];
// ID del canal
const mySecretChatId = process.env['PASAPALABRA_CHAT_ID'];


// Creo que es para importar las librerias de discord
const { Client, Intents } = require('discord.js');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// Iniciar primmer elemento del array
let ind = 0;
let indPista = 0;

// Cuando esté el cliente operativo realiza estas acciones
client.on("ready", async function () {
  initBot();
});

// client.on("messageCreate", (message) => { --> version local node v16
// client.on("message", (message) => { --> version replit.com node v12
client.on("message", (message) => {

  //console.log("event messageCreate()");

  //  if (message.content.startsWith("/yt")) {
  //    message.channel.send("Saludos amigos de youtube! :D");
  //  } else 

  if (message.content === "!pista") {
    indPista = indPista + 1;
    message.channel.send(getHint(wordList.palabras[ind].respuesta, indPista));
  } else if (message.content === "!saltar") {
    ind = ind + 1;
    nextWord(ind);
    indPista = 0;
  } else if (message.content === "!resolver") {
    // Mostrar texto oculto
    message.channel.send("||" + wordList.palabras[ind].respuesta + "||");
  } else if (message.content === "!reset") {
    initBot();
  }

  if (ind < wordList.palabras.length) {
    if (message.content.toLowerCase() === wordList.palabras[ind].respuesta.toLowerCase()) {

      // Reaccionar al último mensaje del chat con un thumbs up (👍)
      message.react('👍');
      //console.log(message);
      ind = ind + 1;
      nextWord(ind);
      indPista = 0;
    }
    //else if (message.content.toLowerCase() !== wordList.palabras[ind].respuesta.toLowerCase() && message.author.username !== 'Bot Pasapalabra') {
    //  console.log(message);
    //  message.channel.send(":x:");
    //}
  }

});

function initBot() {
  console.log(`INICIADO COMO BOT: ${client.user.tag}`);
  sendAsyncMessage("***Pasapalabra***");
  sendAsyncMessage("`!pista` para pedir una ayudita");
  sendAsyncMessage("`!saltar` para pasar a la siguiente palabra");
  sendAsyncMessage("`!resolver` para ver la palabra oculta");
  sendAsyncMessage("`!reset` para reiniciar el juego");
  ind = 0;
  indPista = 0;

  //Iniciar el juego con indice 0
  nextWord(ind);
}

function nextWord(idx) {
  //console.log("nextWord()");
  // Si se ha llegado al ultimo elemento
  if (idx >= wordList.palabras.length) {
    sendAsyncMessage("**Rosco completado!**");
  } else {
    //sendAsyncMessage("*" + wordList.palabras[idx].titulo + "*");
    //sendAsyncMessage(wordList.palabras[idx].pista);
    sendAsyncMessage("```" + wordList.palabras[idx].titulo + "\n" + wordList.palabras[idx].pista + "```");
  }
}

async function sendAsyncMessage(msg) {
  //console.log("pre- sendAsyncMessage()");
  const channel = await client.channels.fetch(mySecretChatId);
  await channel.send(msg);
  //console.log("post- sendAsyncMessage()");
}

function getHint(word, idxPista) {
  console.log("getHint()");
  // idx en el indice de pistas pedidas
  if (idxPista === 1)
    return "`" + word.length + " caracteres" + "`";
  else if (idxPista === 2)
    return "`" + word.replace(/(a|e|i|o|u|A|E|I|O|U)/g, '*') + "`"
  else if (idxPista > 2)
    return "`No hy más pistas`"
}

function getEmojiText(word2){
  console.log('incio getEmojiText(' + word2 + ')');
  
  let emojiText = '';
  let character = '';
  let emojiCharacter

   console.log('word2 :' + word2.length);

  for (let i = 0; i < word2.length; i++) {
    character = word2.substring(i, i+1).toLowerCase();
    console.log('character: ' + character);

    if (character === 'ñ'){
      emojiCharacter = 'Ñ'
    } else{
      emojiCharacter = ':regional_indicator_' + character + ':'
    }

    emojiText = emojiText + emojiCharacter;
    console.log('emojiText: ' + emojiText);
  }

  sendAsyncMessage(emojiText);
}

client.login(mySecretToken);
