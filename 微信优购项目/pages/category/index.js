// pages/category/index.js
import {
  request
} from "../../request/index.js"
import regeneratorRuntime from '../../lib/runtime/runtime'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 左侧的菜单数据
    leftMenuList: [],
    // 右侧的商品数据
    rightContent: [],
    //  被点击的左侧菜单索引
    currentIndex: 0,
    //  右侧内容的滚动条距离顶部的距离
    scrollTop: 0
  },
  // 接口的返回数据
  Cates: [],

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    /*  web中的本地存储和小程序的本地存储的区别
          (1 代码不一样
              web:   存 localStorage.setItem("key","value")
                     取 localStorage.getItem("key")
            小程序:  存  wx.setStorageSync("key", "value")
                    取 wx.getStorageSync("key");
          (2  存的时候有没有做类型转换
                web： 不管存入的是什么类型的数据，最终都会调用下toString()  把数据变成字符串，再储存          
                小程序：不存在类型转换这个功能，存什么类别的数据，获取的就是什么类别的数据      
      存储数据{time:Date.now(),data:[...]}
      1  发送请求之前 先判断本地存储中是否有旧的数据，如果没有就发送请求
         如果有旧数据且没过期，就使用旧的数据
      2  获取本地存储中的数据 （小程序中也是存在本地存储技术的）
    */
    const Cates = wx.getStorageSync("cates");
    // 判断
    if (!Cates) {
      // 不存在， 发送请求数据
      this.getCates();
    } else {
      // 有旧的数据了  判断数据是否过期，[暂时定义一个过期时间(10s)]
      if (Date.now() - Cates.time > 1000 * 60) {
        // 如果当前时间减去Cares.time的差超过了60s就重新发送请求
        this.getCates();
      } else {
        //否则可以使用旧的数据
        this.Cates = Cates.data;
        //构造左侧菜单数据
        let leftMenuList = this.Cates.map(v => v.cat_name);
        //构造右侧的商品数据 此时的索引是写死了的（索引为0）
        let rightContent = this.Cates[0].children
        this.setData({
          leftMenuList,
          rightContent
        })
      }
    }
  },
  // 获取分类数据
  async getCates() {
    /* request({
        url: "/categories"
      })
      .then(res => {
        //console.log(res)
        this.Cates = res.data.message;
        //  把接口数据存储到本地存储中
        wx.setStorageSync("cates", {
          time: Date.now(),
          data: this.Cates
        })


        //构造左侧菜单数据
        let leftMenuList = this.Cates.map(v => v.cat_name);
        //构造右侧的商品数据 此时的索引是写死了的（索引为0）
        let rightContent = this.Cates[0].children
        this.setData({
          leftMenuList,
          rightContent
        })
      }) */

      //   1 使用ES7的asycn  await来发送请求
      const res = await request({url: "/categories"});
      this.Cates = res;
        //  把接口数据存储到本地存储中
        wx.setStorageSync("cates", {
          time: Date.now(),
          data: this.Cates
        })


        //构造左侧菜单数据
        let leftMenuList = this.Cates.map(v => v.cat_name);
        //构造右侧的商品数据 此时的索引是写死了的（索引为0）
        let rightContent = this.Cates[0].children
        this.setData({
          leftMenuList,
          rightContent
        })

  },
  //左侧菜单的点击事件
  handleItemTap(e) {
    // console.log(e)
    /* 
      1  获取被点击的标题上的索引
      2  给data里面的currentIndex赋值
      3  根据不同的索引来渲染右侧的商品内容
    */
    const {
      index
    } = e.currentTarget.dataset;
    //构造右侧的商品数据
    let rightContent = this.Cates[index].children
    this.setData({
      currentIndex: index,
      rightContent,
      //  重新设置  右侧内容的距离顶部的距离
      scrollTop: 0

    })
  }
})