// 内容管理 -功能筛选对象 
const queryObj = {
  status: '', // 文章状态（1-待审核，2-审核通过）空字符串-全部
  channel_id: '', // 文章频道 id，空字符串-全部
  page: 1, // 当前页码
  per_page: 2 // 当前页面条数
}
// 文章总条数
let totalCount = 0

/**
TODO: 获取文章列表
1. 准备查询参数对象 
  > 通过统一定义一个对象， 对象中存储的就是每次需要更改的筛选条件

2. 获取文章列表数据
  > 通过上述的筛选条件对象 作为参数 使用axios函数发送到服务器端
  > 然后使用常量res接受(这里需要使用async 和 await来联合接受axios的内容)
  > 将接受的内容再通过innerHTML返回到页面

3. 展示到指定的标签结构中
  > 需要用到map来进行转换（得到的是response对象） 通过
 */

//2. 获取文章列表数据
async function setArtileList(){
   const res = await axios({
    url: '/v1_0/mp/articles',
    params: queryObj
   })
   console.log(res)
   //3. 展示到指定的标签结构中
   const htmlStr = res.data.results.map(item => `<tr>
      <td>
        <img src="${item.cover.type === 0 ? `https://img2.baidu.com/it/u=2640406343,1419332367&amp;fm=253&amp;fmt=auto&amp;app=138&amp;f=JPEG?w=708&amp;h=500`: item.cover.images[0]}" alt="">
      </td>
      <td>${item.title}</td>
      <td>
        ${item.status === 1 ? `<span class="badge text-bg-primary">待审核</span>` : `<span class="badge text-bg-success">审核通过</span>`}
      </td>
      <td>
        <span>${item.pubdate}</span>
      </td>
      <td>
        <span>${item.read_count}</span>
      </td>
      <td>
        <span>${item.comment_count}</span>
      </td>
      <td>
        <span>${item.like_count}</span>
        </td>
        <td data-id="${item.id}">
          <i class="bi bi-pencil-square edit"></i>
          <i class="bi bi-trash3 del"></i>
        </td>
        </tr>`).join('')
        document.querySelector('.art-list').innerHTML = htmlStr
        //获取总文章数 并展示
        totalCount = res.data.total_count
        // 当前页
        document.querySelector('.page-now').innerHTML = `第${res.data.page}页`
        document.querySelector('.total-count').innerHTML =  `共${totalCount}条`
        // 关联文章 id 到删除图标
  }
setArtileList()



/**
 * TODO:内容管理- 筛选功能
1.设置频道列表数据
  > 通过async 和 await标记的axios请求发送到服务器端，然后获取所有的标签 通过常量接收 最后再回显到页面中
2.监听筛选条件改变，保存查询信息到查询参数对象
  > change事件, 查看是否改变了当前的状态
3.点击筛选时，传递查询参数对象到服务器
4.获取匹配数据，覆盖到页面展示
*/
// 1.设置频道列表数据
async function setChannleList() {
  const res = await axios({
    url: '/v1_0/channels'
  })
  const htmlStr = `<option value="" selected="">请选择文章频道</option>` + 
  res.data.channels.map(item => 
    `<option value="${item.id}">${item.name}</option>`)
    .join('') 
  document.querySelector('.form-select').innerHTML = htmlStr
}
setChannleList()
//2.监听筛选条件改变，保存查询信息到查询参数对象(条件都用1个对象来管理)
//差选状态标记数字 => change事件 => 绑定到查询参数对象上
document.querySelectorAll('.form-check-input').forEach(radio =>{
  radio.addEventListener('change' , e=>{
    console.log(e.target.value)  //获取的是id
    //得到筛选的状态 ，赋值给对象的属性
    queryObj.status = e.target.value
  })
})
//筛选频道id -> change事件 -> 绑定到对象上
document.querySelector('.form-select').addEventListener('change', e =>{
  console.log(e.target.value)
  queryObj.channel_id = e.target.value
})

//3.点击筛选时，传递查询参数对象到服务器
document.querySelector('.sel-btn').addEventListener('click', () => {
  //获取匹配的数据 ，然后展示到页面中
  setArtileList()
})

/**
 * TODO: 内容管理- 分页管理功能
1.保存并设置文章总条数
2.点击下一页，做临界值判断，并切换页码参数请求最新数据
3.点击上一页，做临界值判断，并切换页码参数请求最新数据
 */
//2. 点击下一页，做临界值判断，并切换页码参数请求最新数据
document.querySelector('.next').addEventListener('click', e =>{
  if(queryObj.page < Math.ceil(totalCount / queryObj.per_page )){ //向上取整
    queryObj.page++
    //传给服务器
    setArtileList()
  }
})
// 3.点击上一页，做临界值判断，并切换页码参数请求最新数据
document.querySelector('.last').addEventListener('click', e =>{
  if(queryObj.page > 1){ //向上取整
    queryObj.page--    //传给服务器
    setArtileList()
  }
})

/**
 * TODO: 内容管理- 删除功能
 * 
1. 关联文章 id 到删除图标 在刷新文章列表的时候关联
2. 点击删除时，获取文章 id
3. 调用删除接口，传递文章 id 到服务器
4. 重新获取文章列表，并覆盖展示
 */
document.querySelector('.art-list').addEventListener('click', async e =>{
  //判断点击的内容是否为删除
  if(e.target.classList.contains('del')){
    const delId =e.target.parentNode.dataset.id
    console.log("删除元素:" ,delId)
    //3. 调用删除接口，传递文章 id 到服务器
    const res = await axios({
      url: `/v1_0/mp/articles/${delId}`,
      method: 'DELETE'
    })
    console.log(res)
    //如果删除的只剩最后一个页的最后一个条时， 需要自动向前翻页
    // > 获取表格里的dom元素
    const children = document.querySelector('.art-list').children
    if(children.length === 1 && queryObj.page !== 1) {
      queryObj.page--
    }
    setArtileList() // 重新刷新删除的内容

  }

})


/**
 * TODO: 内容管理-编辑文章-回显
1. 页面跳转传参（URL 查询参数方式）
2. 发布文章页面接收参数判断（共用同一套表单）
3. 修改标题和按钮文字
4. 获取文章详情数据并回显表单
 */

//1. 点击编辑 页面跳转传参（URL 查询参数方式）
document.querySelector('.art-list').addEventListener('click', e =>{
  if(e.target.classList.contains('edit')){
    //获取编辑的文章id
    const artId = e.target.parentNode.dataset.id
    console.log("需要编辑的id: " + artId)
    //跳转
    // 那个页面如何知道显示哪一张需要将唯一的id传过去
    location.href = `../publish/index.html?id=${artId}`
    //3.  发布文章页面接收参数判断（共用同一套表单）
    //在发布文章的js中实现
  }
})
