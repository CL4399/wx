/*
  1  页面加载的时候
     1  从缓存中获取购物车数据 渲染到页面中
         这些数据都是checked属性为true的数据，也就是说是被选中的数据，并不是所有的数据
  2   微信支付
     1  企业账户
     2  企业账户的小程序后台中  必须 给开发者  添加上 白名单
       1  一个 app id  可以同时绑定多个开发者
       2  这些开发者就可以共用这个app id  和它的开发权限

*/


//  引入封装好的   showToast
import {
  showToast
} from "../../utils/asyncWx.js"
import regeneratorRuntime from '../../lib/runtime/runtime'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //   本地存储的地址信息
    address: {},
    //   本地存储中的购物车数组
    cart: [],
    //  总价格
    totalPrice: 0,
    //  总数量
    totalNum: 0
  },
  onShow() {
    //   1获取缓存中的收货地址
    const address = wx.getStorageSync("address");
    //   2获取缓存中的购物车数组
    let cart = wx.getStorageSync("cart") || [];
    //   3  过滤后的购物车数组   直接先把checked为true的过滤出来
    cart = cart.filter(v => v.checked);
    this.setData({
      address
    });
    //  调用设置购物车状态的方法
    //  总价格  总数量
    let totalPrice = 0;
    let totalNum = 0;

    cart.forEach(v => {
        totalPrice += v.num * v.goods_price;
        totalNum += v.num;
    });

    //  6  重新填充到data与本地缓存中
    this.setData({
      cart,
      totalPrice,
      totalNum,
      address
    });
  },

  //   点击结算按钮
  async handlePay() {
    // 1  判断收货地址
    const {
      address,
      totalNum
    } = this.data;
    if (!address.userName) {
      await showToast({
        title: "您还没有选择收货地址！"
      });
      return;
    }
    //  2  判断用户有没有选购商品
    if (totalNum === 0) {
      await showToast({
        title: "您还没有选购商品！"
      });
      return;
    }
    //  3  跳转到支付页面
    wx.navigateTo({
      url: '/pages/pay/index'
    });
  }
})


/* 
  旧版本（没优化的）   handleChooseAddress
//  1获取  权限状态
wx.getSetting({
  success: (result) => {
    // 2  获取权限状态   只要发现一些属性名很怪异的时候，都要使用中括号[""]的形式来获取属性值
    const scopeAddress = result.authSetting["scope.address"]
    if (scopeAddress === true || scopeAddress === undefined) {
      wx.chooseAddress({
        success: (result1) => {
          console.log(result1)
        }
      });
    } else {
      //  3  用户曾经拒绝过授予权限   先引导用户打开授权页面
      wx.openSetting({
        success: (result2) => {
          // 4  可以调用 获取收货地址代码了 
          wx.chooseAddress({
            success: (result3) => {
              console.log(result3)
            }
          });
        }
      });
    }
  },
  fail: () => {},
  complete: () => {}
}); */