export interface TableOptions {
  type?: 'slot' | 'action' | 'editable' | 'customText',
  prop?: string, // 字段名称
  label: string,
  isHidden?: boolean; // 是否显示在表格当中
  slotName?: string, // 自定义列模板的插槽名
  customTextCallback?: (row: [])=>any,  // 自定义文本，以函数形式返回
  // 是否是操作项
  // action?: boolean,
  // 是否可以编辑
  // editable?: boolean,
  // 其他配置
  attrs?: {
    // 对应列的宽度
  width?: string | number,
  // 对齐方式
  align?: 'left' | 'center' | 'right',
  }

}