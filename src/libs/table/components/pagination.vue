<template>
  <el-pagination
    :currentPage="currentPage"
    :page-sizes="pageSizes"
    :page-size="pageSize"
    layout="total, sizes, prev, pager, next, jumper"
    :total="total"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  ></el-pagination>
</template>

<script setup>
import {} from 'vue'

const props = defineProps({
 // 分页相关
  // 是否显示分页
  pagination: {
    type: Boolean,
    default: false,
  },
  // 显示分页的对齐方式
  paginationAlign: {
    type: String as PropType<'left' | 'center' | 'right'>,
    default: 'left',
  },
  // 当前是第几页
  currentPage: {
    type: Number,
    default: 1,
  },
  // 当前一页多少条数据
  pageSize: {
    type: Number,
    default: 10,
  },
  // 显示分页数据多少条的选项
  pageSizes: {
    type: Array,
    default: () => [10, 20, 30, 40],
  },
  // 数据总条数
  total: {
    type: Number,
    default: 0,
  },
})

/**
 * @description: 分页
 */

// 表格分页的排列方式
let justifyContent = computed(() => {
  if (props.paginationAlign === 'left') return 'flex-start'
  else if (props.paginationAlign === 'right') return 'flex-end'
  else return 'center'
})

// 分页的每一页数据变化
let handleSizeChange = (val: number) => {
  emits('size-change', val)
  // console.log(val)
}
// 分页页数改变
let handleCurrentChange = (val: number) => {
  emits('update:currentPage', val)
  emits('currentPage', val)
  // console.log(val)
}

</script>

<style lang="scss" scoped></style>
