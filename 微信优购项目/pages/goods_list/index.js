// pages/goods_list/index.js
import {
  request
} from "../../request/index.js"
import regeneratorRuntime from '../../lib/runtime/runtime'
/* 
  1  用户上划  滚动条触底，开始加载下一页数据‘
     1 找到滚动条触底事件
     2  判断是否有下页数据，如果没有就提示用户没了，有就加载
         1  获取到总页数   只有总条数   
             总页数  =  Math.ceil(总条数  /  页容量)
         2   获取当前页码   已有 pagenum: 1,
         3  判断当前页面是否大于等于总页数
            如果等于总页数，就是没有数据了，否则就还有数据
      3  如果还有下一页数据
        1  当前页面++
        2  重新发送请求
        3  数据请求回来    要对data中原来的数据进行 拼接
*/
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: [{
        id: 0,
        value: "综合",
        isActive: true
      },
      {
        id: 1,
        value: "销量",
        isActive: false
      },
      {
        id: 2,
        value: "价格",
        isActive: false
      }
    ],
    //  商品列表数据
    goodsList:[]
  },
  // 接口要得参数
  QueryParams: {
    query: "",
    cid: "",
    pagenum: 1,
    pagesize: 10
  },
  // 总页数
  totalPages:1,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options)
    this.QueryParams.cid = options.cid;
    this.getGoodsList();
  },

  //  获取商品列表数据
  async getGoodsList() {
    const res = await request({
      url: "/goods/search",
      data: this.QueryParams
    });
    //  获取商品总条数
    const total = res.total;
    //   计算总页数    总页数  =  Math.ceil(总条数  /  页容量)
    this.totalPages=Math.ceil(total/this.QueryParams.pagesize);
    // console.log(this.totalPages)
    this.setData({
      // 拼接的数组
      goodsList:[...this.data.goodsList,...res.goods]
    })
    // console.log(res)
  },




  //  标题的点击事件   从子组件传递过来的
  handleTabsItemChange(e) {
    // console.log(e)
    const {
      index
    } = e.detail;
    // 修改原数组
    let {
      tabs
    } = this.data;
    tabs.forEach((v, i) => {
      i === index ? v.isActive = true : v.isActive = false
    });
    //3  赋值到data中
    this.setData({
      tabs
    })
  },

  //  监听用户滑动触底事件
  onReachBottom(){
    //  1  判断还有没有下一页数据
    if(this.QueryParams.pagenum>=this.totalPages){
      // 没有下一页数据
      //  console.log('%c'+"没有下一页数据","color:red;font-size:100px;background-image:linear-gradient(to right,#0094ff,pink)");
      wx.showToast({ title: '没有下一页数据' });
        
    }else{
      // 还有下一页数据
      //  console.log('%c'+"有下一页数据","color:red;font-size:100px;background-image:linear-gradient(to right,#0094ff,pink)");
      this.QueryParams.pagenum++;
      this.getGoodsList();
    }
  }
})