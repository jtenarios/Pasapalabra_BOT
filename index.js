//----------------------------- SISTEMA 24/7 -----------------------------//
const keepAlive = require("./server");

//---------------------------- CODIGO DEL BOT ----------------------------//

console.log("PRE - Declaraciones");

// Lista de palabras
const wordList = require("./palabrasv2.json");
// Token del bot
const mySecretToken = process.env["TOKEN"];
// ID del canal, "@replit/database"
const mySecretChatId = process.env["PASAPALABRA_CHAT_ID"];

// Creo que es para importar las librerias de discord
const { Client, Intents } = require("discord.js");

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// Iniciar primmer elemento del array
let ind = 0;
let indPista = 0;
let sizeList = 0;
let idxRandom = 0;
//let lastWord;

//console.log("lastWord: " + lastWord);
//console.log(wordList.palabras[0]);

console.log("POST - Declaraciones");

// Cuando esté el cliente operativo realiza estas acciones
client.on("ready", async function() {
  initBot();
});

client.on("message", (message) => {

  //console.log("event messageCreate()");
  //lastWord = getLastWord();
  //console.log('lastWord', lastWord);


  if (message.content === "!pista") {
    indPista = indPista + 1;
    message.channel.send(getHint(wordList.palabras[ind], indPista));
  } else if (message.content === "!saltar") {
    ind = ind + 1;
    nextWord(ind);
    indPista = 0;
  } else if (message.content === "!resolver") {
    // Mostrar texto oculto
    message.channel.send("||" + wordList.palabras[ind].respuesta + "||");
  } else if (message.content === "!reset") {
    initBot();
  } else if (message.content === "!status") {
    message.channel.send("Estoy vivo!!");
  }

  //if (ind < wordList.palabras.length) {
    if (message.content.toLowerCase() === wordList.palabras[ind].lista[idxRandom].respuesta.toLowerCase()) {

      // Reaccionar al último mensaje del chat con un thumbs up (👍)
      message.react("👍");
      ind = ind + 1;
      nextWord(ind);
      indPista = 0;
    }
  //}

});

function initBot() {
  console.log(`INICIADO COMO BOT: ${client.user.tag}`);
  console.log("PRE - initBot");

  sendAsyncMessage("***Pasapalabra***" + "\n" +
    "`!pista` para pedir una ayudita" + "\n" +
    "`!saltar` para pasar a la siguiente palabra" + "\n" +
    "`!resolver` para ver la palabra oculta" + "\n" +
    "`!reset` para reiniciar el juego" + "\n" +
    "`!status` para ver estado del bot"    
    );

  ind = 0;
  indPista = 0;

  //Iniciar el juego con indice 0
  nextWord(ind);

  console.log("POST - initBot");
}

function nextWord(idx) {

//console.log(wordList.palabras[0].lista[0].definicion);
//console.log(wordList.palabras[0].lista[0].respuesta);
//console.log("nº de palabras disponibles", wordList.palabras[0].lista.length);
//console.log("random", getRandomInt(wordList.palabras[0].lista.length));

  sizeList = wordList.palabras[idx].lista.length +1;
  idxRandom = getRandomInt(sizeList);

  /* let currentWord = wordList.palabras[idx].respuesta.toLowerCase().trim();

  console.log("currentWord: " + currentWord);
  console.log("lastWord: " + lastWord); */

  // Si se ha llegado al ultimo elemento
//  if (idx >= wordList.palabras.length) {
//    sendAsyncMessage("**Rosco completado!**");
//  } //else if (currentWord == lastWord){
    //console.log("activando Bot con la misma palabra");
  //} 
//  else {
    console.log("nextWord()");
    console.log("idx:", idx);
    console.log("idxRandom", idxRandom);
    sendAsyncMessage("Empieza por " + wordList.palabras[idx].letra + ": \n" + wordList.palabras[idx].lista[idxRandom].definicion);
//  }
}

async function sendAsyncMessage(msg) {
  console.log("pre- sendAsyncMessage()");
  const channel = await client.channels.fetch(mySecretChatId);
  await channel.send(msg);
  console.log("post- sendAsyncMessage()");
}

function getEmojiText(word2) {
  console.log("incio getEmojiText(" + word2 + ")");

  let emojiText = "";
  let character = "";
  let emojiCharacter

  console.log("word2 :" + word2.length);

  for (let i = 0; i < word2.length; i++) {
    character = word2.substring(i, i + 1).toLowerCase();
    console.log("character: " + character);

    if (character === "ñ") {
      emojiCharacter = "Ñ"
    } else if (character === "*") {
      emojiCharacter = ":blue_square:"
    } else {
      emojiCharacter = ":regional_indicator_" + character + ":"
    }

    emojiText = emojiText + emojiCharacter + " ";    
  }
  return emojiText;
}

function getHint(wordJson, idxPista) {
  console.log("getHint()");

  // idx en el indice de pistas pedidas
  if (idxPista === 1) {
    return getEmojiText(wordJson.respuesta.replace(/[a-z]/g, "*"));
  } else if (idxPista === 2) {
    return getEmojiText(wordJson.respuesta.replace(/[aeiou]/g, "*"));

  } else if (idxPista > 2) {
    return "`No hy más pistas`";
  }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

/* function getLastWord(){
  var fs = require('fs');

  fs.readFile('ultimaPalabra.txt', 'utf8', function(err, data) {
    if (err) {
      return console.log(err);
    }
    lastWord = data;
    console.log("getLastWord(): " + data);
    return data;
  });
}

function setLastWord(){
  var fs = require('fs');

  fs.writeFile("ultimaPalabra.txt", "jaimeMola", function(err) {
    if (err) {
      return console.log(err);
    }

    console.log("El archivo fue creado correctamente");
  });
} */

// Mantener el Bot activo
keepAlive();

client.login(mySecretToken);
