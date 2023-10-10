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
2. 获取文章列表数据
3. 展示到指定的标签结构中
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
    document.querySelector('.total-count').innerHTML =  `共${totalCount}条`
}
setArtileList()



/**
 * TODO:内容管理- 筛选功能
1.设置频道列表数据
2.监听筛选条件改变，保存查询信息到查询参数对象
3.点击筛选时，传递查询参数对象到服务器
4.获取匹配数据，覆盖到页面展示
*/
// 1.设置频道列表数据
async function setChannleList() {
  const res = await axios({
    url: '/v1_0/channels'
  })
  const htmlStr = `<option value="" selected="">请选择文章频道</option>` + res.data.channels.map(item => `<option value="${item.id}">${item.name}</option>`).join('')
  document.querySelector('.form-select').innerHTML = htmlStr
}
setChannleList()
//2.监听筛选条件改变，保存查询信息到查询参数对象(条件都用1个对象来管理)
//差选状态标记数字 => change事件 => 绑定到查询参数对象上
document.querySelectorAll('.form-check-input').forEach(radio =>{
  radio.addEventListener('change' , e=>{
    console.log(e.target.value) 
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