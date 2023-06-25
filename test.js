// compare_emp_dept.js
// Inject HTML for figure and chart containers into the "chart-window" div
document.getElementById('chart-window').innerHTML = `
<div class="chart-container" id="container0"></div>
<div class="chart-container" id="container1"></div>
<div class="chart-container" id="container1V"></div>
<div class="highcharts-description">
<code>Gross Pay is the sum total of the Net pay and Deductions. Thus it is displayed above each of the bars/columns.<code>
</div>
</br>
    <div class="chart-container" id="container"></div>
    <div class="chart-container" id="container2"></div>
    <div class="chart-container" id="container3"></div>
    <div class="chart-container" id="container4"></div>
    <div class="chart-container" id="container5" style="height: auto;"></div>
    <div class="chart-container" id="container6"></div>
`;


// Function to generate the chart
function generateChart() {

    Highcharts.getJSON(
        "./vdata.json",
        function (dataJson) {
          let sales = [],
            engineering = [],
            HR = [],
            finance = [];
          dataJson.forEach((elm) => {
            switch (elm.sport) {
              case "sales":
                sales.push(elm.earning);
                break;
              case "engineering":
                engineering.push(elm.earning);
                break;
              case "HR":
                HR.push(elm.earning);
                break;
              case "finance":
                finance.push(elm.earning);
                break;
            }
          });
      
          //Process violin data
          let step = 1,
            precision = 0.00000000001,
            width = 3;
          let data = processViolin(
            step,
            precision,
            width,
            sales,
            engineering,
            HR,
            finance
          );
      
          //Structure the data to create the chart
          let xi = data.xiData;
          let stat = data.stat;
          let violin1 = data.results[0],
            violin2 = data.results[1],
            violin3 = data.results[2],
            violin4 = data.results[3];
      
          Highcharts.chart("container1V", {
            chart: {
              type: "areasplinerange",
              inverted: true
            },
            title: {
              text: "Violin chart salary distribution "
            },
            xAxis: {
              reversed: false,
              labels: { format: "{value} k" }
            },
      
            yAxis: {
              title: { text: null },
              categories: ["finance", "HR", "sales", "engineering"],
              startOnTick:false,
              endOnTick:false,
              gridLineWidth: 0
            },
            tooltip: {
              useHTML: true,
              valueDecimals: 3,
              formatter: function () {
                return (
                  "<b>" +
                  this.series.name +
                  "</b><table><tr><td>Max:</td><td>" +
                  stat[this.series.index][4] +
                  " k</td></tr><tr><td>Q 3:</td><td>" +
                  stat[this.series.index][3] +
                  " k </td></tr><tr><td>Median:</td><td>" +
                  stat[this.series.index][2] +
                  " k</td></tr><tr><td>Q 1:</td><td>" +
                  stat[this.series.index][1] +
                  " k</td></tr><tr><td>Min:</td><td>" +
                  stat[this.series.index][0] +
                  " k</td></tr></table>"
                );
              }
            },
            plotOptions: {
              series: {
                marker: {
                  enabled: false
                },
                states: {
                  hover: {
                    enabled: false
                  }
                },
                events: {
                  legendItemClick: function (e) {
                    e.preventDefault();
                  }
                },
                pointStart: xi[0]
              }
            },
      
            series: [
              {
                name: "sales",
                color: "#ffa8d4",
                data: violin1
              },
              {
                name: "engineering",
                color: "#a8d4ff",
                data: violin2
              },
              {
                name: "HR",
                color: "#ffa956",
                data: violin3
              },
              {
                name: "finance",
                color: "#46f15f",
                data: violin4
              }
            ]
          });
        }
      );
      
      
// density plot
// Array to hold the selectable attributes
let attributes = [
    "GrossPay",
    "NetPay",
    "Deductions",
    "TotalBenefits",
    "TaxSpending",
    "Bonus",
    "ReimbursementPaid"
  ];
  
  // Function to handle attribute selection and chart creation
  function createDensityPlot(attribute) {
    Highcharts.getJSON(
      "./data.json",
      function(dataJson) {
        redrawing = false;
  
        // Create the series data from the data source
        let dataArray = [];
        for (let i = 0; i < department.length; i++) {
          dataArray.push([]);
        }
  
        dataJson.forEach((e) => {
          department.forEach((key, value) => {
            if (e.department == key) {
              dataArray[value].push(e[attribute]);
            }
          });
        });
  
        // Process density data
        let step = 1,
          precision = 0.00000000001,
          width = 15;
  
        let data = processDensity(step, precision, width, ...dataArray);
  
        // Structure the data to create the chart
        let chartsNbr = data.results.length;
        let xi = data.xiData;
  
        // Create the series
        let dataSeries = [];
        let series = [];
        data.results.forEach((e, i) => {
          dataSeries.push([]);
          dataSeries[i] = e;
          series.push({
            data: dataSeries[i],
            name: department[i],
            zIndex: chartsNbr - i
          });
        });
  
        Highcharts.chart("container0", {
          chart: {
            type: "areasplinerange",
            animation: true,
            events: {
              render() {
                if (!redrawing) {
                  redrawing = true;
  
                  this.series.forEach((s) => {
                    s.update({
                      fillColor: {
                        linearGradient: [0, 0, this.plotWidth, 0],
                        stops: [
                          [0, Highcharts.color("yellow").setOpacity(0).get("rgba")],
                          [0.25, "#FFA500"], // orange
                          [0.5, "#FF0033"], // red
                          [0.75, "#7A378B"] // purple
                        ]
                      }
                    });
                  });
                  redrawing = false;
                }
              }
            }
          },
          title: {
            text: `Density Plot of ${attribute} Distribution`
          },
          xAxis: {
            labels: { format: "{value} k" }
          },
          yAxis: {
            title: { text: null },
            categories: department,
            max: data.results.length,
            labels: {
              formatter: function() {
                if (this.pos < chartsNbr) return this.value;
              },
              style: {
                textTransform: "capitalize",
                fontSize: "9px"
              }
            },
            startOnTick: true,
            gridLineWidth: 1,
            tickmarkPlacement: "on"
          },
          tooltip: {
            useHTML: true,
            shared: true,
            crosshairs: true,
            valueDecimals: 3,
            headerFormat: null,
            pointFormat: `<b>{series.name}</b>: {point.x} k <br/>`,
            footerFormat: null
          },
          plotOptions: {
            areasplinerange: {
              marker: {
                enabled: false
              },
              states: {
                hover: {
                  enabled: false
                }
              },
              pointStart: xi[0],
              animation: {
                duration: 0
              },
              fillColor: "",
              lineWidth: 1,
              color: "black"
            }
          },
          legend: {
            enabled: false
          },
          series: series
        });
      }
    );
  }
  
  // Function to handle attribute selection change
  function onAttributeChange() {
    const selectElement = document.getElementById("attributeSelect");
    const selectedAttribute = selectElement.value;
    createDensityPlot(selectedAttribute);
  }
  
  // Create the attribute selection dropdown
  const selectContainer = document.getElementById("attributeSelection");
  const attributeSelect = document.createElement("select");
  attributeSelect.id = "attributeSelect";
  attributeSelect.addEventListener("change", onAttributeChange);
  
  // Populate the attribute options
  attributes.forEach((attribute) => {
    const option = document.createElement("option");
    option.value = attribute;
    option.text = attribute;
    attributeSelect.appendChild(option);
  });
  
  // Append the attribute selection dropdown to the container
  selectContainer.appendChild(attributeSelect);
  
  // Initial chart creation with the first attribute as default
  const initialAttribute = attributes[0];
  createDensityPlot(initialAttribute);
  

 
//boxplot 
        Highcharts.chart('container1', {
            chart: {
                type: 'boxplot',
            },
            title: {
                text: 'Employee Earnings Box Plot',
            },
            legend: {
                enabled: false,
            },
            xAxis: {
                categories: ['Sales', 'Marketing', 'Engineering', 'HR', 'Finance', 'Customer Service'],
                title: {
                    text: 'Department',
                },
            },
            yAxis: {
                title: {
                    text: 'Earnings (USD)',
                },
            },
            tooltip: {
                formatter: function () {
                    return (
                        '<em>Department: ' +
                        this.key +
                        '</em><br/>' +
                        'Maximum: ' +
                        this.point.high +
                        '<br/>' +
                        'Upper Quartile: ' +
                        this.point.q3 +
                        '<br/>' +
                        'Median: ' +
                        this.point.median +
                        '<br/>' +
                        'Lower Quartile: ' +
                        this.point.q1 +
                        '<br/>' +
                        'Minimum: ' +
                        this.point.low
                    );
                },
            },
            series: [
                {
                    name: 'Employee Earnings',
                    data: [
                        [5000, 5500, 6000, 6500, 7000], // Sales
                        [4000, 4200, 4500, 4600, 4800], // Marketing
                        [6000, 6200, 6500, 6700, 7000], // Engineering
                        [5500, 5700, 5900, 6100, 6400], // HR
                        [5500, 5800, 6000, 6200, 6500], // Finance
                        [4000, 4100, 4300, 4500, 4700], // Customer Service
                    ],
                },
            ],
        });
 
    // Create stacked column chart
    Highcharts.chart('container', {
        chart: {
            type: 'column'
        },
        title: {
            text: 'Stacked Column',
            align: 'left'
        },
        xAxis: {
            categories: ["Human Resources", "Finance", "Marketing", "Sales", "Engineering", "Customer Service", "Research & Development"],
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Amount'
            },
            stackLabels: {
                enabled: true,
                style: {
                    fontWeight: 'bold',
                    color: ( // theme
                        Highcharts.defaultOptions.title.style &&
                        Highcharts.defaultOptions.title.style.color
                    ) || 'black',
                    textOutline: 'none'
                },
                formatter: function () {
                    return Highcharts.numberFormat(this.total / 1000, 0) + 'k';
                }
            }
        },
        legend: {
            align: 'right',

            verticalAlign: 'top',

            floating: false,
            backgroundColor:
                Highcharts.defaultOptions.legend.backgroundColor || 'white',
            borderColor: '#CCC',
            borderWidth: 1,
            shadow: false
        },
        tooltip: {
            headerFormat: '<b>{point.x}</b><br/>',
            pointFormat: '{series.name}: {point.y}<br/>Gross Pay: {point.stackTotal}'
        },
        plotOptions: {
            column: {
                stacking: 'normal',
                dataLabels: {
                    enabled: true,
                    formatter: function () {
                        return Highcharts.numberFormat(this.y / 1000, 0) + 'k';
                    },
                    style: {
                        fontColor: 'black',
                        fontSize: '10px',
                        textOutline: 'white'
                    }
                }
            }
        },
        series: [{
            name: 'Net Pay',
            data: [467487, 525390, 484200, 560300, 498765, 600238, 550440]
        }, {
            name: 'Deductions',
            data: [100000, 95000, 83000, 100000, 80000, 100000, 95000]
        }]
    });
    // create stacked bar chart
    Highcharts.chart('container2', {
        chart: {
            type: 'bar'
        },
        title: {
            text: 'Stacked Bar',
            align: 'left'
        },
        xAxis: {
            categories: ["Human Resources", "Finance", "Marketing", "Sales", "Engineering", "Customer Service", "Research & Development"],
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Amount'
            },
            stackLabels: {
                enabled: true,
                style: {
                    fontWeight: 'bold',
                    color: ( // theme
                        Highcharts.defaultOptions.title.style &&
                        Highcharts.defaultOptions.title.style.color
                    ) || 'black',
                    textOutline: 'none'
                },
                formatter: function () {
                    return Highcharts.numberFormat(this.total / 1000, 0) + 'k';
                }
            }
        },
        legend: {
            align: 'right',

            verticalAlign: 'top',

            floating: false,
            backgroundColor:
                Highcharts.defaultOptions.legend.backgroundColor || 'white',
            borderColor: '#CCC',
            borderWidth: 1,
            shadow: false
        },
        tooltip: {
            headerFormat: '<b>{point.x}</b><br/>',
            pointFormat: '{series.name}: {point.y}<br/>Gross Pay: {point.stackTotal}'
        },
        plotOptions: {
            bar: {
                stacking: 'normal',
                dataLabels: {
                    enabled: true,
                    formatter: function () {
                        return Highcharts.numberFormat(this.y / 1000, 0) + 'k';
                    },
                    style: {
                        fontColor: 'black',
                        fontSize: '10px',
                        textOutline: 'white'
                    }
                }
            }
        },
        series: [{
            name: 'Net Pay',
            data: [467487, 525390, 484200, 560300, 498765, 600238, 550440]
        }, {
            name: 'Deductions',
            data: [100000, 95000, 83000, 100000, 80000, 100000, 95000]
        }]
    });
    // Create a polar spider
    Highcharts.chart('container3', {

        chart: {
            polar: true,
            type: 'line'
        },

        accessibility: {
            description: 'A spiderweb chart compares the allocated budget against actual spending within an organization. The spider chart has six spokes. Each spoke represents one of the 6 departments within the organization: sales, marketing, development, customer support, information technology and administration. The chart is interactive, and each data point is displayed upon hovering. The chart clearly shows that 4 of the 6 departments have overspent their budget with Marketing responsible for the greatest overspend of $20,000. The allocated budget and actual spending data points for each department are as follows: Sales. Budget equals $43,000; spending equals $50,000. Marketing. Budget equals $19,000; spending equals $39,000. Development. Budget equals $60,000; spending equals $42,000. Customer support. Budget equals $35,000; spending equals $31,000. Information technology. Budget equals $17,000; spending equals $26,000. Administration. Budget equals $10,000; spending equals $14,000.'
        },

        title: {
            text: 'Spiderweb',
            align: 'left'
        },

        pane: {
            size: '80%'
        },

        xAxis: {
            categories: ["Human Resources", "Finance", "Marketing", "Sales", "Engineering", "Customer Service", "Research & Development"],
            tickmarkPlacement: 'on',
            lineWidth: 0
        },

        yAxis: {
            gridLineInterpolation: 'polygon',
            lineWidth: 0,
            min: 0
        },

        tooltip: {
            shared: true,
            pointFormat: '<span style="color:{series.color}">{series.name}: <b>${point.y:,.0f}</b><br/>'
        },

        legend: {
            align: 'right',
            verticalAlign: 'middle',
            layout: 'vertical'
        },

        series: [{
            name: 'Gross Pay',
            data: [567487, 620390, 567200, 660300, 578765, 700238, 645440],
            pointPlacement: 'on'
        }, {
            name: 'Net Pay',
            data: [467487, 525390, 484200, 560300, 498765, 600238, 550440],
            pointPlacement: 'on'
        }, {
            name: 'Deductions',
            data: [100000, 95000, 83000, 100000, 80000, 100000, 95000],
            pointPlacement: 'on'
        }],

        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    legend: {
                        align: 'center',
                        verticalAlign: 'bottom',
                        layout: 'horizontal'
                    },
                    pane: {
                        size: '70%'
                    }
                }
            }]
        }

    });
    // Create a clustered column
    Highcharts.chart('container4', {
        chart: {
            type: 'column'
        },
        title: {
            text: 'Clustered Column',
            align: 'left'
        },
        xAxis: {
            categories: ["Human Resources", "Finance", "Marketing", "Sales", "Engineering", "Customer Service", "Research & Development"],
            title: {
                text: null
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Payroll Amount (USD)',
                align: 'high'
            },
            labels: {
                overflow: 'justify'
            }
        },
        tooltip: {
            valuePrefix: '$'
        },
        plotOptions: {
            column: {
                dataLabels: {
                    enabled: true,
                    formatter: function () {
                        return Highcharts.numberFormat(this.y / 1000, 0) + 'k';
                    },
                    style: {
                        fontColor: 'black',
                        fontSize: '10px',
                        textOutline: 'white'
                    }
                }
            },
            series: {
                pointWidth: 15
            }
        },
        series: [{
            name: 'Gross Pay',
            data: [567487, 620390, 567200, 660300, 578765, 700238, 645440],
            color: '#7cb5ec'
        }, {
            name: 'Net Pay',
            data: [467487, 525390, 484200, 560300, 498765, 600238, 550440],
            color: '#90ed7d'
        }, {
            name: 'Deductions',
            data: [100000, 95000, 83000, 100000, 80000, 100000, 95000],
            color: '#f7a35c'
        }]
    });
    // Create a clustered bar
    Highcharts.chart('container5', {
        chart: {
            type: 'bar',
            height: 600
        },
        title: {
            text: 'Clustered Bar',
            align: 'left'
        },
        xAxis: {
            categories: ["Human Resources", "Finance", "Marketing", "Sales", "Engineering", "Customer Service"],
            title: {
                text: null
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Payroll Amount (USD)',
                align: 'high'
            },
            labels: {
                overflow: 'justify'
            }
        },
        tooltip: {
            valuePrefix: '$'
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: true,
                    formatter: function () {
                        return Highcharts.numberFormat(this.y / 1000, 0) + 'k';
                    },
                    style: {
                        fontColor: 'black',
                        fontSize: '10px',
                        textOutline: 'white'
                    }
                }
            },
            series: {
                pointWidth: 15
            }
        },
        series: [{
            name: 'Gross Pay',
            data: [567487, 620390, 567200, 660300, 578765, 700238],
            color: '#7cb5ec'
        }, {
            name: 'Net Pay',
            data: [467487, 525390, 484200, 560300, 498765, 600238],
            color: '#90ed7d'
        }, {
            name: 'Deductions',
            data: [100000, 95000, 83000, 100000, 80000, 100000],
            color: '#f7a35c'
        }]
    });
    // Create a polar bar chart
    Highcharts.chart('container6', {
        colors: ['#FFD700', '#C0C0C0', '#CD7F32'],
        chart: {
            type: 'column',
            inverted: true,
            polar: true
        },
        title: {
            text: 'Polar bar chart',
            align: 'left'
        },
        tooltip: {
            shared: true,
            pointFormat: '<span style="color:{series.color}">{series.name}: <b>${point.y:,.0f}</b><br/>'
        },
        pane: {
            size: '85%',
            innerSize: '20%',
            endAngle: 270
        },
        xAxis: {
            tickInterval: 1,
            labels: {
                align: 'right',
                useHTML: true,
                allowOverlap: true,
                step: 1,
                y: 3,
                style: {
                    fontSize: '13px'
                }
            },
            lineWidth: 0,
            categories: ["Human Resources", "Finance", "Marketing", "Sales", "Engineering", "Customer Service"],

        },
        yAxis: {
            crosshair: {
                enabled: true,
                color: '#333'
            },
            lineWidth: 0,
            tickInterval: 100000,
            reversedStacks: false,
            endOnTick: true,
            showLastLabel: true
        },
        plotOptions: {
            column: {
                stacking: 'normal',
                borderWidth: 0,
                pointPadding: 0,
                groupPadding: 0.15
            }
        },
        series: [{
            name: 'Deductions',
            data: [100000, 95000, 83000, 100000, 80000, 100000],
            color: '#f7a35c'
        }, {
            name: 'Net Pay',
            data: [467487, 525390, 484200, 560300, 498765, 600238],
            color: '#90ed7d'
        }]
    });

}

// Call the generateChart function to generate the chart on page load
generateChart();
