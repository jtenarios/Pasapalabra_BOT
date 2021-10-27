// librerias a instalar desde la consola
// npm install jsdom
// npm install jquery

//----------------------------- Notas ------------------------------------//
// Ignoramos mayusculas y minúsculas
// Ignoramos acentos y dieresis
// Cuando hay más de una respuesta vienen separadas por el caracter "/"

//----------------------------- TODO Liist--------------------------------//
//No muestra la lista de las palabras con Ñ
//Palabras con más de una posible respuesta ej. ABASTECER/ABASTECERSE
//El bot se reinicia cada x horas

//----------------------------- SISTEMA 24/7 -----------------------------//
const keepAlive = require("./server");

//----------------------------- Usar librerias jQuery --------------------//
var jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;

var $ = jQuery = require('jquery')(window);

//---------------------------- CODIGO DEL BOT ----------------------------//

// Lista de palabras
const wordList = require("./palabras.json");
// Token del bot
const mySecretToken = process.env["TOKEN"];
// ID del canal, "@replit/database"
const mySecretChatId = process.env["PASAPALABRA_CHAT_ID"];

// Creo que es para importar las librerias de discord
const { Client, Intents } = require("discord.js");

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// Iniciar primmer elemento del array
let letterInd = "A";
let indPista = 0;

let jsonList;
let sizeList = 0;
let idxRandom = 0;

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
    message.channel.send(getHint(jsonList[idxRandom].respuesta, indPista));
  } else if (message.content === "!skip") {
    //ind = ind + 1;
    letterInd = nextLetterInAlphabet(letterInd);
    nextWord(ind);
    indPista = 0;
  } else if (message.content === "!resolve") {
    // Mostrar texto oculto
    message.channel.send("||" + jsonList[idxRandom].respuesta + "||");
  } else if (message.content === "!reset") {
    initBot();
  } else if (message.content === "!status") {
    message.channel.send("Running...");
  }

  if (message.content.toLowerCase() === jsonList[idxRandom].respuesta.toLowerCase()) {

    // Reaccionar al último mensaje del chat con un thumbs up (👍)
    message.react("👍");
    letterInd = nextLetterInAlphabet(letterInd);
    nextWord(letterInd);
    indPista = 0;
  }

});

function initBot() {
  console.log(`INICIADO COMO BOT: ${client.user.tag}`);

  sendAsyncMessage("***Pasapalabra***" + "\n" +
    "Lista de comandos:" + "\n" +
    "`!pista` para pedir una ayudita" + "\n" +
    "`!skip` para pasar a la siguiente palabra" + "\n" +
    "`!resolve` para ver la palabra oculta" + "\n" +
    "`!reset` para reiniciar el juego" + "\n" +
    "`!status` para ver estado del bot"
  );

  //Iniciar el juego con letra A
  nextWord(letterInd);
}

function nextWord(letter) {

  // Filter only by letter (A-Z)
  jsonList = $(wordList).filter(
    function(i, n) {
      return n.letra === letter
    }
  );
  sizeList = jsonList.length;
  idxRandom = getRandomInt(sizeList);

  //console.log("nextWord --> sizeList", sizeList);
  //console.log("nextWord --> idxRandom", idxRandom);
  //console.log("nextWord --> lista[" + letter + "]:", jsonList);

  sendAsyncMessage("Empieza por " + jsonList[idxRandom].letra + ": \n" + jsonList[idxRandom].definicion);
}

async function sendAsyncMessage(msg) {
  //console.log("pre- sendAsyncMessage()");
  const channel = await client.channels.fetch(mySecretChatId);
  await channel.send(msg);
  //console.log("post- sendAsyncMessage()");
}

/* function getEmojiText(word2) {
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
} */

function getHint(word, idxPista) {
  console.log("getHint()", word, idxPista);

  // idx en el indice de pistas pedidas
  if (idxPista === 1) {
    return "`" + word.toLowerCase().replace(/[a-z]/g, "*") + "`";
  } else if (idxPista === 2) {
    return "`" + word.toLowerCase().replace(/[aeiouáéíóúäëïöü]/g, "*") + "`";

  } else if (idxPista > 2) {
    return "`No hy más pistas`";
  }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// This will return A for Z
function nextLetterInAlphabet(letter) {
  // If letter is Z, start again with A
  if (letter == "Z") {
    sendAsyncMessage("***Rosco completado, enhorabuena***" + "\n" + "empezamos de nuevo, ¡ánimo!")
    return "A";
  } else {
    console.log(String.fromCharCode(letter.charCodeAt(0) + 1));
    return String.fromCharCode(letter.charCodeAt(0) + 1);
  }
}

// Mantener el Bot activo
keepAlive();

client.login(mySecretToken);
