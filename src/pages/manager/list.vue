<template>
  <el-card shadow="never" class="border-0">
    <!-- 搜索 -->
    <Search :model="searchForm" @search="getData" @reset="resetSearchForm">
      <SearchItem label="关键词">
        <el-input v-model="searchForm.keyword" placeholder="管理员昵称" clearable></el-input>
      </SearchItem>
    </Search>

    <!-- 新增|刷新 -->
    <ListHeader @create="handleCreate" @refresh="getData" />

    <el-table :data="tableData" stripe style="width: 100%" v-loading="loading">
      <el-table-column label="管理员" width="200">
        <template #default="{ row }">
          <div class="flex items-center">
            <el-avatar :size="40" :src="row.avatar">
              <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png" />
            </el-avatar>
            <div class="ml-3">
              <h6>{{ row.username }}</h6>
              <small>ID:{{ row.id }}</small>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="所属角色" align="center">
        <template #default="{ row }">
          {{ row.role?.name || '-' }}
        </template>
      </el-table-column>
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
      <el-table-column label="操作" width="180" align="center">
        <template #default="scope">
          <small v-if="scope.row.super == 1" class="text-sm text-gray-500">暂无操作</small>
          <div v-else>
            <el-button type="primary" size="small" text @click="handleEdit(scope.row)">修改</el-button>

            <el-popconfirm title="是否要删除该管理员？" confirmButtonText="确认" cancelButtonText="取消" @confirm="handleDelete(scope.row.id)">
              <template #reference>
                <el-button text type="primary" size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="flex items-center justify-center mt-5">
      <el-pagination background layout="prev, pager ,next" :total="total" :current-page="currentPage" :page-size="limit" @current-change="getData" />
    </div>

    <FormDrawer ref="formDrawerRef" :title="drawerTitle" @submit="handleSubmit">
      <m-form-model ref="formRef" :formItems="option.formItems" v-model="form">
        <template #uploadImg>
          <ChooseImage v-model="form.avatar" />
        </template>
      </m-form-model>
    </FormDrawer>
  </el-card>
</template>
<script setup>
import { ref, computed } from 'vue'
import ListHeader from '~/components/ListHeader.vue'
import FormDrawer from '~/components/FormDrawer.vue'
import ChooseImage from '~/components/ChooseImage.vue'
import Search from '~/components/Search.vue'
import SearchItem from '~/components/SearchItem.vue'

import { getManagerList, updateManagerStatus, createManager, updateManager, deleteManager } from '~/api/manager'

import { useInitTable, useInitForm } from '~/composables/useCommon.js'

const roles = ref([])

const { searchForm, resetSearchForm, tableData, loading, currentPage, total, limit, getData, handleDelete, handleStatusChange } = useInitTable({
  searchForm: {
    keyword: '',
  },
  getList: getManagerList,
  onGetListSuccess: (res) => {
    tableData.value = res.list.map((o) => {
      o.statusLoading = false
      return o
    })
    total.value = res.totalCount
    roles.value = res.roles
  },
  delete: deleteManager,
  updateStatus: updateManagerStatus,
})

const { formDrawerRef, formRef, form, rules, drawerTitle, handleSubmit, handleCreate, handleEdit } = useInitForm({
  form: {
    username: '',
    password: '',
    role_id: null,
    status: 1,
    avatar: '',
  },
  component: 'm-form',
  getData,
  update: updateManager,
  create: createManager,
})

const option = computed(() => {
  return {
    formItems: [
      {
        type: 'input',
        label: '用户名',
        prop: 'username',
        rules: [
          {
            required: true,
            trigger: 'blur',
          },
        ],
      },
      {
        type: 'input',
        label: '密码',
        prop: 'password',
      },
      {
        type: 'slot',
        label: '头像',
        prop: 'avatar',
        slotName: 'uploadImg',
      },
      {
        type: 'select',
        label: '所属角色',
        prop: 'role_id',
        placeholder: '选择所属角色',
        childrenOptions: {
          dataArr: roles.value,
          keyOption: {
            label: 'name',
            key: 'id',
            value: 'id',
          },
        },
        rules: [
          {
            required: true,
            trigger: 'blur',
          },
        ],
      },
      {
        type: 'switch',
        label: '状态',
        prop: 'status',
        attrs: {
          activeValue: '1',
          inActiveValue: ' 0',
        },
      },
    ],
  }
})
</script>
