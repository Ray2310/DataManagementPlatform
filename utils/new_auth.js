//1. 判断有无权限访问， 如果没有那么就跳转到登录页面
// token我们将会存储到本地
const token = localStorage.getItem('token')
if(!token){
  //注意：前端只能判断 token 有无，而后端才能判断 token 的有效性
  location.href = '../login/index.html' 
}


/**
 * TODO:目标2：设置个人信息
 * 2.1 在 utils/request.js 设置请求拦截器，统一携带 token
 * 2.2 请求个人信息并设置到页面
 */
// 2.2 请求个人信息并设置到页面
axios({
  url: '/v1_0/user/profile'
}).then(result => {
  const username = result.data.name
  document.querySelector('.nick-name').innerHTML = username
})
