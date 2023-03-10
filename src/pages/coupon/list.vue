<template>
  <el-card shadow="never" class="border-0">
    <!-- 新增|刷新 -->
    <ListHeader @create="handleCreate" @refresh="getData" />
    <m-table :options="tableOptions" :data="tableData">
      <template #couponName="{ row }">
        <div class="border border-dashed py-2 px-4 rounded" :class="row.statusText == '领取中' ? 'active' : 'inactive'">
          <h5 class="font-bold text-md">{{ row.name }}</h5>
          <small>{{ row.start_time }} ~ {{ row.end_time }}</small>
        </div>
      </template>
      <template #action="scope">
        <el-button v-if="scope.row.statusText == '未开始'" type="primary" size="small" text @click="handleEdit(scope.row)">修改</el-button>

          <el-popconfirm
            v-if="scope.row.statusText != '领取中'"
            title="是否要删除该优惠券？"
            confirmButtonText="确认"
            cancelButtonText="取消"
            @confirm="handleDelete(scope.row.id)"
          >
            <template #reference>
              <el-button text type="primary" size="small">删除</el-button>
            </template>
          </el-popconfirm>

          <el-popconfirm
            v-if="scope.row.statusText == '领取中'"
            title="是否要让该优惠券失效？"
            confirmButtonText="失效"
            cancelButtonText="取消"
            @confirm="handleStatusChange(0, scope.row)"
          >
            <template #reference>
              <el-button type="danger" size="small">失效</el-button>
            </template>
          </el-popconfirm>
      </template>
    </m-table>

    <div class="flex items-center justify-center mt-5">
      <el-pagination background layout="prev, pager ,next" :total="total" :current-page="currentPage" :page-size="limit" @current-change="getData" />
    </div>

    <FormDrawer ref="formDrawerRef" :title="drawerTitle" @submit="handleSubmit">
      <m-form-model ref="formRef" :formItems="options.formItems" v-model="form">
        <template #datePicker>
          <el-date-picker
            :editable="false"
            v-model="timerange"
            value-format="YYYY-MM-DD HH:mm:ss"
            type="datetimerange"
            range-separator="To"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />
        </template>
      </m-form-model>
    </FormDrawer>
  </el-card>
</template>
<script setup>
import { computed } from 'vue'
import ListHeader from '~/components/ListHeader.vue'
import FormDrawer from '~/components/FormDrawer.vue'
import { getCouponList, createCoupon, updateCoupon, deleteCoupon, updateCouponStatus } from '~/api/coupon'
import { useTable } from "~/composables/useTable.js";
import {useForm} from '~/composables/useForm.js';

function formatStatus(row) {
  let s = '领取中'
  let start_time = new Date(row.start_time).getTime()
  let now = new Date().getTime()
  let end_time = new Date(row.end_time).getTime()
  if (start_time > now) {
    s = '未开始'
  } else if (end_time < now) {
    s = '已结束'
  } else if (row.status == 0) {
    s = '已失效'
  }
  return s
}

const { tableData, loading, currentPage, total, limit, getData, handleDelete, handleStatusChange } = useTable({
  getList: getCouponList,

  onGetListSuccess: (res) => {
    tableData.value = res.list.map((o) => {
      // 转化优惠券状态
      o.statusText = formatStatus(o)
      return o
    })
    total.value = res.totalCount
  },
  delete: deleteCoupon,
  updateStatus: updateCouponStatus,
})

const { formDrawerRef, formRef, form, rules, drawerTitle, handleSubmit, handleCreate, handleEdit } = useForm({
  form: {
    name: '',
    type: 0,
    value: 0,
    total: 100,
    min_price: 0,
    start_time: null,
    end_time: null,
    order: 50,
    desc: '',
  },
  component: 'm-form',
  getData,
  update: updateCoupon,
  create: createCoupon,

  beforeSubmit: (f) => {
    if (typeof f.start_time != 'number') {
      f.start_time = new Date(f.start_time).getTime()
    }
    if (typeof f.end_time != 'number') {
      f.end_time = new Date(f.end_time).getTime()
    }
    return f
  },
})

const timerange = computed({
  get() {
    return form.start_time && form.end_time ? [form.start_time, form.end_time] : []
  },
  set(val) {
    form.start_time = val[0]
    form.end_time = val[1]
  },
})

const options = {
  formItems: [
    {
      type: 'input',
      prop: 'name',
      label: '优惠券名称',
    },
    {
      type: 'radio',
      prop: 'type',
      label: '类型',
      childrenOptions: {
        dataArr: [
          { label: 0, radioText: '满减' },
          { label: 1, radioText: '折扣' },
        ],
        keyOption: {
          label: 'label',
          radioText: 'radioText',
        },
      },
    },
    {
      type: 'input',
      prop: 'value',
      label: '面值',
      inputOptions: {
        appendCallback() {
          return `${form.type ? '折' : '元'}`
        },
      },
      attrs: {
        style: {
          width: '300px',
        },
      },
    },
    {
      type: 'input-number',
      prop: 'total',
      label: '发行量',
      attrs: {
        min: 0,
        max: 1000,
      },
    },
    {
      type: 'input',
      prop: 'min_price',
      label: '最低使用价格',
      placeholder: '最低使用价格',
      attrs: {
        type: 'number',
        style: {
          width: '300px',
        },
      },
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
      type: 'slot',
      prop: 'timerange',
      label: '活动时间',
      slotName: 'datePicker',
    },
    {
      type: 'input',
      prop: 'desc',
      label: '描述',
      placeholder: '描述',
      attrs: {
        type: 'textarea',
        rows: 5,
      },
    },
  ],
}

const tableOptions = [
  {
    type: 'slot',
    label: '优惠券名称',
    slotName: 'couponName',
    attrs: {
      width: '350',
    },
  },
  {
    prop: 'statusText',
    label: '状态',
  },
  {
    type: 'customText',
    label: '优惠',
    customTextCallback: function (row) {
      const type = row.type == 0 ? '满减' : '折扣'
      const value = row.type == 0 ? '￥' + row.value : row.value + '折'
      return `${type} ${value}`
    },
  },
  {
    prop: 'total',
    label: '发放数量',
  },
  {
    prop: 'used',
    label: '已使用',
  },
  {
    type: 'slot',
    label: '操作',
    slotName: 'action',
    attrs: {
      width: '180',
      align: 'center'
    }
  }
]
</script>
<style scoped>
.active {
  @apply border-rose-200 bg-rose-50 text-red-400;
}

.inactive {
  @apply border-gray-200 bg-gray-50 text-gray-400;
}
</style>
