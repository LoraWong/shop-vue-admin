<template>
    <el-row class="login-container">
        <el-col :lg="12" :md="12" class="left">
            <div>
                <img src="../assets/loginWrapper.png" alt="">
            </div>
        </el-col>
        <el-col :lg="12" :md="12" class="right">
            <h2 class="title">登录</h2>
            <el-form ref="formRef" :rules="rules" :model="form" class="w-[250px]">
                <el-form-item prop="username">
                    <el-input v-model="form.username" placeholder="请输入用户名">
                        <template #prefix>
                            <el-icon><user /></el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input type="password" v-model="form.password" placeholder="请输入密码" show-password>
                        <template #prefix>
                            <el-icon><lock /></el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item>
                    <el-button round color="#0000b3" class="w-[250px]" type="primary" @click="onSubmit" :loading="loading">登 录</el-button>
                </el-form-item>
            </el-form>
        </el-col>
    </el-row>
</template>

<script setup>
import { ref,reactive,onMounted,onBeforeUnmount } from 'vue'
import { toast } from '~/composables/util'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const store = useStore()
const router = useRouter()

// do not use same name with ref
const form = reactive({
  username:"admin",
  password:"admin"
})

const rules = {
    username:[
        { 
            required: true, 
            message: '用户名不能为空', 
            trigger: 'blur' 
        },
    ],
    password:[
        { 
            required: true, 
            message: '密码不能为空', 
            trigger: 'blur' 
        },
    ]
}

const formRef = ref(null)
const loading = ref(false)
const onSubmit = () => {
    formRef.value.validate((valid)=>{
        if(!valid){
            return false
        }
        loading.value = true
        
        store.dispatch("login",form).then(res=>{
            toast("登录成功")
            router.push("/")
        }).finally(()=>{
            loading.value = false
        })
    })
}

// 监听回车事件
function onKeyUp(e){
    if(e.key == "Enter") onSubmit()
}

// 添加键盘监听
onMounted(()=>{
    document.addEventListener("keyup",onKeyUp)
})
// 移除键盘监听
onBeforeUnmount(()=>{
    document.removeEventListener("keyup",onKeyUp)
})

</script>

<style scoped>
.login-container{
    @apply min-h-screen ;
    background-image: linear-gradient(to right, #6a11cb 0%, #2575fc 100%);
}
.login-container .left,.login-container .right{
    @apply flex items-center justify-center;
}
.login-container .right{
    @apply bg-light-50 flex-col;
}
.left>div>div:first-child{
    @apply font-bold text-5xl text-light-50 mb-4;
}
.left>div>div:last-child{
    @apply text-gray-200 text-sm;
}
.right .title{
    @apply mb-5 font-bold text-3xl text-gray-800;
}
.right>div{
    @apply flex items-center justify-center my-5 text-gray-300 space-x-2;
}
.right .line{
    @apply h-[1px] w-16 bg-gray-200;
}
</style>