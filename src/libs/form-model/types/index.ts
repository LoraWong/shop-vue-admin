// 表单配置项

import {Rule} from './rule'
import { CSSProperties } from 'vue'


export interface IFormItem {
  // 表单元素类型
  type: 'cascader' | 'checkbox' | 'checkbox-group' | 'checkbox-button' | 'color-picker' |
  'date-picker' | 'input' | 'input-number' | 'radio' | 'radio-group' | 'radio-button' | 'rate' |
  'select' | 'option' | 'slider' | 'switch' | 'time-picker' | 'time-select' |
  'transfer' | 'upload' | 'editor' | 'slot',

  key?: string | number,
  // 表单值
  value?: any,
  // 表单label
  label?: string | number,
  // 表单标识
  prop: string,
  // 验证规则(element表单验证基于一个第三方库, 直接使用第三方库定义的接口 )
  rules?: Rule,
  // 表单占位符
  placeholder?: string,
  //type为slot时， 插槽名称
  slotName?: string,
  // 组件联动, 隐藏表单元素的条件
  // 例如， {order: 0}，order值为0时，隐藏该item
  isHiddenObj: object,
  // 表单元素的特有属性(很多，先写几个常用的，以后可以再补充)
  attrs?: {
    clearable?: boolean,
    showPassword?: boolean,
    disabled?: boolean,
    // 是否为行内样式
    inline?: boolean,
    size?: 'large' | 'default' | 'small',
    // css样式
    style?: CSSProperties
  },
  // 表单元素的子元素配置（如 select、checkbox
  childrenOptions: ChildrenOptions,
  inputOptions: InputOptions,
  // 处理 upload方法和属性
  uploadAttrs?: {
    action: string,
    headers?: object,
    method?: 'post' | 'put' | 'patch',
    multiple?: boolean,
    data?: any,
    name?: string,
    withCredentials?: boolean,
    showFileList?: boolean,
    drag?: boolean,
    accept?: string,
    thumbnailMode?: boolean,
    fileList?: any[],
    listType?: 'text' | 'picture' | 'picture-card',
    autoUpload?: boolean,
    disabled?: boolean,
    limit?: number,
  },
  // upload插槽名称
  UploadSlotName?: UploadSlotName,
  // item里面的插槽
  headerSlot: string,
  footerSlot: string
}

interface UploadSlotName {
  uploadArea?: string,
  uploadTip?: string,
}

export interface ChildrenOptions {
  // 数据
  dataArr: [],
  // optionArr和配置对应的字段名
  keyOption?: selectKeyOption | radioKeyOption
}


export interface selectKeyOption {
  value: any,
  label: string,
  key?: string | number,
}

export interface radioKeyOption {
  label: string,
  key?: string | number,
  // radio的文本
  radioText?: string,
}

interface InputOptions {
  // input插槽内容
  // 文本插槽
  prependText?: string | number,
  appendText?: string | number,  
  // 自定义插槽，使用函数返回，再用v-html插入DOM中
  prependCallback?: ( ) => any,
  appendCallback?: ( ) => any
}


export interface IForm {
  formItems: IFormItem[]
  labelWidth?: string
}
