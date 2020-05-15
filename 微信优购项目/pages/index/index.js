//Page Object
//  引入  用来发送请求的  封装的微信请求的方法(引用路径一定要写全)
import {
  request
} from "../../request/index.js"
Page({
  data: {
    // 轮播图数组
    swiperList: [],
    // 导航菜单数组
    catesList: [],
    // 楼层数据
    floorList: []
  },
  //页面开始加载 就会触发
  onLoad: function (options) {
    // 发送异步请求获取轮播图数据  优化请求 通过es6的promise解决
    /* wx.request({
      url: 'https://api-hmugo-web.itheima.net/api/public/v1/home/swiperdata',
      success: (result)=>{
        this.setData({
          swiperList: result.data.message
        })
      }
    }); */
    // 调用 获取轮播图数据的方法
    this.getSwiperList();
    // 调用 获取导航菜单数据的方法
    this.getCatesList();
    // 调用 获取楼层数据的方法
    this.getFloorList();

  },
  //   获取轮播图数据
  getSwiperList() {
    request({
        url: "/home/swiperdata"
      })
      .then(result => {
        this.setData({
          swiperList: result
        })
      })
  },
  //    获取导航菜单数据
  getCatesList() {
    request({
      url: "/home/catitems"
    })
    .then(result => {
      // console.log(result)
      this.setData({
        catesList: result
      })
    })
  },
   //    获取楼层数据
   getFloorList() {
    request({
      url: "/home/floordata"
    })
    .then(result => {
      // console.log(result)
      this.setData({
        floorList: result
      })
    })
  }
});