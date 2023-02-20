import { defineAsyncComponent } from 'vue'


/**
 * 编写一个插件，用于批量自动注册全局组件
 */
export default {
  install(app) {
    // 通过 app.component() 注册一到多个全局组件
    // app.component('m-svg-icon', SvgIcon), app.component('m-popup', popup)

    // vite 通用组件自动化注册
    // 1. 获取当前路径下 所有的 .vue文件（组件模块
    const components = import.meta.glob('./*/index.vue')
    // 2. 遍历 获取到的 所有 组件模块
    // Object.entries() 方法返回一个给定对象自身可枚举属性的键值对数组
    for (const component of Object.entries(components)) {
      const [fullPath, fn] = component
      // 3. 使用 app.component 注册组件
      // "./popup/index.vue"  截取出 文件名
      const componentName = 'm-' + fullPath.replace('./', '').split('/')[0]
      // 异步导入组件
      app.component(componentName, defineAsyncComponent(fn))
    }
  },
}
