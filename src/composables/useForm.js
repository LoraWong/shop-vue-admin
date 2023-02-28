import { ref, reactive, computed } from 'vue'
import { toast } from '~/composables/util'

// 新增，修改
export function useForm(opt = {}) {
  // 表单部分
  const formDrawerRef = ref(null)
  const formRef = ref(null)
  const defaultForm = opt.form
  const form = reactive({})
  const rules = opt.rules || {}
  const editId = ref(0)
  const drawerTitle = computed(() => (editId.value ? '修改' : '新增'))

  // 交单提交
  const handleSubmit = () => {
    // 表单校验
    // json表单
    if (opt.component === 'm-form') {
      const validate = formRef.value.getValidate()
      if (!validate) return
      validate((valid) => {
        if (valid) {
          // const formData = formRef.value.getFormData()
          updateData(form)
        } else {
          toast('填写不合规，请按提示填写！')
        }
      })
    } else {
      // 非json 表单
      formRef.value.validate((valid) => {
        if (!valid) return
        updateData(form)
      })
    }
  }

  //   更新数据
  function updateData(formData) {
    formDrawerRef.value.showLoading()
    let body = {}
    if (opt.beforeSubmit && typeof opt.beforeSubmit == 'function') {
      body = opt.beforeSubmit({ ...formData })
    } else {
      body = formData
    }
    const fun = editId.value ? opt.update(editId.value, body) : opt.create(body)
    fun
      .then((res) => {
        toast(drawerTitle.value + '成功')
        // 修改刷新当前页，新增刷新第一页
        opt.getData(editId.value ? false : 1)
        formDrawerRef.value.close()
      })
      .finally(() => {
        formDrawerRef.value.hideLoading()
      })
  }

  // 重置表单
  function resetForm(row = false) {
    // if (formRef.value) formRef.value.clearValidate()
    // bug
    // if (formRef.value) formRef.value.resetFields()
    for (const key in defaultForm) {
      form[key] = row[key]
    }
    // test: 模拟异步请求
    // setTimeout(() => {
    //   form.desc = '100'
    //   form.stock = 500
    // }, 5000)
  }

  // 新增
  const handleCreate = () => {
    editId.value = 0
    resetForm(defaultForm)
    formDrawerRef.value.open()
  }

  // 编辑
  const handleEdit = (row) => {
    editId.value = row.id
    resetForm(row)
    formDrawerRef.value.open()
  }

  return {
    formDrawerRef,
    formRef,
    form,
    rules,
    editId,
    drawerTitle,
    handleSubmit,
    resetForm,
    handleCreate,
    handleEdit,
  }
}
