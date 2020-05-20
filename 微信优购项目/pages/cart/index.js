/* 
  1   获取用户的收货地址
        1   绑定点击事件
        2   调用小程序内置的API  获取用户的收货地址   wx.chooseAddress
  2   获取用户对小程序所授予获取地址的权限状态  scope
        1   假设用户  点击获取地址的提示框，点击的确定   authSetting.scope.address
            scope 值就为  true     可以直接调用  获取收货地址
        2   假设用户  点击获取收货地址提示框，，，，点击的取消
            scope值就为false了
            1   引导用户自己打开(wx.openSetting)  授权设置页面   当用户重新给予  获取地址权限的时候
            2   再获取收货地址
        3   假设用户从来没有调用过  获取收货地址的api
            scope值就为undefined    可以直接调用 获取收货地址
        4   将获取到的收货地址  存储到 本地存储中
  3   页面加载完毕  onLoad   用onShow
      1   获取本地存储中的地址数据
      2   把数据 设置给data中的一个变量
  4   onShow  需要做的事
      1   获取缓存中的购物车数组
      2   把购物车数据填充到data中
  5   全选的实现   数据的展示
      1    onShow  获取缓存中的购物车数组
      2    根据购物车中的商品数据进行计算（所有的商品都被选中了，全选才被选中）
  6   总价格和总数量
      1   都需要商品被选中才计算
      2   获取购物车的数组，对他进行遍历，同时判断商品是否被选中
      3   如果商品被选中了，总价格 += 商品的单价 * 商品的数量
                          总数量 +=  商品的数量
      4   把计算过后的价格和数量  设置回data中
  7   商品的选中
     1   绑定change事件
     2   获取到被修改的商品对象
     3   商品对象的选中状态 取反
     4   重新填充到data与本地缓存中
     5   重新计算全选和总价格和总数量
  8   全选和反选功能
     1   全选框绑定change事件
     2   获取 data中的全选变量  allChecked
     3   直接取反  allChecked!=allChecked
     4   遍历购物车数组   让里面的 商品选中状态都跟随 allChecked 改变而改变
     5   把购物车数组 和 allChecked 重新设置回data 和 缓存中
  9   实现商品数量的编辑功能
     1    给 + 和 -  绑定同一个绑定事件  区分的关键  在于自定义属性
          点击 + 号  它的自定义属性就是 +1
          点击 — 号  它的自定义属性就是 -1
     2    传递被点击的商品id（goods_id)
     3    获取到data中的购物车数组   根据传递过来的id获取需要被修改的商品对象
        当购物车的数量为1时，同时用户点击减号按钮
           弹窗提示用户 【wx.showModal】 是否要删除该商品
           1  确定  直接删除商品
           2  取消  什么都不做
     4    直接修改商品对象的数量属性
     5    把购物车数组重新设置回data 和 缓存中 （this.setCart)
  10  点击结算按钮
      1   判断有没有收货地址
      2   判断有没有选购商品
      3   经过以上验证，跳转支付页面
*/


//  引入封装好的getSetting    chooseAddress    openSetting
import {
  getSetting,
  chooseAddress,
  openSetting,
  showModal,
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
    allChecked: false,
    //  总价格
    totalPrice: 0,
    //  总数量
    totalNum: 0
  },
  onShow() {
    //   1获取缓存中的收货地址
    const address = wx.getStorageSync("address");
    //   2获取缓存中的购物车数组
    const cart = wx.getStorageSync("cart") || [];
    this.setData({
      address
    });
    //  调用设置购物车状态的方法
    this.setCart(cart);
  },
  //    点击按钮   收货地址
  async handleChooseAddress() {

    /* 
        优化过的
    */
    try {
      // 1 获取 权限状态
      const res1 = await getSetting();
      const scopeAddress = res1.authSetting["scope.address"];
      // 2 判断 权限状态
      if (scopeAddress === false) {
        //  3 用户曾经拒绝过授予权限   先引导用户打开授权页面
        await openSetting();
      }
      // 4 调用获取收货地址的 api
      let address = await chooseAddress();
      address.all = address.provinceName + address.cityName + address.countyName + address.detailInfo;

      // 5 存入到缓存中
      wx.setStorageSync("address", address);
    } catch (error) {
      console.log(error);
    }
  },

  //   商品的单选  选中
  handleItemChange(e) {
    // 1  获取被修改的商品id
    const goods_id = e.currentTarget.dataset.id;
    // 2  获取购物车数组
    let {
      cart
    } = this.data;
    // 3  找到被修改的商品对象
    let index = cart.findIndex(v => v.goods_id === goods_id);
    // 4  选中状态取反
    cart[index].checked = !cart[index].checked;
    //  调用设置购物车状态的方法
    this.setCart(cart);
  },

  //   商品的全选功能
  handleItemAllChecked() {
    //  1 获取data中数据
    let {
      cart,
      allChecked
    } = this.data;
    //  2  修改值
    allChecked = !allChecked;
    //  3  循环修改cart数组 中的 商品选中状态
    cart.forEach(v => v.checked = allChecked);
    //  4  把修改后的值  填充回data 和 缓存中
    this.setCart(cart);
  },

  //   商品数量的编辑功能
  async handleItemNumEdit(e) {
    //  1 获取传递过来的参数
    const {
      operation,
      id
    } = e.currentTarget.dataset;
    //  2  获取购物车数组
    let {
      cart
    } = this.data;
    //  3  找到需要修改的商品的索引
    const index = cart.findIndex(v => v.goods_id === id);

    //  修改之前进行判断
    /* 
      当购物车的数量为1时，同时用户点击减号按钮
          弹窗提示用户 【wx.showModal】 是否要删除该商品
          1  确定  直接删除商品
          2  取消  什么都不做
    */
    if (cart[index].num === 1 && operation === -1) {
      //  弹窗提示
      const res = await showModal({
        content: "是否删除该商品！"
      });
      if (res.confirm) {
        cart.splice(index, 1);
        this.setCart(cart);
      }
    } else {
      //  4  开始进行修改数量
      cart[index].num += operation;
      //  5  设置回 缓存  和  data中
      this.setCart(cart);
    }
  },
  //   点击结算按钮
  async handlePay(){
    // 1  判断收货地址
    const {address, totalNum}=this.data;
    if(!address.userName) {
      await showToast({title:"您还没有选择收货地址！"});
      return;
    }
    //  2  判断用户有没有选购商品
    if(totalNum===0){
      await showToast({title:"您还没有选购商品！"});
      return;
    }
    //  3  跳转到支付页面
    wx.navigateTo({
      url: '/pages/pay/index'
    });
  },

  //   封装 设置购物车状态的方法  重新计算 底部工具栏数据（全选、总价格、总数量。。。）
  setCart(cart) {
    let allChecked = true;
    //  总价格  总数量
    let totalPrice = 0;
    let totalNum = 0;

    cart.forEach(v => {
      if (v.checked) {
        totalPrice += v.num * v.goods_price;
        totalNum += v.num;
      } else {
        allChecked = false;
      }
    });
    //  判断数组是否为空
    allChecked = cart.length != 0 ? allChecked : false;

    //  6  重新填充到data与本地缓存中
    this.setData({
      cart,
      totalPrice,
      totalNum,
      allChecked
    });
    wx.setStorageSync("cart", cart);
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