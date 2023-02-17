<template>
  <el-form v-if="model" ref="formTarget" :validate-on-rule-change="false" v-bind="$attrs" :rules="rule" :model="model" :label-width="labelWidth">
    <!-- <el-row> -->
    <!--不循环row，直接循环col，放不下会自动往下换行。-->

    <template v-for="(item, index) in formItems" :key="item.key || index">
      <!-- <el-col v-bind="item.ItemColLayout || colLayout"> -->
      <el-form-item v-if="!item.isHidden" :label="item.label" :prop="item.prop">
        <!-- input -->
        <el-input v-if="item.type === 'input'" v-model="model[item.prop!]" :placeholder="item.placeholder" v-bind="item.attrs">
          <template v-if="item.inputOptions?.prependText" #prepend>{{ item.inputOptions.prependText }}</template>
          <template v-else-if="item.inputOptions?.appendText" #append>{{ item.inputOptions.appendText }}</template>
        </el-input>
        <!-- select -->
        <el-select v-else-if="item.type === 'select'" v-model="model[item.prop!]" :placeholder="item.placeholder" v-bind="item.attrs">
          <el-option
            v-for="option in item.childrenOptions.dataArr"
            :key="option[item.childrenOptions.keyOption!.key!] || option[(item.childrenOptions.keyOption as selectKeyOption).value!]"
            :value="option[(item.childrenOptions.keyOption as selectKeyOption).value!]"
            :label="option[item.childrenOptions.keyOption!.label]"
          ></el-option>
        </el-select>
        <!-- radio -->
        <el-radio-group v-else-if="item.type === 'radio'" v-model="model[item.prop!]" v-bind="item.attrs">
          <el-radio
            v-for="option in item.childrenOptions.dataArr"
            :key="option[item.childrenOptions.keyOption!.key!] || option[item.childrenOptions.keyOption!.label]"
            :label="option[item.childrenOptions.keyOption!.label]"
            >{{ option[(item.childrenOptions.keyOption as radioKeyOption).radioText!] }}</el-radio
          >
        </el-radio-group>
        <!-- upload组件 -->
        <el-upload
          v-else-if="item.type === 'upload'"
          v-bind="item.uploadAttrs"
          :on-preview="onPreview"
          :on-remove="onRemove"
          :on-success="onSuccess"
          :on-error="onError"
          :on-progress="onProgress"
          :on-change="onChange"
          :before-upload="beforeUpload"
          :before-remove="beforeRemove"
          :on-exceed="onExceed"
        >
          <slot :name="item.UploadSlotName && item.UploadSlotName.uploadArea"></slot>
          <template #tip>
            <slot :name="item.UploadSlotName && item.UploadSlotName.uploadTip"></slot>
          </template>
        </el-upload>
        <!-- 富文本 editor组件 -->
        <div id="editor" v-else-if="item.type === 'editor'"></div>
        <!-- 插槽 -->
        <slot v-else-if="item.type === 'slot'" :name="item.slotName"></slot>
        <!-- 其他组件 -->
        <component v-else :is="`el-${item.type}`" v-bind="item.attrs" v-model="model[item.prop!]"></component>
      </el-form-item>
      <!-- </el-col> -->
    </template>
    <!--  表单操作项-->
    <el-form-item>
      <slot name="action" :formRef="formTarget" :model="model"></slot>
    </el-form-item>
    <!-- </el-row> -->
  </el-form>
</template>

<script lang="ts">
const ON_PREVIEW = 'on-preview'
const ON_REMOVE = 'on-remove'
const ON_SUCCESS = 'on-success'
const ON_PROGRESS = 'on-progress'
const ON_ERROR = 'on-error'
const ON_CHANGE = 'on-change'
const BEFORE_UPLOAD = 'before-upload'
const BEFORE_REMOVE = 'before-remove'
const ON_EXCEED = 'on-exceed'
</script>

<script setup lang="ts">
import { PropType, ref, onMounted, watch, nextTick } from 'vue'
import { IFormItem, IForm, selectKeyOption, radioKeyOption } from './types'
import cloneDeep from 'lodash/cloneDeep'
import type { ElForm } from 'element-plus'
import E from 'wangeditor'

const props = defineProps({
  // 表单配置项
  formItems: {
    type: Array as PropType<IFormItem[]>,
    required: true,
  },
  // 表单值
  labelWidth: {
    type: Number,
    default: () => 100,
  },
  // 表单宽度(响应式)
  colLayout: {
    type: Object,
    default: () => ({
      xl: 6, // ≥1920px
      lg: 8, // ≥1200px
      md: 12, // ≥992px
      sm: 24, // ≥768px
      xs: 24, // <768px
    }),
  },
  // 用户自定义上传方法
  httpRequest: {
    type: Function,
  },
})

