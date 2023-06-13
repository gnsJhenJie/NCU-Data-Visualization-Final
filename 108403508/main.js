// format trasform & column selection & add
function type(d) {
  return {
    Country: d['Country Name'],
    Wage: parseFloat(d['Real Median Monthly Wages in USD (base 2011), PPP adjusted'])*12,
    AgricultureWage: parseFloat(d['Median Earnings for wage workers per month in agriculture, local nominal currenc']) * 12 * parseFloat(d['Real Median Monthly Wages in USD (base 2011), PPP adjusted']) / parseFloat(d['Median Earnings for wage workers per month, local nominal currency']),
    IndustryWage: parseFloat(d['Median Earnings for wage workers per month in industry, local nominal currency']) * 12 * parseFloat(d['Real Median Monthly Wages in USD (base 2011), PPP adjusted']) / parseFloat(d['Median Earnings for wage workers per month, local nominal currency']),
    ServiceWage: parseFloat(d['Median Earnings for wage workers per month in service, local nominal currency']) * 12 * parseFloat(d['Real Median Monthly Wages in USD (base 2011), PPP adjusted']) / parseFloat(d['Median Earnings for wage workers per month, local nominal currency']),
    WorkingHours: parseFloat(d['Average weekly working hours']),
    ExcessiveWorkingRatio: parseFloat(d['Excessive working hours,>48 hours per week']),
    WageGap: parseFloat(d['Female Labor Force Participation Rate, aged 15-64']),
    //PubTOPriWageGap: parseFloat(d['Public to Private wage gap, calculated with median wages']), //資料太少
  }
}

// Data selection
function filterData(data) {
  return data.filter(
    d => {
      return (
        d.Wage && d.AgricultureWage && d.IndustryWage && d.ServiceWage &&
        d.WorkingHours && d.ExcessiveWorkingRatio &&
        d.WageGap
      )
    }
  )
}

// prepare data
function chooseData(metric, dataClean) {
  const thisData = dataClean.sort((a, b) => b[metric] - a[metric]).filter((d, i) => i < 11 && i > 0)
  // 取Top 10 // 第一名原本是Suriname，但太極端，所以不要
  return thisData
}

// setup Bar Chart
function setupCanvas(barChartData, dataClean) {
  let metric = 'Wage' //以收入多寡為預設
  let type = 'Wage' //以收入多寡為預設

  function click() {
    metric = this.id
    type = this.dataset.name
    const thisData = chooseData(metric, dataClean)
    update(thisData)
  }
  
  d3.selectAll('button').on('click', click)

  function update(data) {
    console.log(data)
    
    // update button
    setButton(type)
    d3.selectAll('button').on('click', click)
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
    if(type === 'Wage') {
      header.select('tspan').text(`Top 10 人均年收入國家(美元現值)`)
      if(metric === 'AgricultureWage') {
        header.select('tspan').text(`Top 10 農業 人均年收入國家(美元現值)`)
      }else if(metric === 'IndustryWage') {
        header.select('tspan').text(`Top 10 工業 人均年收入國家(美元現值)`)
      }else if(metric === 'ServiceWage') {
        header.select('tspan').text(`Top 10 服務業 人均年收入國家(美元現值)`)
      }
    } else if(type === 'WorkingHours') {
      header.select('tspan').text(`Top 10 平均每週工時國家(小時)`)
      if(metric === 'ExcessiveWorkingRatio') {
        header.select('tspan').text(`Top 10 工作超時比例國家(%)`)
      }
    } else{
      header.select('tspan').text(`Top 10 女/男性工資比例國家(%)`)

    }
   
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
  const xExtent = d3.extent(barChartData, d => d.Wage)
  //V3.Short writing for v2
  let xMax = d3.max(barChartData, d => d.Wage)
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
    .tickFormat(formatTicks)
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
      ['年收入', 'US$'+formatTicks(thisBarData.Wage)],
      ['農業收入', 'US$' + formatTicks(thisBarData.AgricultureWage)],
      ['工業收入', 'US$'+formatTicks(thisBarData.IndustryWage)],
      ['服務業收入', 'US$'+formatTicks(thisBarData.ServiceWage)],
      ['每週工時', formatTicks(thisBarData.WorkingHours) + '小時'],
      ['工作超時比例', formatTicks(thisBarData.ExcessiveWorkingRatio)],
      ['女/男性薪資比例', formatTicks(thisBarData.WageGap)]
    ]

    tip.style('left', (e.clientX + 15)+'px')
        .style('top', e.clientY+'px')
        .transition()
        .style('opacity', 0.98)
    
    // html fill
    tip.select('h2').html(`${thisBarData.Country}`)
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
let btns_div = document.querySelector('.types')
// set type bytton
function setButton(metric) {
  btns_div.childNodes.forEach(e => e.remove())
  btns_div.childNodes.forEach(e => e.remove())
  if(metric === 'Wage'){
    let btn1 = document.createElement('button')
    btn1.setAttribute('data-name', 'Wage')
    btn1.setAttribute('id', 'AgricultureWage')
    let btn2 = document.createElement('button')
    btn2.setAttribute('data-name', 'Wage')
    btn2.setAttribute('id', 'IndustryWage')
    let btn3 = document.createElement('button')
    btn3.setAttribute('data-name', 'Wage')
    btn3.setAttribute('id', 'ServiceWage')
    btn1.innerText = '農業'
    btn2.innerText = '工業'
    btn3.innerText = '服務業'
    btns_div.appendChild(btn1)
    btns_div.appendChild(btn2)
    btns_div.appendChild(btn3)
  }else if(metric === 'WorkingHours'){
    let btn1 = document.createElement('button')
    btn1.setAttribute('data-name', 'WorkingHours')
    btn1.setAttribute('id', 'ExcessiveWorkingRatio')
    btn1.innerText = '超時工作比例'
    btns_div.appendChild(btn1)
  }
}

// 刻度顯示格式轉換
function formatTicks(d) {
  if(d === 0){
    return d
  }else if(d < 1){
    return d3.format('.0%')(d)
  }else{
    return d3.format('.2s')(d)
      .replace('M', 'mil')
      .replace('G', 'bil')
      .replace('T', 'tri')
  }
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
  const wageData = chooseData("Wage", dataClean)

  setupCanvas(wageData, dataClean)
}

// Load Data
d3.csv("../../data/World_Bank_labol_force_data.csv", type).then(
  res => {
    console.log(res)
    ready(res)
  }
)