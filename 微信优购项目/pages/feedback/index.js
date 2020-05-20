// pages/feedback/index.js
/* 
  1  点击 “+”  触发 tap 点击事件
     1  调用小程序内置的选择图片的api
     2  获取到  图片的路径  数组
     3  把图片路径存到 data的变量中
     4  页面就可以根据 图片的数组  进行循环显示 自定义组件
  2   点击自定义图片  组件
     1  获取被点击的元素的索引
     2  获取data中的图片数组
     3  根据索引删除 对应元素
     4  把数组重新设置回data中
  3  点击提交按钮
     1  获取文本域的内容并进行验证
        在data中定义变量  表示 文本域的内容
        给文本域绑定输入事件   事件触发 就存入变量中
        如果不通过 就提示用户
     2  如果通过  用户选择的图片 上传到专门的图片服务器，，返回图片外网的链接
     3  然后将文本域 和 外网的图片的路径一起提交到服务器中（只做模拟，不会发送请求）
          1  遍历图片数组
          2  诶个上传
          3  自己再来维护一个图片数组   存放的就是图片上传后的外网链接
     4  清空当前页面
     5  返回上一页
*/
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: [{
        id: 0,
        value: "体验问题",
        isActive: true
      },
      {
        id: 1,
        value: "商品、商家投诉",
        isActive: false
      }
    ],
    //  被选中的图片路径数组
    chooseImgs: [],
    //  文本域的内容
    textVal: ""
  },
  //  图片上传后的外网图片路径数组
  UploadImgs: [],
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
  //  点击  +  号   选择图片
  handleChooseImg() {
    //  调用小程序内置的选择图片api
    wx.chooseImage({
      //  同时选中的图片数量
      count: 9,
      //  图片的格式  原图  压缩
      sizeType: ['original', 'compressed'],
      //  图片的来源  相册  照相机
      sourceType: ['album', 'camera'],
      success: (result) => {
        this.setData({
          //  图片数组进行拼接
          chooseImgs: [...this.data.chooseImgs, ...result.tempFilePaths]
        })
      }
    });
  },
  //  点击自定义组件
  handleRemoveImg(e) {
    //  获取 被点击组件的索引
    const {
      index
    } = e.currentTarget.dataset;
    //  获取data中的图片数组
    let {
      chooseImgs
    } = this.data;
    chooseImgs.splice(index, 1)
    this.setData({
      chooseImgs
    })
  },
  //  文本域的输入事件
  handleTextInput(e) {
    this.setData({
      textVal: e.detail.value
    })
  },
  //  提交按钮的点击事件
  handleFormSubmit() {
    //  1   获取文本域的内容
    const {
      textVal,
      chooseImgs
    } = this.data;
    //  2  合法性的验证
    if (!textVal.trim()) {
      wx.showToast({
        title: '输入不合法',
        icon: 'none',
        mask: true
      });
      return;
    }
    //  3  准备上传图片到专门的图片服务器 
    //  这个微信自带的api  不支持多个文件同时上传
    //  解决办法，遍历数组  挨个上传
    //  显示正在等待的图标
    wx.showLoading({
      title: "正在上传中",
      mask: true
    });

    //  判断有没有需要上传的图片数组
    if(chooseImgs.length!=0){
      chooseImgs.forEach((v, i) => {
        wx.uploadFile({
          //  图片上传到哪里
          url: 'http://images.ac.cn/api/upload',
          //  被上传的文件的路径
          filePath: v,
          //  上传文件的名称（给后台获取文件的，自定义 前端和后台要一致  file）
          name: "file",
          //  顺带的文本信息
          formData: {},
          success: (result) => {
            let url = JSON.parse(result.data).url
            this.UploadImgs.push(url)
            //  所有图片都上传完毕了才触发
            if (i === chooseImgs.length - 1) {
              //  关闭弹窗
              wx.hideLoading();
              console.log('提交')
              //  提交都成功了  重置页面并返回上一个页面
              this.setData({
                textVal: "",
                chooseImgs: []
              })
  
              wx.navigateBack({
                delta: 1
              });
            }
          }
        });
      })
    }else{
      wx.hideLoading();
      console.log('只是提交了文本')
      wx.navigateBack({
        delta: 1
      });
    }
    
  }
})