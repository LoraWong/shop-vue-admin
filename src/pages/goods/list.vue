<template>
  <div>
    <el-tabs v-model="searchForm.tab" @tab-change="getData">
      <el-tab-pane :label="item.name" :name="item.key" v-for="(item, index) in tabbars" :key="index"></el-tab-pane>
    </el-tabs>

    <el-card shadow="never" class="border-0">
      <!-- 搜索 -->
      <Search :model="searchForm" @search="getData" @reset="resetSearchForm">
        <SearchItem label="关键词">
          <el-input v-model="searchForm.title" placeholder="商品名称" clearable></el-input>
        </SearchItem>
        <template #show>
          <SearchItem label="商品分类">
            <el-select v-model="searchForm.category_id" placeholder="请选择商品分类" clearable>
              <el-option v-for="item in category_list" :key="item.id" :label="item.name" :value="item.id"> </el-option>
            </el-select>
          </SearchItem>
        </template>
      </Search>

      <!-- 新增|刷新 -->
      <ListHeader layout="create,refresh" @create="handleCreate" @refresh="getData">
        <el-button type="danger" size="small" @click="handleMultiDelete" v-if="searchForm.tab != 'delete'">批量删除</el-button>
        <el-button type="warning" size="small" @click="handleRestoreGoods" v-else>恢复商品</el-button>

        <el-popconfirm
          v-if="searchForm.tab == 'delete'"
          title="是否要彻底删除该商品？"
          confirmButtonText="确认"
          cancelButtonText="取消"
          @confirm="handleDestroyGoods"
        >
          <template #reference>
            <el-button type="danger" size="small">彻底删除</el-button>
          </template>
        </el-popconfirm>

        <el-button size="small" @click="handleMultiStatusChange(1)" v-if="searchForm.tab == 'all' || searchForm.tab == 'off'">上架</el-button>
        <el-button size="small" @click="handleMultiStatusChange(0)" v-if="searchForm.tab == 'all' || searchForm.tab == 'saling'">下架</el-button>
      </ListHeader>
      <el-table ref="multipleTableRef" @selection-change="handleSelectionChange" :data="tableData" stripe style="width: 100%" v-loading="loading">
        <el-table-column type="selection" width="55" />
        <el-table-column label="商品" width="300">
          <template #default="{ row }">
            <div class="flex">
              <el-image class="mr-3 rounded" :src="row.cover" fit="cover" :lazy="true" style="width: 50px; height: 50px"> </el-image>
              <div class="flex-1">
                <p>{{ row.title }}</p>
                <div>
                  <span class="text-rose-500">￥{{ row.min_price }}</span>
                  <el-divider direction="vertical" />
                  <span class="text-gray-500 text-xs">￥{{ row.min_oprice }}</span>
                </div>
                <p class="text-gray-400 text-xs mb-1">分类:{{ row.category ? row.category.name : '未分类' }}</p>
                <p class="text-gray-400 text-xs">创建时间：{{ row.create_time }}</p>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="实际销量" width="70" prop="sale_count" align="center" />
        <el-table-column label="商品状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status ? 'success' : 'danger'" size="small">{{ row.status ? '上架' : '仓库' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="审核状态" width="120" align="center" v-if="searchForm.tab != 'delete'">
          <template #default="{ row }">
            <div class="flex flex-col" v-if="row.ischeck == 0">
              <el-button type="success" size="small" plain>审核通过</el-button>
              <el-button class="mt-2 !ml-0" type="danger" size="small" plain>审核拒绝</el-button>
            </div>
            <span v-else>{{ row.ischeck == 1 ? '通过' : '拒绝' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="总库存" width="90" prop="stock" align="center" />
        <el-table-column label="操作" align="center">
          <template #default="scope">
            <div v-if="searchForm.tab != 'delete'">
              <el-button class="px-1" type="primary" size="small" text @click="handleEdit(scope.row)">修改</el-button>

              <el-button
                class="px-1"
                :type="
                  (scope.row.sku_type == 0 && !scope.row.sku_value) || (scope.row.sku_type == 1 && !scope.row.goods_skus.length)
                    ? 'danger'
                    : 'primary'
                "
                size="small"
                text
                :loading="scope.row.skusLoading"
                @click="handleSetGoodsSkus(scope.row)"
                >商品规格</el-button
              >

              <el-button
                class="px-1"
                :type="scope.row.goods_banner.length == 0 ? 'danger' : 'primary'"
                size="small"
                text
                @click="handleSetGoodsBanners(scope.row)"
                :loading="scope.row.bannersLoading"
                >设置轮播图</el-button
              >

              <el-button
                class="px-1"
                :type="!scope.row.content ? 'danger' : 'primary'"
                size="small"
                text
                @click="handleSetGoodsContent(scope.row)"
                :loading="scope.row.contentLoading"
                >商品详情</el-button
              >

              <el-popconfirm title="是否要删除该商品？" confirmButtonText="确认" cancelButtonText="取消" @confirm="handleDelete([scope.row.id])">
                <template #reference>
                  <el-button class="px-1" text type="primary" size="small">删除</el-button>
                </template>
              </el-popconfirm>
            </div>
            <span v-else>暂无操作</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex items-center justify-center mt-5">
        <el-pagination
          background
          layout="prev, pager ,next"
          :total="total"
          :current-page="currentPage"
          :page-size="limit"
          @current-change="getData"
        />
      </div>

      <FormDrawer ref="formDrawerRef" :title="drawerTitle" @submit="handleSubmit">
        <m-form-model :formItems="formOptions.formItems" v-model="form" ref="formRef">
          <template #uploadImg>
            <ChooseImage v-model="form.cover" />
          </template>
        </m-form-model>
      </FormDrawer>
    </el-card>

    <banners ref="bannersRef" @reload-data="getData" />
    <content ref="contentRef" @reload-data="getData" />
    <skus ref="skusRef" @reload-data="getData" />
  </div>
</template>
<script setup>
import { computed, ref , watch} from 'vue'
import ListHeader from '~/components/ListHeader.vue'
import FormDrawer from '~/components/FormDrawer.vue'
import ChooseImage from '~/components/ChooseImage.vue'
import Search from '~/components/Search.vue'
import SearchItem from '~/components/SearchItem.vue'
import banners from './banners.vue'
import content from './content.vue'
import skus from './skus.vue'
import { getGoodsList, updateGoodsStatus, createGoods, updateGoods, deleteGoods, restoreGoods, destroyGoods } from '~/api/goods'
import { getCategoryList } from '~/api/category'


import { useTable } from "~/composables/useTable.js";
import {useForm} from '~/composables/useForm.js';

import { toast } from '~/composables/util'


const {
  handleSelectionChange,
  multipleTableRef,
  handleMultiDelete,

  searchForm,
  resetSearchForm,
  tableData,
  loading,
  currentPage,
  total,
  limit,
  getData,
  handleDelete,
  handleMultiStatusChange,

  multiSelectionIds,
} = useTable({
  searchForm: {
    title: '',
    tab: 'all',
    category_id: null,
  },
  getList: getGoodsList,
  onGetListSuccess: (res) => {
    tableData.value = res.list.map((o) => {
      o.bannersLoading = false
      o.contentLoading = false
      o.skusLoading = false
      return o
    })
    total.value = res.totalCount
  },
  delete: deleteGoods,
  updateStatus: updateGoodsStatus,
})

const { formDrawerRef, formRef, form, rules, drawerTitle, handleSubmit, handleCreate, handleEdit } = useForm({
  form: {
    title: null, //商品名称
    category_id: null, //商品分类
    cover: null, //商品封面
    desc: null, //商品描述
    unit: '件', //商品单位
    stock: 100, //总库存
    min_stock: 10, //库存预警
    status: 1, //是否上架 0仓库1上架
    stock_display: 1, //库存显示 0隐藏1显示
    min_price: 0, //最低销售价
    min_oprice: 0, //最低原价
  },
  component: 'm-form',
  getData,
  update: updateGoods,
  create: createGoods,
})

const tabbars = [
  {
    key: 'all',
    name: '全部',
  },
  {
    key: 'checking',
    name: '审核中',
  },
  {
    key: 'saling',
    name: '出售中',
  },
  {
    key: 'off',
    name: '已下架',
  },
  {
    key: 'min_stock',
    name: '库存预警',
  },
  {
    key: 'delete',
    name: '回收站',
  },
]

// 商品分类
const category_list = ref([])
getCategoryList().then((res) => (category_list.value = res))

// 设置轮播图
const bannersRef = ref(null)
const handleSetGoodsBanners = (row) => bannersRef.value.open(row)

// 设置商品详情
const contentRef = ref(null)
const handleSetGoodsContent = (row) => contentRef.value.open(row)

// 设置商品规格
const skusRef = ref(null)
const handleSetGoodsSkus = (row) => skusRef.value.open(row)

const handleRestoreGoods = () => useMultiAction(restoreGoods, '恢复')

const handleDestroyGoods = () => useMultiAction(destroyGoods, '彻底删除')

function useMultiAction(func, msg) {
  loading.value = true
  func(multiSelectionIds.value)
    .then((res) => {
      toast(msg + '成功')
      // 清空选中
      if (multipleTableRef.value) {
        multipleTableRef.value.clearSelection()
      }
      getData()
    })
    .finally(() => {
      loading.value = false
    })
}

// 表单配置项（计算属性 或 watch都可以
const formOptions = computed(() => {
  return {
    labelWidth: 250,
    formItems: [
      {
        type: 'input',
        prop: 'title',
        label: '商品名称',
        rules: {
          required: true,
          message: '名称不能为空',
          trigger: 'blur',
        },
        attrs: {
          style: { width: '350px' },
        },
      },
      {
        type: 'slot',
        label: '封面',
        prop: 'cover',
        slotName: 'uploadImg',
      },
      {
        type: 'select',
        prop: 'category_id',
        label: '商品分类',
        key: form.id,
        childrenOptions: {
          dataArr: category_list.value,
          keyOption: {
            value: 'id',
            key: 'id',
            label: 'name',
          },
        },
      },
      {
        type: 'input',
        label: '商品描述',
        prop: 'desc',
        attrs: {
          type: 'textarea',
        },
      },
      {
        type: 'input',
        prop: 'unit',
        label: '单位',
        rules: {
          required: true,
          message: '不能为空',
          trigger: 'blur',
        },
        attrs: {
          style: { width: '350px' },
        },
      },
      {
        type: 'input',
        prop: 'stock',
        label: '总库存',
        inputOptions: {
          appendText: '件',
        },
        attrs: {
          style: { width: '350px' },
          type: 'number',
        },
      },
      {
        type: 'input',
        prop: 'min_stock',
        label: '库存预警',
        inputOptions: {
          appendText: '件',
        },
        attrs: {
          style: { width: '350px' },
          type: 'number',
        },
      },
      {
        type: 'input',
        prop: 'min_price',
        label: '最低销售价',
        inputOptions: {
          appendText: '元',
        },
        attrs: {
          style: { width: '350px' },
          type: 'number',
        },
      },
      {
        type: 'input',
        prop: 'min_oprice',
        label: '最低原价',
        inputOptions: {
          appendText: '元',
        },
        attrs: {
          style: { width: '350px' },
          type: 'number',
        },
      },
      {
        type: 'radio',
        prop: 'stock_display',
        label: '库存显示',
        childrenOptions: {
          dataArr: [
            {
              label: 0,
              radioText: '放入仓库',
            },
            {
              label: 1,
              radioText: '立即上架',
            },
          ],
          keyOption: {
            label: 'label',
            radioText: 'radioText',
          },
        },
      },
    ],
  }
})

watch(form, (val) => {
  console.log('hhhhh, form changed')
  if (val.category_id === 5) {
    console.log('hhhhh')
  }
})


</script>
