<template>
  <div class="trend-chart-container" ref="target"></div>
</template>

<script setup>
import { ref, defineProps, onMounted } from 'vue'
import * as echarts from 'echarts'




const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})
const target = ref(null)

let myChart
onMounted(() => {
  myChart = echarts.init(target.value)
  // 为什么可以在 mounted中渲染图表？？ 因为数据来自父组件，且该组件 使用 v-if 渲染，当父组件获取到数据后，该组件才会被渲染
  // （因此 组件挂载时，已经有数据
  renderChart()
})

const renderChart = () => {
  const options = {
    // 鼠标移入展示提示
    tooltip: {
      // 鼠标移入坐标轴 触发提示
      trigger: 'axis',
      // 展示内容
      axisPointer: {
        // 'cross' 十字准星指示器
        type: 'cross',
        // 指示器样式
        crossStyle: {
          color: '#999'
        }
      }
    },
    // 图例
    legend: {
      // 图例数据
      data: ['月累计收益', '日收益曲线'],
      // 展示位置
      right: 0
    },
    // 网格位置
    grid: {
      top: 20,
      right: 0,
      left: 0,
      bottom: 0,
      // 计算边距时包含label
      containLabel: true
    },
    // x轴
    xAxis: {
      type: 'category',
      data: props.data.monthAmountList.map((item) => item.time),
      // 刻度尺
      axisTick: {
        show: false
      }
    },
    // y轴
    yAxis: {
      // Y 轴类型，value：数值轴
      type: 'value',
      min: 0,
      // 最大值
      max: function (value) {
        return parseInt(value.max * 1.2)
      },
      // 刻度上展示的文字
      axisLabel: {
        formatter: `{value} 万元`
      }
    },
    // 图表配置
    series: [
      // 柱状图
      {
        type: 'bar',
        // 和图例名字 legend 保持一致
        name: '月累计收益',
        color: '#5f59f7',
        // 柱的宽度
        barWidth: 20,
        // 提示框展示配置
        tooltip: {
          // 提示框展示的内容
          valueFormatter: function (value) {
            return value + 'hhh'
          }
        },
        // 数据源
        data: props.data.monthAmountList.map((item) => item.amount)
      },
      // 曲线图
      {
        // 图表名字，对应 legend.data[1]
        name: '日收益曲线',
        // 图表类型
        type: 'line',
        // 颜色
        color: '#343090',
        // 平滑
        smooth: true,
        // 提示框展示配置
        tooltip: {
          // 提示框展示的内容
          valueFormatter: function (value) {
            return value + 'hh'
          }
        },
        // 数据源
        data: props.data.dailyCurve.map((item) => item.amount)
      }
    ]
  }
  myChart.setOption(options)
}


</script>

<style lang="scss" scoped>
.trend-chart-container {
  height: 100%;
}
</style>
