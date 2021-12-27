// librerias a instalar desde la consola
// npm install jsdom
// npm install jquery

//----------------------------- Notas ------------------------------------//
// Ignoramos mayusculas y minúsculas
// Acentos y dieresis sí se tienen en cuenta
// Cuando hay más de una respuesta vienen separadas por el caracter "/"

//----------------------------- TODO List--------------------------------//
// 1. Crear comando 'goTo(letter)' por si es necesario saltar a alguna letra concreta
// 2. Tratamiento de excepciones, hacer que el juego si falla registre un log pero no se pare

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

//
const ANSI_RESET = "\u001B[0m";
const ANSI_BLACK = "\u001B[30m";
const ANSI_RED = "\u001B[31m";
const ANSI_GREEN = "\u001B[32m";
const ANSI_YELLOW = "\u001B[33m";
const ANSI_BLUE = "\u001B[34m";
const ANSI_PURPLE = "\u001B[35m";
const ANSI_CYAN = "\u001B[36m";
const ANSI_WHITE = "\u001B[37m";

// Lista de palabras
const wordList = require("./palabras.json");
// Token del bot
const mySecretToken = process.env["TOKEN"];
// ID del canal, "@replit/database"
const mySecretChatId = process.env["PASAPALABRA_CHAT_ID"];

// Importar las librerias de discord ?
const { Client, Intents } = require("discord.js");

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// Iniciar primmer elemento del array
let letterInd = "A";
let indPista = 0;

let sizeList = 0;
let idxRandom = 0;

let jsonWord;

// Cuando esté el cliente operativo realiza estas acciones
client.on("ready", async function() {
  initBot();
});

client.on("message", (message) => {

  try {

    // Convertir en lista las respuestas separadas por / y revisar cada una
    let resultList = new Array();
    resultList = jsonWord.respuesta.split("/");
    //console.log("resultList", resultList);

    if (message.content === ".help") {
      sendAsyncMessage("***Pasapalabra***" + "\n" +
        "Lista de comandos:" + "\n" +
        "`.pista` para pedir una ayudita" + "\n" +
        "`.next` para pasar a la siguiente palabra" + "\n" +
        "`.resolve` para ver la palabra oculta" + "\n" +
        "`.reset` para reiniciar el juego" + "\n" +
        "`.status` para ver estado del bot (activo/inactivo)"
      );
    } else if (message.content === ".pista") {
      indPista = indPista + 1;

      for (let i = 0; i < resultList.length; i++) {
        message.channel.send(getHint(resultList[i], indPista));
      }
    } else if (message.content === ".next") {
      nextWord();
    } else if (message.content === ".resolve") {
      // Mostrar texto oculto
      message.channel.send("||" + jsonWord.respuesta + "||");
    } else if (message.content === ".reset") {
      resetBot();
    } else if (message.content === ".status") {
      message.channel.send("Running...");
    }

    for (let i = 0; i < resultList.length; i++) {
      if (message.content.toLowerCase() === resultList[i].toLowerCase()) {

        // Reaccionar al último mensaje del chat con un thumbs up (👍)
        message.react("👍");
        nextWord();
      }
    }
  } catch (err) {
    message.channel.send("An error ocurred");
    console.log(ANSI_RED + 'Exception :' + err + ANSI_RED);
  }
}
);

function initBot() {
  console.log(`INICIADO COMO BOT: ${client.user.tag}`);

  //Iniciar el juego con la ultima palabra mostrada guardada en el fichero "palabraActual.json"
  openCurrentWord();
}

function resetBot() {
  console.log("resetBot()")

  //Iniciar el juego con la letra "A", para ello simulo que vamos por la última letra
  letterInd = "Z"
  nextWord();
}

function nextWord() {
  console.log("nextWord()")
  let jsonList;

  // Reset counter
  indPista = 0;

  nextLetterInAlphabet(letterInd);

  // Filter only by letter (A-Z)
  jsonList = $(wordList).filter(
    function(i, n) {
      return n.letra === letterInd
    }
  );
  sizeList = jsonList.length;
  idxRandom = getRandomInt(sizeList);

  // Guardar palabra actual
  saveCurrentWord(jsonList[idxRandom]);

  // "Empieza por/Contien la" + letra"
  //sendAsyncMessage(jsonList[idxRandom].titulo + " **" + jsonList[idxRandom].letra + "**: \n" + jsonList[idxRandom].definicion);
  //sendAsyncMessage(jsonWord.titulo + " **" + jsonWord.letra + "**: \n" + jsonWord.definicion);  

  // Leer palabra actual
  openCurrentWord();
}

async function sendAsyncMessage(msg) {
  //console.log("pre- sendAsyncMessage()");
  const channel = await client.channels.fetch(mySecretChatId);
  await channel.send(msg);
  //console.log("post- sendAsyncMessage()");
}

function getHint(word, idxPista) {
  console.log("getHint()", word, idxPista);

  // idx en el indice de pistas pedidas
  if (idxPista === 1) {
    // Reemplaza cualquier caracter excepto espacios (\S	non-whitespace)
    return "`" + word.toLowerCase().replace(/\S/g, "*") + "`";
  } else if (idxPista === 2) {
    return "`" + word.toLowerCase().replace(/[aeiouáéíóúäëïöü]/g, "*") + "`";

  } else if (idxPista > 2) {
    return "`No hay más pistas`";
  }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// This will return A for Z
function nextLetterInAlphabet(letter) {
  let nextLetter;

  // If letter is Z, start again with A
  if (letter == "Z") {
    sendAsyncMessage("***Empezamos de nuevo, ¡ánimo!***");
    nextLetter = "A"
  } else {

    nextLetter = String.fromCharCode(letter.charCodeAt(0) + 1);

    // Letras no contempladas en el rosco, saltar a la siguiente letra
    if (nextLetter == "Ñ" || nextLetter == "K" || nextLetter == "T" || nextLetter == "W" || nextLetter == "Y") {
      nextLetter = String.fromCharCode(nextLetter.charCodeAt(0) + 1);
    }
  }

  letterInd = nextLetter;
}

function saveCurrentWord(str) {

  var fsLibrary = require('fs')

  console.log("saveCurrentWord()", str);

  // Guardo la ultima palabra
  let data = JSON.stringify(str);

  // Write data in 'palabraActual.json' .
  fsLibrary.writeFile('./palabraActual.json', data, (error) => {

    // In case of a error throw err exception.
    if (error) throw err;
  })
}

function openCurrentWord() {
  console.log("openCurrentWord()")

  // Include fs module
  var fs = require('fs');

  // Use fs.readFile() method to read the file
  fs.readFile('./palabraActual.json', (err, data) => {
    jsonWord = JSON.parse(data);
    letterInd = jsonWord.letra;

    // "Empieza por/Contien la" + letra"
    sendAsyncMessage(jsonWord.titulo + " **" + jsonWord.letra + "**: \n" + jsonWord.definicion);

    // En caso de no haber palabra guardada, resetear bot
    if (err) {
      console.log("openCurrentWord(), err", err)
      resetBot();
    }

  })

}

// Mantener el Bot activo
keepAlive();

client.login(mySecretToken);
