function getOptions(caption) {
  const options = [];
  const mapper = [
    ['cafe', 'café|cafe|coffee|latte'],
    ['postre', 'crepa|cupcake|brownie|chocolate|dessert|rebanada|pastel|panaderia|reposteria|galleta|cookie'],
    ['desayuno', 'desayuno|breakfast'],
    ['omelette', 'omelette'],
    ['poke', 'poke'],
    ['tostada', 'tostada'],
    ['sushi', 'sushi'],
    ['teriyaki', 'teriyaki'],
    ['ramen', 'ramen'],
    ['hamburguesa', 'burguer|hamburguesa'],
    ['mariscos', 'mariscos|marlin|jaiba|aguachile|camaron|camarón|atún|atun'],
    ['burro', 'burro|burrito'],
    ['tacos', 'taco|taqueria|taquería|suadero|taquero'],
    ['bebidas', 'limonada|aguas frescas|agua fresca'],
    ['smoothies', 'smoothies'],
    ['chilaquiles', 'chilaquiles'],
    ['pasta', 'pasta|lasagna'],
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
  ];

  mapper.forEach(([category, regex]) => {
    const regexExpresion = new RegExp(regex, 'i');
    if (regexExpresion.exec(caption)) {
      options.push(category);
    }
  });

  return options;
}

module.exports = {
  getOptions,
};