const emits = defineEmits([ON_PREVIEW, ON_REMOVE, ON_SUCCESS, ON_PROGRESS, ON_ERROR, ON_CHANGE, BEFORE_UPLOAD, BEFORE_REMOVE, ON_EXCEED])

/**
 * @description: 初始化表单
 * 1. 表单验证规则 和 双向数据绑定
 * 从 formItems中取出 需要绑定的 model值和rule值
 * 2. 创建编辑器
 */
// 表单验证规则（根据根据传入的option 生成一个 符合rules值的数据结构
let rule = ref<any>(null)
// 双向绑定数据源（v-model不能绑定prop，因此需要根据传入的option生成一个响应式的数据
let model = ref<any>(null)
// 表单实例
const formTarget = ref<InstanceType<typeof ElForm> | null>(null)
// 编辑器实例
let editor

const initForm = () => {
  if (props.formItems && props.formItems.length) {
    let r: any = {}
    let m: any = {}

    props.formItems.forEach((item: IFormItem) => {
      if (item.prop) {
        r[item.prop] = item.rules
        m[item.prop] = item.value
      }
      // 初始化编辑器
      if (item.type === 'editor') {
        initEditor(item)
      }
    })

    // 需要深拷贝，否则深层数据对象会相互影响
    model.value = cloneDeep(m)
    rule.value = cloneDeep(r)
  }
}

/**
 * @description: 初始化编辑器
 */
const initEditor = (item: IFormItem) => {
  nextTick(() => {
    const editorElements: HTMLElement | null = document.getElementById('editor')
    if (editorElements) {
      editor = new E('#editor')
      editor.config.placeholder = item.placeholder!
      editor.create()
      // 初始化富文本的内容
      // 初始化内容
      editor.txt.html(item.value)
      // 输入内容后保存
      editor.config.onchange = (newHtml: string) => {
        console.log(newHtml)
        model.value[item.prop!] = newHtml
      }
    }
  })
}

watch(
  () => props.formItems,
  (newVal) => {
    console.log(props.formItems)
    initForm()
    console.log(props.formItems)
    console.log(model.value)
  },
  { immediate: true, deep: true }
)

/**
 * @description: 重置表单
 * （form表单中的 resetFields方法只能重置 表单元素的值
 * 重置 editor 的内容
 * 暴露该方法，父组件可以通过组件实例拿到该方法
 */
const resetFields = () => {
  // 重置element-plus的表单
  formTarget.value!.resetFields()
  // 重置富文本编辑器的内容
  // 获取到富文本的配置项
  if (props.formItems && props.formItems.length) {
    let editorItem = props.formItems.find((item) => item.type === 'editor')!
    if (editorItem) {
      editor.txt.html(editorItem.value)
    }
  }
}

// 表单验证方法
let getValidate = () => {
  return formTarget.value!.validate
}
// 获取表单数据
let getFormData = () => {
  return model.value
}

// 分发方法
defineExpose({
  resetFields,
  getValidate,
  getFormData,
})

// bug: upload组件的插槽配置，需要通过formItems传入自定义插槽名字
// bug: 增加 el-row el-col布局
/**
 * @description: upload组件方法
 */
let onPreview = (file: File) => {
  emits(ON_PREVIEW, file)
}
let onRemove = (file: File, fileList: FileList) => {
  emits(ON_REMOVE, { file, fileList })
}

let onSuccess = (response: any, file: File, fileList: FileList) => {
  // 上传图片成功 给表单上传项赋值
  // bug: 多个upload组件，如何识别是哪个upload
  let uploadItem = props.formItems.find((item) => item.type === 'upload')!
  model.value[uploadItem.prop!] = { response, file, fileList }
  emits(ON_SUCCESS, { response, file, fileList })
}

let onError = (err: any, file: File, fileList: FileList) => {
  console.log('🚀 ~ file: index.vue:174 ~ onError ~ file', file)
  emits(ON_ERROR, { err, file, fileList })
}
let onProgress = (event: any, file: File, fileList: FileList) => {
  emits(ON_PROGRESS, { event, file, fileList })
}
let onChange = (file: File, fileList: FileList) => {
  emits(ON_CHANGE, { file, fileList })
}
let beforeUpload = (file: File) => {
  emits(BEFORE_UPLOAD, file)
}
let beforeRemove = (file: File, fileList: FileList) => {
  emits(BEFORE_REMOVE, { file, fileList })
}
let onExceed = (files: File, fileList: FileList) => {
  emits(ON_EXCEED, { files, fileList })
}
</script>

<style lang="scss" scoped>
#editor {
  z-index: 5;
}
</style>
