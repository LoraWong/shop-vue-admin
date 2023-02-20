import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import store from './store'
import installElementPlus from './plugins/element'
import installElementPlusIcons from './plugins/element-icon'
import mLibs from './libs'
import 'virtual:windi.css'
import './permission'
import 'nprogress/nprogress.css'
import permission from '~/directives/permission.js'



const app = createApp(App)
app.use(store)
app.use(router)


installElementPlus(app)
installElementPlusIcons(app)

app.use(permission).use(mLibs)

app.mount('#app')
