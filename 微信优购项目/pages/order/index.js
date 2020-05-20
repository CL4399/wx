// pages/order/index.js
/* 
    1  页面被打开的时候  onShow
      0  onShow 不同于onLand 无法在形参上接收 options参数
         判断缓存中有没有token  
           没有跳转到授权页面
           有就直接往下进行
      1  获取url上的参数type
      2  根据type 获取订单数据
      3  渲染页面
    2  点击不同的标题的时候   重新发送请求来获取和渲染数据
*/
import {
  request
} from "../../request/index.js"
import regeneratorRuntime from '../../lib/runtime/runtime'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orders: [],
    tabs: [{
        id: 0,
        value: "综合",
        isActive: true
      },
      {
        id: 1,
        value: "待付款",
        isActive: false
      },
      {
        id: 2,
        value: "待发货",
        isActive: false
      },
      {
        id: 3,
        value: "退款/退货",
        isActive: false
      }
    ]
  },
  onShow(options) {
    /* 1 获取当前小程序的页面栈（内存中的数组）  
      每打开一个新页面，都会往小程序的页面栈中推入一个当前页面 
      长度最大是10个页面
    */
    const token = wx.getStorageSync("token");
    if (!token) {
      wx.navigateTo({
        url: '/pages/auth/index'
      });
      return;
    }
    let pages = getCurrentPages();
    //  2  数组中 索引最大的页面就是当前页面
    let currentPage = pages[pages.length - 1];
    // console.log(currentPage.options)
    //  3  获取url上的type参数
    const {
      type
    } = currentPage.options
    this.getOrders(type)

  },
  //  获取订单列表的方法
  async getOrders(type) {
    const res = await request({
      url: "my/orders/all",
      data: {
        type
      }
    })
    this.setData({
      orders: res.orders
    })
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
})