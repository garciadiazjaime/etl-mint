const debug = require('debug')('app:instagram_publish');
const { promisify } = require('util');
const { readFile, unlinkSync, createWriteStream } = require('fs');
const fetch = require('node-fetch');
const { IgApiClient } = require('instagram-private-api');

const streamPipeline = promisify(require('stream').pipeline);

const readFilePromise = promisify(readFile);

const { Post } = require('./models');
const config = require('../../config');


const ig = new IgApiClient();
const imageName = 'post.jpg';

async function restoreSession() {
  const {
    cookies,
    state,
  } = JSON.parse(Buffer.from(config.get('instagram.session'), 'base64').toString('ascii'));

  await ig.state.deserializeCookieJar(cookies);
  ig.state.deviceString = state.deviceString;
  ig.state.deviceId = state.deviceId;
  ig.state.uuid = state.uuid;
  ig.state.phoneId = state.phoneId;
  ig.state.adid = state.adid;
  ig.state.build = state.build;
}

function downloadImage(post) {
  return fetch(post.mediaUrl)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`unexpected response ${res.statusText}`);
      }

      return streamPipeline(res.body, createWriteStream(imageName));
    });
}

async function postImage(post) {
  const imageUrl = 'post.jpg';
  const file = await readFilePromise(imageUrl);
  const { caption } = post;

  await ig.publish.photo({
    file,
    caption,
  });

  // await ig.publish.story({
  //   file,
  //   caption,
  // });
}

const phrases = [
  'good food, good mood',
  'Al mal tiempo buena comida',
  'Las penas con pan son menos.',
  'Donde hay pasión, hay sazón.',
  'Sonrie, esto te va a gustar.',
  'La cocina es alquimia de amor.',
  'All you need is Love ( y comida)',
  'Barriga llena, corazón contento.',
  'Hoy me comeré la vida a mordiscos',
  'Los mejores platos son muy simples.',
  'El estómago abierto no tiene oídos.',
  'El amor puede esperar, el hambre no.',
  'Hay días que las calorías no cuentan',
  'Cocinar es hacer trozos de amor comestibles',
  'Consejo: nunca hables con el estómago vacio',
  'Si un día sientes un vacío... come es hambre.',
  'El silencio es el sonido de una buena comida.',
  'Nadie puede ser sensato con el estómago vacío.',
  'Comer es una necesidad pero cocinar es un arte.',
  'No hay amor más sincero que el amor a la cocina.',
  'Recuerda que cuando comes bien, te sientes bien.',
  'Goza inteligentemente de los placeres de la mesa.',
  'Si somos lo que comemos, entonces soy una: Delicia.',
  'Lo importante no es lo que se come, sino cómo se come.',
  'La historia de la gastronomía es la historia del mundo.',
  'Lo único que me gusta más que hablar de comida es comer.',
  'Dieta para qué si el Whatsapp dice que estoy en línea :p',
  'Que la comida sea tu alimento, y el alimento tu medicina.',
  'El secreto de ser un buen actor es el amor por la comida.',
  'Las recetas no funcionan a menos que utilices tu corazón.',
  'Que tu medicina sea tu alimento, y el alimento tu medicina.',
  'Las personas a quienes les encanta comer siempre son las mejores.',
  'Los ingredientes no son sagrados. El arte de la cocina es sagrado.',
  'La comida, para ser perfecta, debe ir acompañada de una buena compañia.',
  'Una receta no tiene alma. Es el cocinero quien debe darle alma a la receta.',
  'Comer es sensorial. Se trata de interpretar la información que tus sentidos te dan.',
  'Una comida bien preparada tienes sabores delicados que hay que retener en la boca para apreciarlos.',
  'Un cocinero se convierte en artista cuando tiene cosas que decir a través de su plato, como un pintor en un cuadro.',
];
let phrasesIndex = 5;

function getCaption(post) {
  const response = [];
  const { user } = post;

  const index = phrasesIndex % phrases.length;
  phrasesIndex += 1;
  debug(`caption:${index}`);

  response.push(phrases[index]);
  response.push(` | 📷  @${user.username}`);

  return response.filter(item => item).join('');
}

async function main() {
  const post = await Post.findOne({
    published: { $exists: 0 },
    $or: [{ source: 'tijuanamakesmehungry' }, { source: 'tijuanafood' }],
    mediaType: 'GraphImage',
  }).sort({ createdAt: -1 });

  const data = {
    mediaUrl: post.mediaUrl,
    caption: getCaption(post),
  };

  await restoreSession();
  await downloadImage(data);
  await postImage(data);

  debug(`publish:${post.id}`);

  post.published = true;
  await post.save();

  debug(`updated:${post.id}`);

  unlinkSync(imageName);

  return null;
}

if (require.main === module) {
  main();
}

module.exports = main;
