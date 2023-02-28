<template>
    <div>
        <panel />

        <el-card shadow="never" class="border-0">
            <!-- 搜索 -->
            <Search :model="searchForm" @search="getData" @reset="resetSearchForm">
                <SearchItem label="时间选择">
                    <el-radio-group v-model="searchForm.type">
                        <el-radio-button label="all">全部</el-radio-button>
                        <el-radio-button label="today">今天</el-radio-button>
                        <el-radio-button label="yesterday">昨天</el-radio-button>
                        <el-radio-button label="last7days">最近7天</el-radio-button>
                    </el-radio-group>
                </SearchItem>
                <template #show>
                    <SearchItem label="开始时间">
                        <el-date-picker
                            v-model="searchForm.starttime"
                            type="date"
                            placeholder="开始日期"
                            style="width: 90%;"
                            value-format="YYYY-MM-DD"
                        />
                    </SearchItem>
                    <SearchItem label="结束时间">
                        <el-date-picker
                            v-model="searchForm.endtime"
                            type="date"
                            placeholder="结束日期"
                            style="width: 90%;"
                            value-format="YYYY-MM-DD"
                        />
                    </SearchItem>
                    <SearchItem label="关键词">
                        <el-input v-model="searchForm.keyword" placeholder="关键词" clearable></el-input>
                    </SearchItem>
                </template>
            </Search>

            <m-table :options="tableOptions" :data="tableData">
                <template #avatar="{ row }">
                        <el-avatar :size="40" :src="row.avatar">
                            <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png" />
                        </el-avatar>
                    </template>

                    <template #userInfo="{ row }">
                        <div class="text-xs">
                            <p>用户：{{ row.username }}</p>
                            <p>昵称：{{ row.nickname }}</p>
                            <p>姓名：{{ row.user_info.name }}</p>
                            <p>电话：{{ row.phone }}</p>
                        </div>
                    </template>

                    <template #action="{ row }">
                        <el-button type="primary" size="small" text @click="openDataDrawer(row.id,'user')">推广人</el-button>
                        <el-button type="primary" size="small" text
                        @click="openDataDrawer(row.id,'order')">推广订单</el-button>
                    </template>
            </m-table>

            <div class="flex items-center justify-center mt-5">
                <el-pagination background layout="prev, pager ,next" :total="total" :current-page="currentPage"
                    :page-size="limit" @current-change="getData" />
            </div>
        </el-card>

        <dataDrawer ref="dataDrawerRef"/>
        <dataDrawer ref="orderDataDrawerRef" type="order"/>
    </div>
</template>
<script setup>
import panel from "./panel.vue"
import dataDrawer from "./dataDrawer.vue"
import { ref } from "vue"
import Search from "~/components/Search.vue";
import SearchItem from "~/components/SearchItem.vue";

import {
    getAgentList
} from "~/api/distribution"


import { useTable } from "~/composables/useTable.js";

const {
    searchForm,
    resetSearchForm,
    tableData,
    loading,
    currentPage,
    total,
    limit,
    getData,
} = useTable({
    searchForm: {
        keyword: "",
        type: "all",
        starttime:null,
        endtime:null
    },
    getList: getAgentList,
    onGetListSuccess: (res) => {
        tableData.value = res.list
        total.value = res.totalCount
    },
})

const dataDrawerRef = ref(null)
const orderDataDrawerRef = ref(null)
const openDataDrawer = (id,type)=>{
    (type == "user" ? dataDrawerRef : orderDataDrawerRef).value.open(id)
}


const tableOptions = [
    {
        prop: 'id',
        label: 'ID',
        attrs: {
            align: 'center'
        }
        
    },
    {
        type: 'slot',
        label: '头像',
        slotName: 'avatar',
        attrs: {
            width: '65'
        }
    },
    {
        type: 'slot',
        label: '用户信息',
        slotName: 'userInfo',
        attrs: {
            width: '200'
        }
    },
    {
        prop: 'share_num',
        label: '推广用户数量',
        attrs: {
            align: 'center'
        }
        
    },
    {
        prop: 'share_order_num',
        label: '订单数量',
        attrs: {
            align: 'center'
        }
        
    },
    {
        prop: 'order_price',
        label: '订单金额',
        attrs: {
            align: 'center'
        }
        
    },
    {
        prop: 'commission',
        label: '账户佣金',
        attrs: {
            align: 'center'
        }
        
    },
    {
        prop: 'cash_out_price',
        label: '已提现金额',
        attrs: {
            align: 'center'
        }
        
    },
    {
        prop: 'cash_out_time',
        label: '提现次数',
        attrs: {
            align: 'center'
        }
        
    },
    {
        prop: 'no_cash_out_price',
        label: '未提现金额',
        attrs: {
            align: 'center'
        }
        
    },
    {
        type: 'slot',
        label: '操作',
        slotName: 'action',
        attrs: {
            width: '180'
        }
    }
]
</script>