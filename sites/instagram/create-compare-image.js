const Jimp = require('jimp');

const img1Path = './public/post_1.jpeg';
const img2Path = './public/post_2.jpeg';

function addBorder(image, border, hexValue) {
  const height = image.getHeight();
  const width = image.getWidth();

  for (let col = 0; col < height; col += 1) {
    for (let row = 0; row < width; row += 1) {
      if (col < border) {
        image.setPixelColor(hexValue, row, col);
        image.setPixelColor(hexValue, row, height - col);
      }

      if (row < border) {
        image.setPixelColor(hexValue, row, col);
        image.setPixelColor(hexValue, width - row, col);
      }
    }
  }
}

const colors = {
  image1: '#c08e60',
  image2: '#fef5e6',
};

async function getComparedImage(image1, image2) {
  const height = image1.getHeight();
  const width = image1.getWidth();

  const border = 20;

  const hexValue1 = Jimp.cssColorToHex(colors.image1);
  addBorder(image1, border, hexValue1);

  const hexValue2 = Jimp.cssColorToHex(colors.image2);
  addBorder(image2, border, hexValue2);

  const newImage = await Jimp.create(width, height * 2);

  for (let col = 0; col < height; col += 1) {
    for (let row = 0; row < width; row += 1) {
      const pixelColor1 = image1.getPixelColor(row, col);
      newImage.setPixelColor(pixelColor1, row, col);

      const pixelColor2 = image2.getPixelColor(row, col);
      newImage.setPixelColor(pixelColor2, row, col + height);
    }
  }

  return newImage;
}

async function main() {
  const image1 = await Jimp.read(img1Path);
  const image2 = await Jimp.read(img2Path);

  const comparedImage = await getComparedImage(image1, image2);

  comparedImage.write('public/compare.jpg');
}

main();
