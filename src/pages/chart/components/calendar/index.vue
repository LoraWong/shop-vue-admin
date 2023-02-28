<template>
  <el-card
    class="container"
    :body-style="{
      padding: 0
    }"
  >
    <el-calendar class="calendar" v-model="currentDate">
      <template #date-cell="{ data }">
        <p
          :class="[
            data.isSelected ? 'is-selected' : '',
            calendarItemBgClass(data.day)
          ]"
        >
          <!-- 自定义显示的内容 -->
          {{ data.day.split('-').slice(2).join('') }}
          <br />
          <!-- 当日金额 -->
          <span class="amount" v-if="getTodayAmount(data.day)">
            {{ getTodayAmount(data.day) }}
          </span>
        </p>
      </template>
    </el-calendar>
  </el-card>
</template>

<script setup>
import { ref, watch } from 'vue'
import { getChartCalendar } from '~/api/chart'
import emitter from '~/composables/eventHub'
import throttle from 'lodash/throttle'

// 选中的日期
const currentDate = ref(new Date())

/**
 * 获取数据
 */
const calendarListData = ref([])
const getCalendarListData = async () => {
  const res = await getChartCalendar()
  calendarListData.value = res.data.data.result
}
getCalendarListData()

/**
 * 该数据会被多次读取，做简单的缓存处理
 * key: 日期
 * value：金额
 */
const dateAmountList = ref({})
/**
 * 返回指定日期收益数据，在日历中进行展示
 */
const getTodayAmount = (date) => {
  // 读取缓存：数据是否 已经 缓存
  if (dateAmountList.value[date]) {
    return dateAmountList.value[date]
  }

  // 根据日期，获取当日金额
  // 根据日期，找出对应的金额数据
  const TodayData = calendarListData.value.find((item) => item.date === date)
  // 判断当日数据是否存在
  if (!TodayData) {
    return 0
  }
  // 获取当日收益
  const dateAmount = TodayData.amount
  // 对数据进行缓存
  dateAmountList.value[date] = dateAmount

  return dateAmount
}

/**
 * 日历背景色 类名
 */
const calendarItemBgClass = (date) => {
  const todayAmount = getTodayAmount(date)
  if (todayAmount > 0) {
    return 'profit'
  } else if (todayAmount < 0) {
    return 'loss'
  }
  return ''
}

/**
 * 监听时间变化，重新获取数据（节流
 */
// watch(currentDate, (val) => {
//   // 通知 horizontal- table组件 重新发请求获取数据
//   emitter.emit('calendarChange', val)
// })

// watch(
//   currentDate,
//   throttle(function (val) {
//     emitter.emit('calendarChange', val)
//   }, 500)
// )
</script>

<style lang="scss" scoped>
.container {
  height: 443px;
  .calendar {
    :deep(.el-calendar__body) {
      padding: 0 12px 12px;
      font-size: 14px;
    }
    :deep(.el-calendar-day) {
      height: 55px !important;
      padding: 0 !important;
      p {
        height: 100%;
        padding: 8px;
      }
      // 金额样式
      .amount {
        font-size: 12px;
        padding-top: 5px;
      }
     

      
    }
  }

   // 正收益
   .profit {
        background-color: #f3fff3;
        span {
          color: #649840;
        }
      }
      // 负收益
      .loss {
        background-color: #ffe7e7;
        span {
          color: #b65d59;
        }
      }

      .is-selected {
        background-color: #d6f2ff;
      }
}
</style>
