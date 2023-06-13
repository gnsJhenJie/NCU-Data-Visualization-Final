// format trasform & column selection & add
function type(d) {
    return {
        Country: d['Country Name'],
        // MonthlyWagesUSD: parseFloat(d['Real Median Monthly Wages in USD (base 2011), PPP adjusted']) * 12,
        Wage: parseFloat(d['Real Median Monthly Wages in USD (base 2011), PPP adjusted']) * 12,
        AgricultureWage: parseFloat(d['Median Earnings for wage workers per month in agriculture, local nominal currenc']) * 12 * parseFloat(d['Real Median Monthly Wages in USD (base 2011), PPP adjusted']) / parseFloat(d['Median Earnings for wage workers per month, local nominal currency']),
        IndustryWage: parseFloat(d['Median Earnings for wage workers per month in industry, local nominal currency']) * 12 * parseFloat(d['Real Median Monthly Wages in USD (base 2011), PPP adjusted']) / parseFloat(d['Median Earnings for wage workers per month, local nominal currency']),
        ServiceWage: parseFloat(d['Median Earnings for wage workers per month in service, local nominal currency']) * 12 * parseFloat(d['Real Median Monthly Wages in USD (base 2011), PPP adjusted']) / parseFloat(d['Median Earnings for wage workers per month, local nominal currency']),
        WorkingHours: parseFloat(d['Average weekly working hours']),
        ExcessiveWorkingRatio: parseFloat(d['Excessive working hours,>48 hours per week']),
        WageGap: parseFloat(d['Female Labor Force Participation Rate, aged 15-64']),
    }
}

// Data selection
function filterData(data) {
    return data.filter(
        d => {
            return (
                // d.MonthlyWagesUSD &&
                d.Wage && d.AgricultureWage && d.IndustryWage && d.ServiceWage &&
                d.WorkingHours && d.ExcessiveWorkingRatio &&
                d.WageGap
            )
        }
    )
}

// prepare data
function chooseData(metric, dataClean) {
    const thisData = dataClean.sort((a, b) => b[metric] - a[metric]).filter((d, i) => i < 10)
        // const thisData = dataClean.sort((a, b) => b[metric] - a[metric]).filter((d, i) => i < 11 && i > 0)
        // 第一名原本是Suriname，但太極端，所以不要
    return thisData
}

