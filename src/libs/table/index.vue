<template>
  <el-table
    ref="tableRef"
    v-if="data.length"
    :data="data"
    v-loading="loading"
    style="width: 100%"
    v-bind="$attrs"
    :stripe="stripe"
    @selection-change="handleSelectionChange"
  >
    <!-- 索引 -->
    <el-table-column type="index" width="50" v-if="index" />
    <!-- 复选框 -->
    <el-table-column type="selection" width="55" v-if="selection" />

    <template v-for="item in options" :key="index">
      <el-table-column :label="item.label" :prop="item.prop" v-bind="item.attrs" v-if="!item.isHidden">
        <template #default="scope">
          <!-- 自定义文本 -->
          <div v-if="item.type === 'customText'" v-html="item.customTextCallback && item.customTextCallback(scope.row)"></div>

          <!-- 插槽 -->
          <slot v-else-if="item.type === 'slot'" :name="item.slotName" :row="scope.row" :index="scope.$index"></slot>

          <!-- 可编辑 -->
          <template v-else-if="item.type === 'editable'">
            <!-- 可编辑状态 -->
            <template v-if="scope.$index + scope.column.id === currentEdit">
              <div style="display: flex">
                <el-input size="small" v-model="scope.row[item.prop!]"></el-input>
                <div>
                  <!-- 自定义confirm cancel样式 -->
                  <slot name="cellEdit" v-if="$slots.cellEdit" :row="scope.row" :index="scope.$index"></slot>
                  <!-- 默认confirm cancel样式 -->
                  <div class="action-icon" v-else>
                    <Check class="check" @click.stop="confirm(scope)"></Check>
                    <Close class="close" @click.stop="cancel(scope)"></Close>
                  </div>
                </div>
              </div>
            </template>
            <!-- 不可编辑状态 -->
            <template v-else>
              <span>{{ scope.row[item.prop!] }}</span>
              <Edit class="edit" @click="onEdit(scope)"></Edit>
            </template>
          </template>

        </template>
      </el-table-column>
    </template>
  </el-table>

</template>

<script setup lang="ts">
import { PropType, computed, ref, watch, onMounted } from 'vue'
import { TableOptions } from './types'
import type { ElTable } from 'element-plus'

let props = defineProps({
  // 表格配置选项
  options: {
    type: Array as PropType<TableOptions[]>,
    required: true,
  },
  // 表格数据
  data: {
    type: Array,
    required: true,
  },
  // 是否复选框
  selection: {
    type: Boolean,
    default: false,
  },
  // 是否索引号
  index: {
    type: Boolean,
    default: false,
  },
  stripe: {
    type: Boolean,
    default: false,
  },
  // loading相关：
  // 是否开启 loading
  loading: {
    type: Boolean,
    default: false,
  },
})

let emits = defineEmits(['confirm', 'cancel', 'update:editRowIndex',  'selection-change'])

const tableRef = ref<InstanceType<typeof ElTable> | null>()

// 是否在加载中
// let isLoading = computed(() => !props.data || !props.data.length)

/**
 * @description: 点击编辑
 */
// 当前编辑单元格
const currentEdit = ref<string>('')
const onEdit = (scope: any) => {
  // 拼接$index和column的id 作为当前被编辑的单元格标识
  currentEdit.value = scope.$index + scope.column.id
}

// 确认编辑
const confirm = (scope: any) => {
  currentEdit.value = ''
  emits('confirm', scope)
}

// 取消编辑
const cancel = (scope: any) => {
  currentEdit.value = ''
  emits('cancel', scope)
}

/**
 * @description:
 */
const handleSelectionChange = (selection: []) => {
  emits('selection-change', selection)
}



// 清空选中数据列表
const clearSelection = () => tableRef.value!.clearSelection()

// 暴露方法
defineExpose({
  element: tableRef, // table实例
  clearSelection, // 用于多选表格，清空用户的选择
})
</script>

<style lang="scss" scoped>
.edit {
  width: 1em;
  height: 1em;
  position: relative;
  top: 2px;
  left: 12px;
  cursor: pointer;
}
.action-icon {
  display: flex;
  svg {
    width: 1em;
    height: 1em;
    margin-left: 8px;
    position: relative;
    top: 8px;
    cursor: pointer;
  }
  .check {
    color: red;
  }
  .close {
    color: green;
  }
}
.pagination {
  margin-top: 16px;
  display: flex;
}
</style>
