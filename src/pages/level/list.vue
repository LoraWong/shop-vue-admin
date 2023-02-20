<template>
  <el-card shadow="never" class="border-0">
    <!-- 新增|刷新 -->
    <ListHeader @create="handleCreate" @refresh="getData" />

    <el-table :data="tableData" stripe style="width: 100%" v-loading="loading">
      <el-table-column prop="name" label="会员等级" />
      <el-table-column prop="discount" label="折扣率" align="center" />
      <el-table-column prop="level" label="等级序号" align="center" />
      <el-table-column label="状态" width="120">
        <template #default="{ row }">
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
      </el-table-column>
      <el-table-column label="操作" width="250" align="center">
        <template #default="scope">
          <el-button type="primary" size="small" text @click="handleEdit(scope.row)">修改</el-button>

          <el-popconfirm title="是否要删除该记录？" confirmButtonText="确认" cancelButtonText="取消" @confirm="handleDelete(scope.row.id)">
            <template #reference>
              <el-button text type="primary" size="small">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <div class="flex items-center justify-center mt-5">
      <el-pagination background layout="prev, pager ,next" :total="total" :current-page="currentPage" :page-size="limit" @current-change="getData" />
    </div>

    <FormDrawer ref="formDrawerRef" :title="drawerTitle" @submit="handleSubmit">
      <m-form-model :formItems="options.formItems" v-model="form" ref="formRef">
        <template #maxPrice>
          <div>
            <small class="text-xs mr-2">累计消费满</small>
            <el-input type="number" v-model="form.max_price" placeholder="累计消费" style="width: 50%">
              <template #append>元</template>
            </el-input>
            <small class="text-gray-400 flex"> 设置会员等级所需要的累计消费必须大于等于0,单位：元 </small>
          </div>
        </template>
        <template #maxTimes>
          <div>
            <small class="text-xs mr-2">累计次数满</small>
            <el-input type="number" v-model="form.max_times" placeholder="累计次数" style="width: 50%">
              <template #append>%</template>
            </el-input>
            <small class="text-gray-400 flex"> 设置会员等级所需要的购买量必须大于等于0,单位：笔 </small>
          </div>
        </template>
        <template #discountFooter>
          <small class="text-gray-400 flex"> 折扣率单位为百分比，如输入90，表示该会员等级的用户可以以商品原价的90%购买 </small>
        </template>
      </m-form-model>
    </FormDrawer>
  </el-card>
</template>
<script setup>
import ListHeader from '~/components/ListHeader.vue'
import FormDrawer from '~/components/FormDrawer.vue'
import { getUserLevelList, createUserLevel, updateUserLevel, deleteUserLevel, updateUserLevelStatus } from '~/api/level'

import { useInitTable, useInitForm } from '~/composables/useCommon.js'

const { tableData, loading, currentPage, total, limit, getData, handleDelete, handleStatusChange } = useInitTable({
  getList: getUserLevelList,
  delete: deleteUserLevel,
  updateStatus: updateUserLevelStatus,
})

const { formDrawerRef, formRef, form, rules, drawerTitle, handleSubmit, handleCreate, handleEdit } = useInitForm({
  form: {
    name: '',
    level: 100,
    status: 1,
    discount: 0,
    max_price: 0,
    max_times: 0,
  },
  rules: {
    name: [
      {
        required: true,
        message: '会员等级名称不能为空',
        trigger: 'blur',
      },
    ],
  },
  component: 'm-form',
  getData,
  update: updateUserLevel,
  create: createUserLevel,
})

const options = {
  formItems: [
    {
      type: 'input',
      prop: 'name',
      label: '等级名称',
      placeholder: '等级名称',
      rules: rules.name,
    },
    {
      type: 'input',
      prop: 'level',
      label: '等级权重',
      placeholder: '等级权重',
      attrs: {
        type: 'number',
      },
      headerSlot: 'levelHeader',
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
      label: '升级条件',
      props: 'max_price',
      slotName: 'maxPrice',
    },
    {
      type: 'slot',
      props: 'max_times',
      slotName: 'maxTimes',
    },
    {
      type: 'input',
      label: '折扣率(%)',
      props: 'discount',
      placeholder: '折扣率(%)',
      attrs: {
        type: 'number',
        style: {
          width: '50%'
        }
      },
      inputOptions: {
        appendText: '%',
      },
      footerSlot: 'discountFooter',
    },
  ],
}
</script>
