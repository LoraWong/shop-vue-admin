
export const setItem = (key, value) => {
  // 判断数据类型：基本数据类型、复杂数据类型
  if (typeof value === 'object') {
    // 复杂数据类型 转换 JSON格式
    value = JSON.stringify(value)
  }
  localStorage.setItem(key, value)
}
// 获取数据
export const getItem = (key) => {
  const data = localStorage.getItem(key)
  // 判断是否为 JSON 格式（比较麻烦，不管是不是  JSON 格式 都转换，用 try catch 捕获错误
  try {
    return JSON.parse(data)
  } catch (error) {
    // 如果不是 JSON 格式，转换出错，则直接返回 data
    return data
  }
}
// 删除指定数据
export const removeItem = (key) => {
  localStorage.removeItem(key)
}

// 删除所有数据
export const removeAllItem = (key) => {
  localStorage.clear(key)
}