// setup Bar Chart
function setupCanvas(barChartData, dataClean) {
    // let metric = 'MonthlyWagesUSD' //以收入多寡為預設
    let metric = 'Wage' //以收入多寡為預設
    let type = 'Wage' //以收入多寡為預設

    d3.select("#selection-item-0").property("checked", true);

    function click() {
        // metric = this.dataset.name
        console.log(this.id);
        // if clicked item's class contains .lineplotBtn
        if (this.classList.contains("lineplotBtn")) {
            // Remove is-active class for all .lineplotBtn buttons
            d3.selectAll(".lineplotBtn").classed("is-active", false);
            // Add is-active class for clicked button
            d3.select(this).classed("is-active", true);
            d3.selectAll(".selection-item").property("checked", false);
            d3.selectAll(".first-selection-item").property("checked", true);
        } else if (this.classList.contains("selection-item")) {
            // Remove checked for radio input
            d3.selectAll(".selection-item").each(function(d) {
                d3.select(this).property("checked", false);
            });
            // Add checked for clicked radio input
            d3.select(this).property("checked", true);
        }

        metric = this.id
        if (metric === 'WageAll') metric = 'Wage';
        if (metric === 'WorkingHours2') metric = 'WorkingHours';
        type = this.dataset.name
        const thisData = chooseData(metric, dataClean)
        update(thisData)
    }

    d3.selectAll('.selection-item').on('click', click);
    d3.selectAll('.lineplotBtn').on('click', click);

    function update(data) {
        console.log(data)

        // update button
        setButton(type)
        d3.selectAll('.sellection-item').on('click', click)

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
        // header.select('tspan').text(`Top 10 ${metric === 'MonthlyWagesUSD' ? '人均年收入國家' : '男女薪資平等國家'} ${metric === 'MonthlyWagesUSD' ? '(美元現值)' : ''}`)
        if (type === 'Wage') {
            header.select('tspan').text(`Top 10 人均年收入國家(美元現值)`)
            if (metric === 'AgricultureWage') {
                header.select('tspan').text(`Top 10 農業 人均年收入國家(美元現值)`)
            } else if (metric === 'IndustryWage') {
                header.select('tspan').text(`Top 10 工業 人均年收入國家(美元現值)`)
            } else if (metric === 'ServiceWage') {
                header.select('tspan').text(`Top 10 服務業 人均年收入國家(美元現值)`)
            }
        } else if (type === 'WorkingHours') {
            header.select('tspan').text(`Top 10 平均每週工時國家(小時)`)
            if (metric === 'ExcessiveWorkingRatio') {
                header.select('tspan').text(`Top 10 工作超時比例國家(%)`)
            }
        } else {
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

    const svg_width = 800
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

    function mouseover(e) {
        // get data
        const thisBarData = d3.select(this).data()[0]
        const bodyData = [
            // ['月收入', formatTicks(thisBarData.MonthlyWagesUSD)],
            // ['女/男性薪資比例', thisBarData.WageGap]
            ['年收入', 'US$' + formatTicks(thisBarData.Wage)],
            ['農業收入', 'US$' + formatTicks(thisBarData.AgricultureWage)],
            ['工業收入', 'US$' + formatTicks(thisBarData.IndustryWage)],
            ['服務業收入', 'US$' + formatTicks(thisBarData.ServiceWage)],
            ['每週工時', formatTicks(thisBarData.WorkingHours) + '小時'],
            ['工作超時比例', formatTicks(thisBarData.ExcessiveWorkingRatio)],
            ['女/男性薪資比例', formatTicks(thisBarData.WageGap)]
        ]

        tip.style('left', (e.clientX + 15) + 'px')
            .style('top', e.clientY + 'px')
            .transition()
            .style('opacity', 0.98)

        // html fill
        tip.select('h3').html(`${thisBarData.Country}`)
        d3.select('.tip-body').selectAll('p').data(bodyData)
            .join('p').attr('class', 'top-info')
            .html(d => `${d[0]} : ${d[1]}`)
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
// function setWageGapBarChart(barChartData, dataClean) {
//     const svg_width = 600
//     const svg_height = 500
//     const chart_margin = { top: 80, right: 40, bottom: 40, left: 120 }
//     const chart_width = svg_width - (chart_margin.left + chart_margin.right)
//     const chart_height = svg_height - (chart_margin.top + chart_margin.bottom)

//     const this_svg = d3.select('.bar-chart-container').append('svg')
//         .attr('width', svg_width).attr('height', svg_height)
//         .append('g')
//         .attr('transform', `translate(${chart_margin.left}, ${chart_margin.top})`)
//         .attr('xFormat', '.2f')

//     //scale
//     const x = d3.scaleBand()
//         .domain(['男性', '女性'])
//         .rangeRound([0, chart_width])
//         .paddingInner(0.25)

//     const y = d3.scaleLinear()
//         .domain([0, d3.max(barChartData, d => d.WageGap)])
//         .range([chart_height, 0])



// }

// let btns_div = document.querySelector('.types')
let type_selection_box = document.querySelector('#type-selection')
let selection0 = document.querySelector("#selection-item-0")
let selection1 = document.querySelector("#selection-item-1")
let selection2 = document.querySelector("#selection-item-2")
let selection3 = document.querySelector("#selection-item-3")
let label0 = document.querySelector("#selection-label-0")
let label1 = document.querySelector("#selection-label-1")
let label2 = document.querySelector("#selection-label-2")
let label3 = document.querySelector("#selection-label-3")


// set type bytton
function setButton(metric) {
    // btns_div.childNodes.forEach(e => e.remove())
    // btns_div.childNodes.forEach(e => e.remove())
    if (metric === 'Wage') {
        selection0.setAttribute('data-name', 'Wage')
        selection0.setAttribute('id', 'WageAll')
            // selection0.checked = true
        selection1.setAttribute('data-name', 'Wage')
        selection1.setAttribute('id', 'AgricultureWage')
        selection2.setAttribute('data-name', 'Wage')
        selection2.setAttribute('id', 'IndustryWage')
        selection3.setAttribute('data-name', 'Wage')
        selection3.setAttribute('id', 'ServiceWage')
        label0.innerText = '全部產業'
        label0.style.display = 'inline-flex'
        label1.innerText = '農業'
        label1.style.display = 'inline-flex'
        label2.innerText = '工業'
        label2.style.display = 'inline-flex'
        label3.innerText = '服務業'
        label3.style.display = 'inline-flex'
        type_selection_box.style.display = 'block';
    } else if (metric === 'WorkingHours') {
        selection0.setAttribute('data-name', 'WorkingHours')
        selection0.setAttribute('id', 'WorkingHours2')
            // selection0.checked = true
        selection1.setAttribute('data-name', 'WorkingHours')
        selection1.setAttribute('id', 'ExcessiveWorkingRatio')
        label0.innerText = '總工時'
        label1.innerText = '超時工作比例'
        label0.style.display = 'inline-flex'
        label1.style.display = 'inline-flex'
        label2.style.display = 'none'
        label3.style.display = 'none'
        type_selection_box.style.display = 'block';
    } else if (metric === 'WageGap') {
        type_selection_box.style.display = 'none';
    }
}


// 刻度顯示格式轉換
function formatTicks(d) {
    if (d === 0) {
        return d
    } else if (d < 1) {
        return d3.format('.0%')(d)
    } else {
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
            //按鈕註冊click事件
        btn = document.querySelectorAll('.lineplotBtn')

        // btn.forEach(element => {
        //     element.addEventListener("click", e => {
        //         console.log(element['id'])
        //             // Remove is-active class for all .lineplotBtn buttons
        //         d3.selectAll(".lineplotBtn").classed("is-active", false);
        //         // Add is-active class for clicked button
        //         d3.select(e.target).classed("is-active", true);
        //         // updateChart(data, element['id'])
        //     })
        // });
        ready(res)
    }
)