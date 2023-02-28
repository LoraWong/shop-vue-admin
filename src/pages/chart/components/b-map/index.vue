<template>
  <el-card class="container">
    <div class="title">营收业绩图示</div>
    <div ref="target" class="box"></div>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getChartMap } from '~/api/chart'
import * as echarts from 'echarts'
// 导入 bmap 模块
import 'echarts/extension/bmap/bmap.js'




/**
 * 获取数据
 * 此时服务端返回的数据包含两个属性：
data：所有的城市和对应数据
geoCoordMap：所有城市和对应坐标
该数据 不可以 直接在地图可视化中进行渲染，需要对该数据进行 重置
 */
const chartData = ref({})
const getChartData = async () => {
  const res = await getChartMap()
  chartData.value = res.data.data
  // 渲染图表
  renderBMap()
}
getChartData()

/**
 * @description: 数据结构重置
 */
const convertData = (data) => {
  const res = []

  data.forEach((item) => {
    // 当前城市坐标
    const geoCoord = chartData.value.geoCoordMap[item.name]
    if (geoCoord) {
      // 该数据对象为：
      // name：城市名
      // value：数组[经度、维度、数据]
      res.push({
        name: item.name,
        value: [...geoCoord, item.value]
      })
    }
  })

  return res
}

/**
 * 初始化 echarts
 */
const target = ref(null)
let mChart = null
onMounted(() => {
  mChart = echarts.init(target.value)
})

/**
 * 渲染地图数据
 */
const renderBMap = () => {
  const options = {
    tooltip: {
      trigger: 'item'
    },
    // 地图配置
    bmap: {
      // 中心点
      center: [109.114129, 36.550339],
      // 缩放级别
      zoom: 5,
      // 是否可拖动
      roam: true
    },
    series: [
      {
        name: `营收（）`,
        // 散点图
        type: 'scatter',
        // 使用的表坐标
        coordinateSystem: 'bmap',
        // 数据源
        data: convertData(chartData.value.data),
        // 散点的大小(数据越大，点越大)
        symbolSize: function (val) {
          return val[2] / 10
        },
        // 数据使用下标为2的值（item.value[2]）
        encode: {
          value: 2
        },
        // 鼠标移入时，高亮的标签样式
        emphasis: {
          label: {
            // 鼠标移入时，显示高亮
            show: true
          }
        },
        // 散点色值
        color: '#2575fc'
      },
      {
        name: `营收 TOP 5`,
        // 包含涟漪特效动画的散点的散点图
        type: 'effectScatter',
        // 使用的表坐标
        coordinateSystem: 'bmap',
        // 数据源（top 5）
        data: convertData(
          chartData.value.data
            .sort(function (a, b) {
              return b.value - a.value
            })
            .slice(0, 6)
        ),
        // 散点的大小
        symbolSize: function (val) {
          return val[2] / 10
        },
        // 数据使用下标为2的值（item.value[2]）
        encode: {
          value: 2
        },
        // 涟漪特效
        rippleEffect: {
          // stroke 类型的波纹
          brushType: 'stroke'
        },
        // 显示地名
        label: {
          formatter: '{b}',
          position: 'right',
          show: true
        },
        // 散点层级
        zlevel: 2,
        // 散点色值
        color: '#6a11cb'
      }
    ]
  }
  mChart.setOption(options)
}


</script>

<style lang="scss" scoped>
.container {
  position: relative;
  .title {
    position: absolute;
    top: 28px;
    margin-left: 50%;
    transform: translateX(-50%);
    color: #333;
    font-size: 22px;
    font-weight: bold;
    z-index: 9;
  }
  .box {
    height: 462px;
  }
}
</style>
