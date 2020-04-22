const optionsMapper = [
  ['cafe', 'café|cafe|coffee|latte'],
  ['postre', 'crepa|cupcake|brownie|chocolate|dessert|rebanada|pastel|panaderia|reposteria|galleta|cookie'],
  ['desayuno', 'desayuno|breakfast|yogurt|granola'],
  ['omelette', 'omelette'],
  ['poke', 'poke'],
  ['tostada', 'tostada'],
  ['sushi', 'sushi'],
  ['teriyaki', 'teriyaki'],
  ['ramen', 'ramen'],
  ['hamburguesa', 'burguer|hamburguesa|burger'],
  ['mariscos', 'mariscos|marlin|jaiba|aguachile|camaron|camarón|atún|atun'],
  ['burro', 'burro|burrito'],
  ['tacos', 'taco|taqueria|taquería|suadero|taquero'],
  ['bebidas', 'limonada|aguas frescas|agua fresca'],
  ['smoothies', 'smoothies'],
  ['chilaquiles', 'chilaquiles'],
  ['pasta', 'pasta|lasagna|fettuccine'],
  ['pizza', 'pizza'],
  ['torta', 'torta'],
  ['ensalada', 'ensalada'],
  ['vegiee', 'setas|vegan|plantbased|vegiee'],
  ['menudo', 'menudito|menudo|menuderia'],
  ['carne asada', 'carne asada'],
  ['wings', 'wings'],
  ['costillas', 'rib'],
  ['carnitas', 'carnitas'],
  ['birria', 'birria'],
  ['antojitos', 'gorditas|champurrado|elote'],
  ['salsas', 'salsas'],
  ['papas fritas', 'papas fritas'],
  ['papas fritas', 'papas fritas'],
  ['queso', 'queso'],
  ['cortes', 'filete'],
  ['pollo asado', 'pollo asado'],
];

function getOptions(caption) {
  const options = [];

  optionsMapper.forEach(([category, regex]) => {
    const regexExpresion = new RegExp(regex, 'i');
    if (regexExpresion.exec(caption)) {
      options.push(category);
    }
  });

  return options;
}

function getPhones(caption) {
  const onlyNumbers = caption.replace(/\D/g, '-').replace(/--/g, '-');
  const phones = onlyNumbers.match(/(\d{1,2}-)?(\d{3}-)?\d{3}-\d{4,7}|(\d{3}-)\d{2}-\d{2}|\d{7,10}/g);

  if (Array.isArray(phones) && phones.length) {
    return phones.map(phone => phone.replace(/\D/g, ''));
  }

  return [];
}

module.exports = {
  getOptions,
  getPhones,
};
