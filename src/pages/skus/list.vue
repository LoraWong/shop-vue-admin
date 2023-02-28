<template>
  <el-card shadow="never" class="border-0">
    <!-- 新增|刷新 -->
    <ListHeader layout="create,delete,refresh" @create="handleCreate" @refresh="getData" @delete="handleMultiDelete" />
    <m-table
      ref="multipleTableRef"
      selection
      :data="tableData"
      :options="tableOptions"
      stripe
      :loading="loading"
      @selection-change="handleSelectionChange"
    >
      <template #mStatus="{ row }">
        <el-switch
          :modelValue="row.status"
          :active-value="1"
          :inactive-value="0"
          :loading="row.statusLoading"
          :disabled="row.super == 1"
          @change="handleStatusChange($event, row)"
        >
        </el-switch>
      </template>
      <!-- bug: 无法显示 -->
      <template #mAction="{ row }">
        <el-button type="primary" size="small" text @click="handleEdit(row)">修改</el-button>
        <el-popconfirm title="是否要删除该规格？" confirmButtonText="确认" cancelButtonText="取消" @confirm="handleDelete(scope.row.id)">
          <template #reference>
            <el-button text type="primary" size="small">删除</el-button>
          </template>
        </el-popconfirm>
      </template>
    </m-table>
    <div class="flex items-center justify-center mt-5">
      <el-pagination background layout="prev, pager ,next" :total="total" :current-page="currentPage" :page-size="limit" @current-change="getData" />
    </div>

    <FormDrawer destroyOnClose ref="formDrawerRef" :title="drawerTitle" @submit="handleSubmit">
      <m-form-model :formItems="options.formItems" v-model="form" ref="formRef">
        <template #skuValue>
          <TagInput v-model="form.default" />
        </template>
      </m-form-model>
    </FormDrawer>
  </el-card>
</template>
<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import ListHeader from '~/components/ListHeader.vue'
import FormDrawer from '~/components/FormDrawer.vue'
import TagInput from '~/components/TagInput.vue'
import { getSkusList, createSkus, updateSkus, deleteSkus, updateSkusStatus } from '~/api/skus'
import { toast } from '~/composables/util'

import { useTable } from '~/composables/useTable.js'
import { useForm } from '~/composables/useForm.js'

const {
  tableData,
  loading,
  currentPage,
  total,
  limit,
  getData,
  handleDelete,
  handleStatusChange,
  handleSelectionChange,
  multipleTableRef,
  handleMultiDelete,
} = useTable({
  getList: getSkusList,
  delete: deleteSkus,
  updateStatus: updateSkusStatus,
})

const { formDrawerRef, formRef, form, rules, drawerTitle, handleSubmit, handleCreate, handleEdit } = useForm({
  form: {
    name: '',
    status: 1,
    default: '',
    order: 50,
  },
  rules: {
    name: [
      {
        required: true,
        message: '规格名称不能为空',
        trigger: 'blur',
      },
    ],
    default: [
      {
        required: true,
        message: '规格值不能为空',
        trigger: 'blur',
      },
    ],
  },
  component: 'm-form',
  getData,
  update: updateSkus,
  create: createSkus,
})

// 表单配置
const options = computed(() => {
  return {
    formItems: [
      {
        type: 'input',
        prop: 'name',
        label: '规格名称',
        placeholder: '规格名称',
        rules: rules.name,
      },
      {
        type: 'input-number',
        prop: 'order',
        label: '排序',
        attrs: {
          min: 0,
          max: 1000,
        },
      },
      {
        type: 'switch',
        prop: 'status',
        label: '状态',
        attrs: {
          activeValue: 1,
          inactiveValue: 0,
        },
      },
      {
        type: 'slot',
        label: '规格值',
        prop: 'default',
        slotName: 'skuValue',
        // 规则不可用
        isHiddenObj: {
          status: 1,
        },
        rules: [
          {
            required: true,
            validator: (rule, val) => val.length > 0,
            message: '规格值不能为空',
          },
        ],
      },
    ],
  }
})

const tableOptions = [
  {
    label: '规格名称',
    prop: 'name',
  },
  {
    label: '规格值',
    prop: 'default',
    attrs: {
      width: '380',
    },
  },
  {
    label: '排序',
    prop: 'order',
  },
  {
    type: 'slot',
    label: '状态',
    attrs: {
      width: '120',
    },
    slotName: 'mStatus',
  },
  {
    type: 'slot',
    label: '操作',
    attrs: {
      width: '250',
      align: 'center',
    },
    slotName: 'mAction',
  },
]
</script>
