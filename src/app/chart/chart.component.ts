import { Component, OnInit } from '@angular/core';
import * as echarts from 'echarts';
import { DataServiceService } from '../data-service.service';
import * as moment from 'moment';
import { ChangeContext, LabelType, Options } from '@angular-slider/ngx-slider';


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
  step = 3;
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
  valueRange = [20, 50]
  minValue: number = 555;
  maxValue: number = 555;
  options: Options = {
    floor: 555,
    ceil: 930,
    step: 3,
    translate: (value: number, label: LabelType): string => {
      switch (label) {
        case LabelType.Low:
          let time_low:any = this.formatLabel(value)
          return time_low;
        case LabelType.High:
          let time_high:any = this.formatLabel(value)
          return time_high;
        default:
          let default_time:any = this.formatLabel(value)
          return default_time;
      }
    }
  };
  ngOnInit(): void {

    // let data: any = localStorage.getItem('chart')
    // try {
    //   this.chart_data = JSON.parse(data) || {}
    // } catch { }
    var current_time: any = moment().format('HH:mm')
    this.time_stamp = current_time
    this.api.get().subscribe(r => {
      console.log(r)
      this.chart_data = r;
      this.chart_data.map( item => {
        if(item.time == this.time_stamp > "15:30"? "15:30" : this.time_stamp){
          this.daily_CE = item.chart_data.daily_CE
          this.daily_PE = item.chart_data.daily_PE
          this.Weekly_CE = item.chart_data.Weekly_CE
          this.Weekly_PE = item.chart_data.Weekly_PE
          this.x_axis = item.chart_data.x_axis
        }
      })
      // let opts: Options = {
      //   floor: 555,
      //   ceil: this.getMinutesFromTime(this.time_stamp),
      //   step: 3,
      //   translate: (value: number, label: LabelType): string => {
      //     switch (label) {
      //       case LabelType.Low:
      //         let time_low:any = this.formatLabel(value)
      //         return time_low;
      //       case LabelType.High:
      //         let time_high:any = this.formatLabel(value)
      //         return time_high;
      //       default:
      //         let default_time:any = this.formatLabel(value)
      //         return default_time;
      //     }
      //   }
      // };
      // this.options = opts
      // this.maxValue = this.getMinutesFromTime(this.time_stamp)
      console.log(this.options)
      this.new_data()
    })

    // this.api.get_data().subscribe((r: any) => {
    //   this.value = this.getMinutesFromTime(moment(r.records.timestamp).format('HH:mm'))
    //   // this.data_format(r)
    // })

    setInterval(() => {
      var current_time: any = moment().format('HH:mm')
      this.time_stamp = current_time
      if (current_time > "09:15" && current_time < "15:31") {
        this.api.get().subscribe(r => {
          console.log(r)
          this.chart_data = r;
          this.new_data()
        })
        // this.api.get_data().subscribe((r: any) => {
        //   this.value = this.getMinutesFromTime(moment(r.records.timestamp).format('HH:mm'))
        //   // this.data_format(r)
        // })
      }
      if( current_time > "09:00" && current_time < "09:10"){
        // localStorage.removeItem("chart")
        this.chart_data = {}
      }
    }, 30000)
  }

  new_data(){
    let current_time = moment().format('HH:mm');
    this.time_stamp = current_time
    let opts: Options = {
      floor: 555,
      ceil: this.getMinutesFromTime(this.time_stamp)<555? 930: this.getMinutesFromTime(this.time_stamp),
      step: 3,
      translate: (value: number, label: LabelType): string => {
        switch (label) {
          case LabelType.Low:
            let time_low:any = this.formatLabel(value)
            return time_low;
          case LabelType.High:
            let time_high:any = this.formatLabel(value)
            return time_high;
          default:
            let default_time:any = this.formatLabel(value)
            return default_time;
        }
      }
    };
    this.options = opts
    this.maxValue = this.getMinutesFromTime(this.time_stamp)
    // this.chart_data.map( item => {
    //   if(item.time == current_time){
    //     this.Weekly_CE = item.chart_data.Weekly_CE
    //     this.Weekly_PE = item.chart_data.Weekly_PE
    //     this.daily_CE = item.chart_data.daily_CE
    //     this.daily_PE = item.chart_data.daily_PE
    //     this.x_axis = item.chart_data.x_axis
    //   }
    // })
    this.weeklyChart();
    this.dailyChart();
    // this.max = this.getMinutesFromTime(current_time)
    // this.value = this.getMinutesFromTime(current_time)
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
    // this.max = this.getMinutesFromTime(moment(r.records.timestamp).format('HH:mm'))

    this.chart_data
    [moment(this.time_stamp).format('HH:mm')] = {
      'daily_PE': this.daily_PE,
      'daily_CE': this.daily_CE,
      'Weekly_CE': this.Weekly_CE,
      'Weekly_PE': this.Weekly_PE,
      'x_axis': this.x_axis
    }

    // localStorage.setItem('chart', JSON.stringify(this.chart_data))

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
    // let data: any = JSON.parse('chart')
    // try {
    //   data = JSON.parse(data)

    // } catch { }
    // if (data[this.time]) {
    //   this.daily_CE = data[this.time]['daily_CE']
    //   this.daily_PE = data[this.time]['daily_PE']
    //   this.x_axis = data[this.time]['x_axis']
    //   this.dailyChart()
    // }
    // else {
    //   // this.daily_CE = [];
    //   // this.daily_PE = [];
    //   // this.dailyChart()
    // }
    this.chart_data.map( item => {
      if(item.time == this.time){
        this.daily_CE = item.chart_data.daily_CE
        this.daily_PE = item.chart_data.daily_PE
        this.x_axis = item.chart_data.x_axis
        this.dailyChart()
      }
    })

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
    let ret = +hours + +min
    return ret > 930? 930 : ret
  }

  onUserChangeStart(changeContext: ChangeContext): void {
    // console.log('start', changeContext)
  }

  onUserChange(changeContext: ChangeContext): void {
    console.log('change', changeContext)
    if (changeContext.value == 555){
      this.time = this.getTimeFromMinutes(changeContext.highValue);
      this.chart_data.map( item => {
        if(item.time == this.time){
          this.daily_CE = item.chart_data.daily_CE
          this.daily_PE = item.chart_data.daily_PE
          this.x_axis = item.chart_data.x_axis
          this.dailyChart()
        }
      })
    } else {
      const result:any = {};
      let a = {}
      let b = {}
      this.time = this.getTimeFromMinutes(changeContext.highValue);
      let low_value = this.getTimeFromMinutes(changeContext.value)
      this.chart_data.map( item => {
        if(item.time == low_value){
          a = {
            daily_CE: item.chart_data.daily_CE,
            daily_PE: item.chart_data.daily_PE
          }
        }
        if(item.time == this.time){
          b = {
            daily_CE: item.chart_data.daily_CE,
            daily_PE: item.chart_data.daily_PE
          }
        }
      })
      // console.log('a', a, 'b', b)
      if(Object.keys(a) && Object.keys(b)){
        for (const key in a) {
          result[key] = [];
          for (let i = 0; i < a[key].length; i++) {
            result[key][i] = b[key][i] - a[key][i];
          }
        }
        console.log('comparison',result);
        this.daily_CE = result.daily_CE
        this.daily_PE = result.daily_PE
        this.dailyChart()
      }
    }
  }

  onUserChangeEnd(changeContext: ChangeContext): void {
    // console.log('end', changeContext)
  }

  dailyChart() {
    const option = {
      color: ['#91CC75', '#EE6666'],
      legend: {
        show: false
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
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
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
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
