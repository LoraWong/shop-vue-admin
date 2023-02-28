<template>
  <el-card
    :body-style="{
      paddingTop: '12px'
    }"
  >
    <div class="container" ref="target"></div>
  </el-card>
</template>

<script setup>
import { getChartTimeAmount } from '~/api/chart'
import * as echarts from 'echarts'
import { onMounted, ref } from 'vue'


import emitter from '~/composables/eventHub'


/**
 * 获取数据
 */
const data = ref([])
const getData = async (date) => {
  console.log('🚀 ~ file: index.vue:25 ~ getData ~ date:', date)
  const res = await getChartTimeAmount(date)
  data.value = res.data.data.result
  console.log('🚀 ~ file: index.vue:27 ~ getData ~  data.value:',  data.value)
  // 获取数据后，渲染图表
  renderChart()
}
getData()

/**
 * 图表初始化
 */
const target = ref(null)
let mChart = null
onMounted(() => {
  mChart = echarts.init(target.value)
  // 不要在这里 渲染Echarts ！！！ 服务器返回数据需要时间，所以不能在组件挂载时就展示动态数据
  // renderChart()
})

/**
 * 构建图表
 */
const renderChart = () => {
  const options = {
    // 鼠标移入之后的提示框配置
    tooltip: {
      // 鼠标移入到坐标轴时，触发提示框
      trigger: 'axis',
      // 移入坐标轴时，提示框的配置项
      axisPointer: {
        // 指示器展示阴影
        type: 'shadow'
      }
    },
    // 图例配置
    legend: {
      // 图例数据
      data: [
        `收益（万元）`,
        `支出（万元）`,
        `结余（万元）`
      ],
      // 图例位置
      right: 0
    },
    // echarts 网格绘制的位置，对应 上、右、下、左
    grid: {
      top: 28,
      right: 0,
      bottom: 0,
      left: 0,
      // 计算边距时，包含标签
      containLabel: true
    },
    // X 轴配置
    xAxis: [
      {
        // 数值轴，适用于连续数据
        type: 'value'
      }
    ],
    // y 轴配置
    yAxis: [
      {
        // 坐标轴类型，category：类目轴
        type: 'category',
        // 刻度尺配置
        axisTick: {
          // 不显示坐标轴刻度
          show: false
        },
        // Y 轴数据
        data: data.value.map((item) => item.timeStr),
        // 反向展示
        inverse: true
      }
    ],
    // 图表类型
    series: [
      // 第一个图表：收益
      {
        // 图表名字，对应 legend.data[0]
        name: `收益（万元）`,
        // 图表类型
        type: 'bar',
        // 数据堆叠，两个相同的 stack 将会堆叠渲染
        stack: 'Total',
        // 标签配置
        label: {
          // 展示
          show: true,
          // 右侧
          position: 'right'
        },
        // 柱的颜色
        color: '#6DC473',
        // 高亮配置
        emphasis: {
          // 聚焦当前高亮的数据所在的系列的所有图形
          focus: 'series'
        },
        // 数据
        data: data.value.map((item) => item.income)
      },
      // 第二个图表：支出
      {
        // 图表名字，对应 legend.data[1]
        name: `支出（万元）`,
        // 图表类型
        type: 'bar',
        // 数据堆叠，两个相同的 stack 将会堆叠渲染
        stack: 'Total',
        // 标签配置
        label: {
          // 展示
          show: true,
          // 右侧
          position: 'right'
        },
        // 柱的颜色
        color: '#E47470',
        // 高亮配置
        emphasis: {
          // 聚焦当前高亮的数据所在的系列的所有图形
          focus: 'series'
        },
        // 数据
        data: data.value.map((item) => item.expense)
      },
      // 第三个图表：结余
      {
        // 图表名字，对应 legend.data[2]
        name: `结余（万元）`,
        // 图表类型
        type: 'bar',
        // 标签配置
        label: {
          // 展示
          show: true,
          // 内部
          position: 'inside'
        },
        // 柱的颜色
        color: '#83C0DF',
        // 高亮配置
        emphasis: {
          // 聚焦当前高亮的数据所在的系列的所有图形
          focus: 'series'
        },
        // 数据
        data: data.value.map((item) => item.balance)
      }
    ]
  }
  mChart.setOption(options)
}



/**
 * 日期改变 事件回调
 */
emitter.on('calendarChange', (val) => {
  // 重新发请求，渲染图表
  getData(val)
})
</script>

<style lang="scss" scoped>
.container {
  height: 403px;
}
</style>
