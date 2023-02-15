import { Component, OnInit } from '@angular/core';
import * as echarts from 'echarts';
import { DataServiceService } from '../data-service.service';
import * as moment from 'moment';


@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {

  disabled = false;
  max: any = 930;
  min = 555;
  showTicks = false;
  step = 1;
  thumbLabel = false;
  value: any = 0;
  time = '00:00'
  constructor(private api: DataServiceService) { }
  public src = []
  response
  x_axis: any = []
  Weekly_PE: any = []
  Weekly_CE: any = []
  daily_CE: any = []
  daily_PE: any = []
  chart_data: any = {}
  time_stamp
  ngOnInit(): void {

    let data: any = localStorage.getItem('chart')
    try {
      this.chart_data = JSON.parse(data) || {}
    } catch { }

    this.api.get_data().subscribe((r: any) => {
      this.value = this.getMinutesFromTime(moment(r.records.timestamp).format('HH:mm'))
      this.data_format(r)
    })




    setInterval(() => {
      var current_time: any = new Date();
      current_time = current_time.toLocaleTimeString();
      if (current_time > "23:00:00" && current_time < "23:59:00") {
        localStorage.removeItem('chart')
      }
      if (current_time > "09:15:00" && current_time < "15:30:00") {
        this.api.get_data().subscribe((r: any) => {
          this.value = this.getMinutesFromTime(moment(r.records.timestamp).format('HH:mm'))
          this.data_format(r)
        })
      }
    }, 60000)
  }

  data_format(r) {
    // this.api.get_data().subscribe( (r:any) => {
    this.response = r

    let current_strike = r.records.strikePrices[0];
    let difference = Math.abs(r.records.strikePrices[0] - r.records.underlyingValue);

    for (let i = 1; i < r.records.strikePrices.length; i++) {
      let newDifference = Math.abs(r.records.strikePrices[i] - r.records.underlyingValue);
      if (newDifference < difference) {
        current_strike = r.records.strikePrices[i];
        difference = newDifference;
      }
    }

    this.x_axis = []
    this.x_axis.push(current_strike)
    for (let a = 1; a < 10; a++) {
      this.x_axis.push(current_strike - (a * 50))
      this.x_axis.push(current_strike + (a * 50))
    }
    this.x_axis.sort()


    this.Weekly_CE = []
    this.Weekly_PE = []
    this.daily_CE = []
    this.daily_PE = []
    r.filtered.data.forEach(price => {
      if (this.x_axis.includes(price.strikePrice)) {
        this.Weekly_PE.push(price.PE.openInterest * 50)
        this.Weekly_CE.push(price.CE.openInterest * 50)
        this.daily_CE.push((price.CE.changeinOpenInterest) * 50)
        this.daily_PE.push((price.PE.changeinOpenInterest) * 50)


      }
    });

    this.time_stamp = r.records.timestamp
    this.max = this.getMinutesFromTime(moment(r.records.timestamp).format('HH:mm'))

    this.chart_data
    [moment(this.time_stamp).format('HH:mm')] = {
      'daily_PE': this.daily_PE,
      'daily_CE': this.daily_CE,
      'Weekly_CE': this.Weekly_CE,
      'Weekly_PE': this.Weekly_PE,
      'x_axis': this.x_axis
    }

    localStorage.setItem('chart', JSON.stringify(this.chart_data))

    this.weeklyChart();
    this.dailyChart();
    // })
  }

  formatLabel(value: number | null) {
    if (!value) {
      return 0;
    }

    const hours = Math.floor(value / 60);
    const minutesRemaining = value % 60;
    return `${hours.toString().padStart(2, '0')}:${minutesRemaining.toString().padStart(2, '0')}`;
  }

  dailySliderChange(e) {
    this.time = this.getTimeFromMinutes(e.value);
    let data: any = localStorage.getItem('chart')
    try {
      data = JSON.parse(data)

    } catch { }
    if (data[this.time]) {
      this.daily_CE = data[this.time]['daily_CE']
      this.daily_PE = data[this.time]['daily_PE']
      this.x_axis = data[this.time]['x_axis']
      this.dailyChart()
    }
    else {
      this.daily_CE = [];
      this.daily_PE = [];
      this.dailyChart()
    }

  }

  getTimeFromMinutes(minutes) {
    const hours = Math.floor(minutes / 60);
    const minutesRemaining = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutesRemaining.toString().padStart(2, '0')}`;
  }

  getMinutesFromTime(time) {
    let hours = time.split(':')[0]
    let min = time.split(':')[1]
    hours = +hours * 60
    return +hours + +min
  }


  dailyChart() {
    const option = {
      color: ['#91CC75', '#EE6666'],
      legend: {
        show: false
      },
      tooltip: {},
      // dataset: {
      //   source: src
      // },
      xAxis: {
        type: 'category',
        data: this.x_axis,
        axisTick: {
          alignWithLabel: true
        }
      },
      yAxis: {},
      // Declare several bar series, each will be mapped
      // to a column of dataset.source by default.
      series: [
        { name: 'PE', data: this.daily_PE, type: 'bar', barGap: '0%' },
        { name: 'CE', data: this.daily_CE, type: 'bar', barGap: '0%' }
      ]
    };
    let dom = document.getElementById('daily')!
    let utilChart = echarts.init(dom);
    option && utilChart.setOption(option, true);

  }

  weeklyChart() {
    const option = {
      color: ['#91CC75', '#EE6666'],
      legend: {
        show: false
      },
      tooltip: {},
      // dataset: {
      //   source: src
      // },
      xAxis: {
        type: 'category',
        data: this.x_axis,
        axisTick: {
          alignWithLabel: true
        }
      },
      yAxis: {},
      // Declare several bar series, each will be mapped
      // to a column of dataset.source by default.
      series: [
        { name: 'PE', data: this.Weekly_PE, type: 'bar', barGap: '0%' },
        { name: 'CE', data: this.Weekly_CE, type: 'bar', barGap: '0%' }
      ]
    };
    let dom = document.getElementById('weekly')!
    let utilChart = echarts.init(dom);
    option && utilChart.setOption(option, true);

  }


}
