/*
    1   发送请求获取商品数据
    2   点击轮播图  预览大图
        1   给轮播图绑定点击事件
        2   调用小程序的API  previewImage
    3   点击加入购物车
          1  绑定点击事件
          2  获取缓存中的购物车数据  数组格式的
          3  先判断  当前商品是否已经存在于购物车里面
              如果存在  修改商品数据 （执行购物车数量++）重新把购物车数组 填充在缓存中
              如果是第一次添加，就说明商品不存在于购物车数组中，直接给购物车数组添加一个新元素（新元素要自带一个购买数量属性） 然后重新把购物车数组 填充在缓存中
          4  根据当前操作弹出提示
    4   商品收藏
        1  页面onShow的时候  加载 缓存中的商品收藏的数据
        2   判断当前商品是不是被收藏的  是就改变页面的收藏图标
        3   点击商品收藏按钮
            1  判断该商品是否在缓存数组中
            2  已经存在就删除
            3  没有存在  把商品添加到收藏数组中 同时存入缓存中
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
    goodsObj: {},
    //  商品是否被收藏过
    isCollect: false
  },

  //  商品全局对象
  GoodsInfo: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function () {
    let pages = getCurrentPages();
    let currentPage = pages[pages.length - 1];
    let options = currentPage.options;

    // 拿到 从商品分类页面传过来的商品对应的id
    const {
      goods_id
    } = options;
    // console.log(goods_id)
    this.getGoodsDetail(goods_id);
  },
  //   获取商品详情数据
  async getGoodsDetail(goods_id) {
    const goodsObj = await request({
      url: "/goods/detail",
      data: {
        goods_id
      }
    });

    this.GoodsInfo = goodsObj;

    // 1 获取缓存中的商品收藏的数组
    let collect = wx.getStorageSync("collect") || [];
    // 2 判断当前商品是否被收藏
    let isCollect = collect.some(v => v.goods_id === this.GoodsInfo.goods_id);
    // console.log(goodsObj)
    this.setData({
      goodsObj: {
        pics: goodsObj.pics,
        goods_name: goodsObj.goods_name,
        goods_price: goodsObj.goods_price,
        /* 
          iphone部分手机 不识别 webp 图片格式
            (正常方式)最好找到后台，让他进行修改
            （这是临时方法)或者自己临时修改   确保后台存在1.webp 这种格式的图片，通过简单的字符串替换，变成1.jpg

          */
        //goods_introduce: goodsObj.goods_introduce
        goods_introduce: goodsObj.goods_introduce.replace(/\.webp/g, '.jpg')
      },
      isCollect
    })
  },

  //   点击轮播图  放大预览图
  handlePreviewImage(e) {
    //  1  先构造要预览的图片数组
    const urls = this.GoodsInfo.pics.map(v => v.pics_mid);
    //  2  点击图片后接收传递过来的当前图片的url  
    const current = e.currentTarget.dataset.url;
    wx.previewImage({
      current, // 当前显示图片的http链接
      urls // 需要预览的图片http链接列表
    })
  },

  //   点击加入购物车
  handleCartAdd() {
    // 1  获取缓存中的购物车  数组
    /* 
       第一次获取是字符串格式，我们对他进行转换格式 || []
    */
    let cart = wx.getStorageSync("cart") || [];
    //  2  判断 商品对象是否存在于购物车数组中
    let index = cart.findIndex(v => v.goods_id === this.GoodsInfo.goods_id);
    if (index === -1) {
      // 3 不存在  第一次添加
      this.GoodsInfo.num = 1;
      //  在第一次添加商品的时候，给复选框添加一个属性，这样购物车显示的时候，一开始商品都是被选中的状态
      this.GoodsInfo.checked = true;
      cart.push(this.GoodsInfo);
    } else {
      // 4  已经存在购物车数组   执行数量++
      cart[index].num++;
    }
    //  5  把购物车重新添加进缓存中
    wx.setStorageSync("cart", cart);
    //  6  弹窗提示
    wx.showToast({
      title: '添加成功',
      icon: 'success',
      // mask 改为true  防止用户手抖  疯狂点击按钮（当这个为true时，用户要等1.5秒后才能继续点击）
      mask: true
    });
  },

  //   点击收藏按钮实现收藏
  handleCollect() {
    let isCollect = false;

    //  1  获取缓存中的商品收藏数组
    let collect = wx.getStorageSync("collect") || [];
    //  2  判断该商品是否被收藏过
    let index = collect.findIndex(v => v.goods_id === this.GoodsInfo.goods_id);
    //  3  当index不等于 -1 表示已经被收藏过了
    if (index !== -1) {
      //  能找到  表示已经收藏过了  在数组中删除
      collect.splice(index, 1);
      isCollect = false;
      wx.showToast({
        title: '取消成功',
        icon: 'success',
        mask: true
      });
    } else {
      //  没有收藏过
      collect.push(this.GoodsInfo);
      isCollect = true;
      wx.showToast({
        title: '收藏成功',
        icon: 'success',
        mask: true
      });
    }
    //  4  把这个数组存入缓存中
    wx.setStorageSync("collect", collect);
    //  5  修改data中的   isCollect
    this.setData({
      isCollect
    })
  }
})