/**
 * TODO: 获取频道列表， 并且回显
 * 设置下拉菜单
 * 
 * 1.1 获取频道列表数据
 * 1.2 展示到下拉菜单中
 * 
 */
//1 获取下拉列表数据
async function setChannleList(){
  const res = await axios({
    url: '/v1_0/channels'
  })
  // console.log(res)
  const htmlStr = `<option value="" selected="">请选择文章频道</option>` + res.data.channels.map(item => `<option value="${item.id}">${item.name}</option>`).join('')
  //将得到的列表数据插入到之前的表单列表
  document.querySelector('.form-select').innerHTML = htmlStr
}
//运行网页后， 默认调用一次
setChannleList()

/**
 * TODO: 发布文章-封面设置
 * 步骤：
1. 准备标签结构和样式
2. 选择文件并保存在 FormData
3. 单独上传图片并得到图片 URL 地址
4. 回显并切换 img 标签展示（隐藏 + 号上传标签）
注意：图片地址临时存储在 img 标签上，并未和文章关联保存
 * 
 */

//1. 添加change事件 实现文章的上传
//选择文件并保存在 FormData
document.querySelector('.img-file').addEventListener('change' ,async (e)=>{
  const file = e.target.files[0] 
  const fd = new FormData()
  fd.append('image', file)

  // 3. 单独上传图片并得到图片 URL 地址
  const res = await axios({ 
    url: '/v1_0/upload',
    method: 'post',
    data: fd
  })
  console.log(res)
  //4. 回显并切换 img 标签展示（隐藏 + 号上传标签）
  const imgUrl = res.data.url
  document.querySelector('.rounded').src = imgUrl
  //实现显示
  document.querySelector('.rounded').classList.add('show')
  document.querySelector('.place').classList.add('hide')
})

//此时只是实现添加， 但是并没有实现点击重新切换封面
// 思路 : img点击 => 用js方式触发文件选择元素click 实现方法
document.querySelector('.rounded').addEventListener('click' ,()=> {
  //但是还是有bug ，如果重新切换 但是不点击， 那么就不会添加成功
  document.querySelector('.img-file').click()
})

/**
 * TODO: 发布文章-收集并保存
1. 基于 form-serialize 插件收集表单数据对象
2. 基于 axios 提交到服务器保存
3. 调用 Alert 警告框反馈结果给用户
4. 重置表单并跳转到列表页
 */
document.querySelector('.send').addEventListener('click',async (e)=> {
  if(e.target.innerHTML !== '发布') return;
  const form = document.querySelector('.art-form')
  const data = serialize(form, {hash: true, empty: true })
  
  //发布文章不需要id属性， id属性是修改时候用的
  delete data.id
  console.log(data)
  // 需要自己收集封面图片的地址 ， 并且保存到data对象中( 看对象文档， 里面的images属性放的地方)
  data.cover = {
    type: 1,
    images: [document.querySelector('.rounded').src]//获取的封面地址
  }
  //3. 调用 Alert 警告框反馈结果给用户
  //将容易出错的内容放到try中， 使用catch捕获
  try{
      //提交到服务器并保存
      const res = await axios({
        url: '/v1_0/mp/articles',
        method: 'post',
        data: data
      })
      console.log("文章内容" + res)
      myAlert(true, '发布成功') 
      form.reset()
      //4. 重置封面 按照上面添加的移除就可以了
      document.querySelector('.rounded').src = ''
      document.querySelector('.rounded').classList.remove('show')
      document.querySelector('.place').classList.remove('hide')  
      editor.setHtml('') //   // 富文本编辑器重置
      //5. 重置表单并跳转到列表页
      setTimeout(() => {
        location.href = '../content/index.html'
      },2000)
    } catch(error){
    myAlert(false, error.response.data.message)
  }
})
/**
 * TODO: 内容管理-编辑文章-回显
1. 页面跳转传参（URL 查询参数方式）
2. 发布文章页面接收参数判断（共用同一套表单）
3. 修改标题和按钮文字
4. 获取文章详情数据并回显表单
 */
//2. 发布文章页面接收参数判断（共用同一套表单）
//通过自调用函数
;(async function (){
    const paramsStr = location.search
    const params =new URLSearchParams(paramsStr)
    params.forEach(async (value, key)=> {
      console.log(value, key) // 得到id内容和 属性名id 
      //表示当前有要编辑的文章传入 
      //todo: 回显文章内容
      if(key === 'id'){
        // 3. 修改标题和按钮文字
        document.querySelector('.title span').innerHTML = '修改文章'
        document.querySelector('.send').innerHTML = '更新'
        // 4. 获取文章详情数据并回显表单
        const res = await axios({
          url: `/v1_0/mp/articles/${value}`
        })
        console.log(res)
        // 回显数据
        //组织我仅仅需要的数据对象， 为后续遍历做铺垫
        const dataObj = {
          channel_id: res.data.channel_id,
          title: res.data.title,
          rounded: res.data.cover.images[0],
          content: res.data.content,
          id: res.data.id
        }
        //遍历数据对象的属性，然后快速赋值
        Object.keys(dataObj).forEach(key =>{
          //封面图片需要设置
          if(key === 'rounded'){
            if(dataObj[key]){
              //有封面， 赋值
              document.querySelector('.rounded').src = dataObj[key]
              document.querySelector('.rounded').classList.add('show')
              document.querySelector('.place').classList.add('hide')
            }
          }
          //设置富文本内容
          else if(key === 'content'){
            editor.setHtml(dataObj[key])
          }else{
            //用数据对象的属性名， 作为标签name的选择器匹配赋值
            document.querySelector(`[name=${key}]`).value = dataObj[key]
          }

        })

      }
    })
})();

/**
 * TODO: 编辑-保存文章
 * 
1. 判断按钮文字，区分业务（因为共用一套表单）
2. 调用编辑文章接口，保存信息到服务器
3. 基于 Alert 反馈结果消息给用户
 */
document.querySelector('.send').addEventListener('click',async (e)=> {

  if(e.target.innerHTML !== '更新') return
  //收集修改文章
  const form = document.querySelector('.art-form')
  const data = serialize(form, {hash: true, empty: true })
  console.log(data)
  try{
    //2. 调用编辑文章接口，保存信息到服务器
    const res = await axios({
      url: `/v1_0/mp/articles/${data.id}`,
      method: 'PUT',
      data: {
        ...data, //将data中有的先匹配进去
        cover:{
          type: document.querySelector('.rounded').src ? 1: 0,
          images: [document.querySelector('.rounded').src]
        }
      }
    })
    console.log(res)
    //3. 基于 Alert 反馈结果消息给用户  
    myAlert(true, '更新成功')
    //跳转回去
    editor.setHtml('') //   // 富文本编辑器重置
    //5. 重置表单并跳转到列表页
    setTimeout(() => {
      location.href = '../content/index.html'
    },2000) 
  }
  catch (error){
    myAlert(false,error.response.data.message)
  }
})
