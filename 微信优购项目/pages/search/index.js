/* 
  1  输入框绑定   值改变 事件  input事件
      1  获取到输入框的值
      2  合法性判断（过滤空字符串等）
      3  检验通过  把输入框的值 发送到后台
      4  返回的数据 打印到页面上
  2  防抖  （防止抖动）  通过定时器     节流
      防抖一般 在输入框中  防止重复输入  重复发送请求
      节流一般  用在页面的上拉和下拉中
     1  定义全局的定时器id

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
    goods: [],
    //  取消 按钮  是否显示
    isFocus:false,
    //  输入框的值
    inputValue: ""
  },
  TimeId: -1,
  //  输入框的值改变了   就会触发的事件
  handleInput(e) {
    // 1  获取输入框的值
    const {
      value
    } = e.detail;
    //   trim();删除字符串开始和末尾的空格
    if (!value.trim()) {
      //  输入框没有值，隐藏按钮
      this.setData({
        goods: [],
        isFocus: false
      })
      //  值不合法
      return;
    }
    // 输入框有值  显示按钮
    this.setData({
      isFocus: true
    })

    //  3  准备发起请求获取数据
    clearTimeout(this.TimeId);
    this.TimeId = setTimeout(() => {
      this.getSearch(value);
    }, 1000)
  },
  //  发送请求 获取 搜索建议 的数据
  async getSearch(query) {
    const res = await request({
      url: "/goods/qsearch",
      data: {
        query
      }
    });
    this.setData({
      goods: res
    })
  },
  //  点击取消按钮
  handleCancel(){
    this.setData({
      inputValue: "",
      isFocus: false,
      goods: []
    })
  }
})