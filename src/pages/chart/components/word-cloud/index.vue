<template>
  <el-card
    :body-style="{
      padding: 0
    }"
  >
    <div class="container" ref="target"></div>
  </el-card>
</template>

<script setup>

import * as echarts from 'echarts'
import 'echarts-wordcloud'
import wordcloudBg from '~/assets/wordcloud.png'
import { ref, onMounted } from 'vue'
import { randomRGB } from '~/composables/color'
import { getChartWordCloud } from '~/api/chart.js'



/**
 * 获取数据
 */
const wordCloudData = ref([])
const getWordCloudData = async () => {
  const res = await getChartWordCloud()
  wordCloudData.value = res.data.data
}

const target = ref(null)
let mChart = null
onMounted(async () => {
  mChart = echarts.init(target.value)
  await getWordCloudData()
  // 渲染图表
  renderChart()
})

/**
 * 渲染图表
 */
const renderChart = () => {
  // 图像轮廓
  const maskImage = new Image()
  maskImage.src = wordcloudBg

  const option = {
    title: {
      text: '文档云'
    },
    series: [
      {
        // 类型
        type: 'wordCloud',
        // 数据映射文本的大小范围
        sizeRange: [4, 80],
        // 文字旋转范围
        rotationRange: [0, 0],
        // 单词之间的间距
        gridSize: 0,
        // 绘制将排除图像的轮廓
        maskImage: maskImage,
        // 渲染动画
        layoutAnimation: true,
        // 字体
        textStyle: {
          // 随机色值
          color: randomRGB
        },
        // 高亮字体
        emphasis: {
          textStyle: {
            fontWeight: 'bold',
            color: '#000'
          }
        },
        // 数据
        data: wordCloudData.value
      }
    ]
  }

  // 等待图像加载完成之后
  maskImage.onload = function () {
    mChart.setOption(option)
  }
}

</script>

<style lang="scss" scoped>
.container {
  height: 240px;
}
</style>
