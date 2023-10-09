//TODO:发布文章的富文本编辑器

/**
 * TODO: 设置下拉菜单
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
