/**TODO: 
 * 目标1：验证码登录
 * 1.1 在 utils/request.js 配置 axios 请求基地址
 * 1.2 收集手机号和验证码数据
 * 1.3 基于 axios 调用验证码登录接口
 * 1.4 使用 Bootstrap 的 Alert 警告框反馈结果给用户
 */
 
//1.2 收集手机号和 验证码 数据: 点击事件
document.querySelector('.btn').addEventListener('click', ()=>{
  //使用收集元素的form-serialize对象 需要提前导入form-serialize.js
  const form = document.querySelector('.login-form')
  const data = serialize(form,{hash: true, empty: true})
  console.log(data) //成功获取
  
  //1.3 基于 axios 调用验证码登录接口 ,将数据提交到服务器
  const aja = axios({
    url: '/v1_0/authorizations',
    data: data,
    method: 'post'
  }).then(res =>{ // 之前在request.js中做了响应拦截器， 会直接返回response.data 我们只需要得到里面的结果， 所以将res.data.data.token 转换为res.data.token
    //TODO:跳转成功
    //通过自定义的alert方法实现弹出框的提示信息显示
    myAlert(true, '登录成功')
    console.log(res)
    // 登录成功之后，将token令牌 存储到本地 
    localStorage.setItem('token', res.data.token)
    //跳转到内容列表页
    //设置一个定时器， 延迟跳转。 
    setTimeout(() =>{
      location.href= '../content/index.html'
    }, 2000)

    
    //TODO:跳转失败， 异常行为
  }).catch(error =>{
    console.log(error.response.data.message) //返回错误信息
    //同时需要将内容返回到警告框
    myAlert(false, error.response.data.message)
  })
})


// second: 设置用户昵称等