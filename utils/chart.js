const D3Node = require('d3-node');
const debug = require('debug')('app:chart');

const { getBrowser } = require('./browser');

function getLineChart({
  data,
  selector: _selector = '#chart',
  container: _container = `
    <div id="container">
      <h2>Line Chart</h2>
      <div id="chart"></div>
    </div>
  `,
  style: _style = '',
  width: _width = 960,
  height: _height = 500,
  margin: _margin = {
    top: 10, right: 20, bottom: 20, left: 25,
  },
  lineWidth: _lineWidth = 5,
  lineColor: _lineColor = 'steelblue',
  lineColors: _lineColors = ['steelblue'],
} = {}) {
  const d3n = new D3Node({
    selector: _selector,
    svgStyles: _style,
    container: _container,
  });

  const { d3 } = d3n;

  const width = _width - _margin.left - _margin.right;
  const height = _height - _margin.top - _margin.bottom;

  const svg = d3n.createSVG(_width, _height)
    .append('g')
    .attr('transform', `translate(${_margin.left}, ${_margin.top})`);

  const g = svg.append('g');

  const xScale = d3.scaleBand()
    .domain(data[0].map(item => item.label))
    .rangeRound([0, width]);
  const xAxis = d3.axisBottom(xScale)
    .tickSize(-height)
    .tickSizeOuter(0);

  const yScale = d3.scaleLinear()
    .domain([Math.max(d3.min(data, d => d3.min(d, v => v.value) - 5, 0)), d3.max(data, d => d3.max(d, v => v.value) + 5)])
    .rangeRound([height, 0]);
  const yAxis = d3.axisLeft(yScale)
    .tickSize(-width)
    .tickSizeOuter(0);

  const lineChart = d3.line()
    .x(d => xScale(d.label) + 19)
    .y(d => yScale(d.value));

  const xAxisElement = g.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(xAxis);

  xAxisElement.selectAll('.tick line')
    .attr('opacity', '0.05');

  const yAxisElement = g.append('g').call(yAxis);

  yAxisElement.selectAll('.tick line')
    .attr('opacity', '0.05');

  g.append('g')
    .attr('fill', 'none')
    .attr('stroke-width', _lineWidth)
    .selectAll('path')
    .data(data)
    .enter()
    .append('path')
    .attr('stroke', (d, i) => (i < _lineColors.length ? _lineColors[i] : _lineColor))
    .attr('d', lineChart);

  return d3n;
}

async function captureImage(html, {
  jpeg, quality, path, viewport,
}, callback) {
  const screenShotOptions = { viewport, path, quality };
  if (jpeg) {
    screenShotOptions.type = 'jpeg';
  }

  const browser = await getBrowser();

  const page = await browser.newPage();

  page.setContent(html);

  if (viewport) {
    page.setViewport(viewport);
  }

  await page.screenshot(screenShotOptions);

  await browser.close();

  debug('>> Exported:', screenShotOptions.path);

  if (typeof callback === 'function') callback();
}

function saveImage(dest, d3n, opts = {}, callback) {
  const html = d3n.html();

  const {
    width, height, jpeg, quality,
  } = opts;
  let viewport = false;
  if (width && height) viewport = { width, height };

  const ext = jpeg ? 'jpg' : 'png';
  captureImage(html, {
    jpeg, quality, path: `${dest}.${ext}`, viewport,
  }, callback);
}


module.exports = {
  getLineChart,
  saveImage,
};
