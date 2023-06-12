// format trasform & column selection & add
function type(d) {
  return {
    Country: d['Country Name'],
    MonthlyWagesUSD: parseFloat(d['Real Median Monthly Wages in USD (base 2011), PPP adjusted'])*12,
    WageGap: parseFloat(d['Female Labor Force Participation Rate, aged 15-64']),
  }
}

// Data selection
function filterData(data) {
  return data.filter(
    d => {
      return (
        d.MonthlyWagesUSD &&
        d.WageGap
      )
    }
  )
}

// prepare data
function chooseData(metric, dataClean) {
  const thisData = dataClean.sort((a, b) => b[metric] - a[metric]).filter((d, i) => i < 10)
  // 取Top 10
  return thisData
}

// setup Bar Chart
function setupCanvas(barChartData, dataClean) {
  let metric = 'MonthlyWagesUSD' //以收入多寡為預設

  function click() {
    metric = this.dataset.name
    const thisData = chooseData(metric, dataClean)
    update(thisData)
  }

  d3.selectAll('button').on('click', click)

  function update(data) {
    console.log(data)
    // update scale
    xMax = d3.max(data, d => d[metric])
    xScale_v3 = d3.scaleLinear([0, xMax], [0, chart_width])

    yScale = d3.scaleBand().domain(data.map(d => d.Country))
      .rangeRound([0, chart_height])
      .paddingInner(0.25)

    // transition settings
    const defaultDelay = 1000
    const transitionDelay = d3.transition().duration(defaultDelay)

    // updata axis
    xAxisDraw.transition(transitionDelay).call(xAxis.scale(xScale_v3))
    yAxisDraw.transition(transitionDelay).call(yAxis.scale(yScale))

    // update header
    header.select('tspan').text(`Top 10 ${metric === 'MonthlyWagesUSD' ? '人均年收入國家' : '男女薪資平等國家'} ${metric === 'MonthlyWagesUSD' ? '(美元現值)' : ''}`)

    // update bar
    bars.selectAll('.bar').data(data, d => d.Country).join(
      enter => {
        enter.append('rect').attr('class', 'bar')
          .attr('x', 0).attr('y', d => yScale(d.Country))
          .attr('height', yScale.bandwidth())
          .style('fill', 'lightcyan')
          .transition(transitionDelay)
          .delay((d, i) => i * 20)
          .attr('width', d => xScale_v3(d[metric]))
          .style('fill', 'steelblue')
      },
      update => {
        update.transition(transitionDelay)
          .delay((d, i) => i * 20)
          .attr('y', d => yScale(d.Country))
          .attr('width', d => xScale_v3(d[metric]))
      },
      exit => {
        exit.transition().duration(defaultDelay / 2)
          .style('fill-opacity', 0)
          .remove()
      }
    )

    // interactive 新增監聽
    d3.selectAll('.bar')
      .on('mouseover', mouseover)
      .on('nousemove', mousemove)
      .on('mouseout', mouseout)
  }

  const svg_width = 700
  const svg_height = 500
  const chart_margin = { top: 80, right: 80, bottom: 40, left: 80 }
  const chart_width = svg_width - (chart_margin.left + chart_margin.right)
  const chart_height = svg_height - (chart_margin.top + chart_margin.bottom)

  const this_svg = d3.select('.bar-chart-container').append('svg')
    .attr('width', svg_width).attr('height', svg_height)
    .append('g')
    .attr('transform', `translate(${chart_margin.left}, ${chart_margin.top})`)
    .attr('xFormat', '.2f')

  //scale
  const xExtent = d3.extent(barChartData, d => d.MonthlyWagesUSD)
  //V3.Short writing for v2
  let xMax = d3.max(barChartData, d => d.MonthlyWagesUSD)
  let xScale_v3 = d3.scaleLinear([0, xMax], [0, chart_width])
  //垂直空間的分配 - 平均分布給Top 10
  let yScale = d3.scaleBand().domain(barChartData.map(d => d.Country))
    .rangeRound([0, chart_height])
    .paddingInner(0.25)

  const bars = this_svg.append('g').attr('class', 'bars')

  // Draw header
  let header = this_svg.append('g').attr('class', 'bar-header')
    .attr('transform', `translate(0, ${-chart_margin.top / 2})`)
    .append('text')
  header.append('tspan').text('Top 10')

  //tickSizeInner: the length of the tick lines
  //tickSizeOuter: the length of the square ends of the fomain path
  let xAxis = d3.axisTop(xScale_v3)
    //.tickFormat(formatTicks)
    .tickSizeInner(-chart_height)
    .tickSizeOuter(0)
  let xAxisDraw = this_svg.append('g')
    .attr('class', 'x axis')

  let yAxis = d3.axisLeft(yScale).tickSize(0) //不畫 //.tickSize(-chart_width)
  let yAxisDraw = this_svg.append('g')
    .attr('class', 'y axis')
  yAxisDraw.selectAll('text').attr('dx', '-0.6em')
  update(barChartData)

  // interactive 互動處理
  const tip = d3.select('.tooltip')
  function mouseover(e){
    // get data
    const thisBarData = d3.select(this).data()[0]
    const bodyData = [
      ['月收入', formatTicks(thisBarData.MonthlyWagesUSD)],
      ['女/男性薪資比例', thisBarData.WageGap]
    ]

    tip.style('left', (e.clientX + 15)+'px')
        .style('top', e.clientY+'px')
        .transition()
        .style('opacity', 0.98)
    
    // html fill
    tip.select('h3').html(`${thisBarData.Country}`)
    d3.select('.tip-body').selectAll('p').data(bodyData)
      .join('p').attr('class', 'top-info')
      .html(d=>`${d[0]} : ${d[1]}`)
  }
  function mousemove(e) {
    tip.style('left', (e.clientX + 15) + 'px')
      .style('top', e.clientY + 'px')
  }
  function mouseout(e) {
    tip.transition()
      .style('opacity', 0)
  }
  
  // interactive 新增監聽
  d3.selectAll('.bar')
    .on('mouseover', mouseover)
    .on('mousemove', mousemove)
    .on('mouseout', mouseout)
}

