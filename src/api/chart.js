import axios from 'axios'
import store from '~/store'

const http = axios.create({
  baseURL: 'chart-api',
  timeout: 5000,
})




/**
 * 获取累计收益明细
 */
export const getChartTrend = () => {
  return http({
    url: '/chart/trend',
  })
}

/**
 * 日历图示数据
 */
export const getChartCalendar = () => {
  return http({
    url: '/chart/calendar',
  })
}

/**
 * 指定日期的时段柱形数据
 */
export const getChartTimeAmount = (date) => {
  return http({
    url: '/chart/time/amount',
    params: {
      date,
    },
  })
}

/**
 * 饼图数据
 */
export const getChartPie = () => {
  return http({
    url: '/chart/pie',
  })
}

/**
 * 文字云图数据
 */
export const getChartWordCloud = () => {
  return http({
    url: '/chart/wordcloud',
  })
}

/**
 * 地图可视化
 */
export const getChartMap = () => {
  return http({
    url: '/chart/bmap',
  })
}

/**
 * 大区数据
 */
export const getChartRegions = () => {
  return http({
    url: '/chart/regions',
  })
}

/**
 * 表格数据
 */
export const getChartSheet = (regionId) => {
  return http({
    url: '/chart/sheets',
    params: {
      regionId,
    },
  })
}
