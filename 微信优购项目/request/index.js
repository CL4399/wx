// 最简单的  封装的微信请求代码
export const request=(params)=> {
    // 定义公共的url
    const baseUrl="https://api-hmugo-web.itheima.net/api/public/v1";
    return new Promise((resolve,reject)=> {
        wx.request({
            ...params,
            // params.url, 是传递过来的部分
            url:baseUrl+params.url,
            success:(result)=>{
                resolve(result.data.message);
            },
            fail:(err)=>{
                reject(err);
            }
        });
    })
}