// WageGap bar chart
function setWageGapBarChart(barChartData, dataClean) {
  const svg_width = 600
  const svg_height = 500
  const chart_margin = { top: 80, right: 40, bottom: 40, left: 120 }
  const chart_width = svg_width - (chart_margin.left + chart_margin.right)
  const chart_height = svg_height - (chart_margin.top + chart_margin.bottom)

  const this_svg = d3.select('.bar-chart-container').append('svg')
    .attr('width', svg_width).attr('height', svg_height)
    .append('g')
    .attr('transform', `translate(${chart_margin.left}, ${chart_margin.top})`)
    .attr('xFormat', '.2f')

  //scale
  const x = d3.scaleBand()
    .domain(['男性', '女性'])
    .rangeRound([0, chart_width])
    .paddingInner(0.25)
  
  const y = d3.scaleLinear()
    .domain([0, d3.max(barChartData, d => d.WageGap)])
    .range([chart_height, 0])
  

  
}

// 刻度顯示格式轉換
function formatTicks(d) {
  return d3.format('.2s')(d)
    .replace('M', 'mil')
    .replace('G', 'bil')
    .replace('T', 'tri')
}

//項目名稱太長
function cutText(string) {
  return string.length < 35 ? string : string.substring(0, 35) + "..."
}

// Main
function ready(data) {
  const dataClean = filterData(data)
  console.log(dataClean)
  // get Top 10 wage country
  const wageData = chooseData("MonthlyWagesUSD", dataClean)

  setupCanvas(wageData, dataClean)
}

// Load Data
d3.csv("../../data/World_Bank_labol_force_data.csv", type).then(
  res => {
    console.log(res)
    ready(res)
  }
)