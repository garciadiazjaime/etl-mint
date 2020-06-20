const optionsMapper = [
  ['cafe', 'café|cafe|coffee|latte|ᴄᴏғғᴇᴇ|caffe'],
  ['postre', 'postre|dessert|dessert'],
  ['crepa', 'crepa'],
  ['cupcake', 'cupcake'],
  ['brownie', 'brownie'],
  ['chocolate', 'chocolat'],
  ['repostería', 'repostería|reposteria'],
  ['galleta', 'galleta|cookie'],
  ['croissant', 'croissant'],
  ['donas', 'donas'],
  ['nieve', 'nieve|thrifty'],
  ['cinnamon rolls', 'cinnamon rolls'],
  ['panaderia', 'bollería|bolleria|panaderia|torcidos|pastry'],
  ['churros', 'churro|ᴄʜᴜʀʀᴇʀɪᴀ|𝒄𝒉𝒖𝒓𝒓𝒐'],
  ['pastel', 'cake|pastel'],
  ['desayuno', 'desayuno|breakfast'],
  ['brunch', 'brunch'],
  ['yogurt', 'yogurt'],
  ['granola', 'granola'],
  ['lunch', 'lunch'],
  ['omelette', 'omelette'],
  ['poke', 'poke'],
  ['tostada', 'tostada'],
  ['sushi', 'sushi|𝐒𝐔𝐒𝐇𝐈'],
  ['teriyaki', 'teriyaki'],
  ['ramen', 'ramen'],
  ['hamburguesa', 'burguer|hamburguesa|burger|🍔'],
  ['chili', 'chili'],
  ['nuggets', 'nugget'],
  ['mariscos', 'mariscos|marlin|jaiba|camaron|camarón|atún|atun|zarandeado|seafood'],
  ['aguachile', 'aguachile|𝐀𝐠𝐮𝐚𝐜𝐡𝐢𝐥𝐞'],
  ['salmon', 'salmon|samón'],
  ['clamato', 'clamato'],
  ['burro', 'burro|burrito'],
  ['tacos', 'taco|taqueria|taquería|suadero|taquero'],
  ['smoothies', 'smoothies'],
  ['chilaquiles', 'chilaquiles'],
  ['pasta', 'pasta|lasagna|fettuccine'],
  ['pizza', 'pizza|🍕'],
  ['torta', 'torta'],
  ['sandwich', 'sandwich|sándwich'],
  ['ensalada', 'ensalada|salad'],
  ['aguacate', 'aguacate'],
  ['veggie', 'setas|vegan|plantbased|vegiee|veggie|plant-based'],
  ['menudo', 'menudito|menudo|menuderia'],
  ['carne asada', 'carne asada|carnita asada|carnitaasada|carneasada'],
  ['alitas', 'wings|alitas'],
  ['costillas', 'rib|costilla'],
  ['carnitas', 'carnitas'],
  ['birria', 'birria'],
  ['gorditas', 'gorditas'],
  ['champurrado', 'champurrado'],
  ['elote', 'elote'],
  ['salsas', 'salsas'],
  ['papas fritas', 'papas fritas|fries'],
  ['papas sazonadas', 'papas sazonadas'],
  ['chimichurri', 'chimichurri'],
  ['pupusas', 'pupusas'],
  ['hotdog', 'hotdog'],
  ['tortilla española', 'tortillaespañola|tortilla española|tortilla de patata'],
  ['cortes', 'filete|steak|cortesdecarne'],
  ['mac&cheese', 'mac&cheese|mac and chesse|mac & cheese'],
  ['pollo asado', 'pollo asado'],
  ['pulpo', 'pulpito|pulpo'],
  ['lomo de puerco', 'pollo asado'],
  ['prosciutto', 'prosciutto'],
  ['quesos', 'cheese', 'queso'],
  ['asiáticos', 'asiátic|asiatic'],
  ['paella', 'paella'],
  ['italiano', 'italian'],
  ['a la leña', 'la leña'],
  ['orgánico', 'ᴏʀɢᴀɴɪᴄ|organic'],
  ['ceviche', 'cevichito|ceviche'],
  ['pollo', 'pollito|pollo'],
  ['trufas', 'trufas|truffles'],
  ['noodles', 'noodles'],
  ['consomé', 'consomé|consome'],
  ['jugos', 'jugo'],
  ['bebidas', 'limonada|aguas frescas|agua fresca|kombuch'],
  ['bar', 'cantina|tragos|cocthelado|🍺|drinks'],
  ['coctelería', 'coctelera|coctelería|cocteleria'],
  ['pulque', 'pulquito|pulque'],
  ['mixología', 'mixología|mixologia'],
  ['mojito', 'mojito'],
  ['vinos|wine', 'vinos|wine'],
  ['sangria', 'sangria'],
  ['cerveza', 'beer|cerveza|cheve|tecate roja'],
  ['helados', 'helado|paleta'],
  ['cochinita', 'cochinita'],
  ['dulces', 'dulces'],
  ['antojitos', 'antojitos'],
  ['pozole', 'pozol'],
  ['guisos', 'guisos'],
  ['falafel', 'falafel'],
  ['tlayuda', 'tlayuda'],
  ['barbacoa', 'barbacoa'],
  ['comida mexicana', 'comida mexicana'],
  ['chile relleno', 'chile relleno'],
  ['flautas', 'flautas'],
  ['kebab', 'kebab|doners'],
  ['malteadas', 'Milkshake|malteada'],
  ['nachos', 'nachos'],
  ['pho8', 'pho8'],
  ['horchata', 'horchata'],
  ['tequila', 'tequila'],
  ['jamón serrano', 'jamón serrano'],
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
