const fetch = require('../../utils/fetch')
// pages/list/list.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    //进入的类别
    categories: {},
    //类别下的商铺
    shops: [],
    pageIndex: 0, //页码
    pageCount: 10, //条数
    loadHas: true, //是否还有条数
    totalCount: 0, //总页数
    queryValue: '',
    tick: true //首次查询标记
  },
  loadMore() {
    if (this.data.loadHas) {
      let { pageIndex, pageCount } = this.data
      return fetch(`categories/${this.data.categories.id}/shops?_page=${++pageIndex}&_limit=${pageCount}&q=${this.data.queryValue}`)
        .then(res => {
          //首次查询要覆盖否则拼接，没有值就表示全查
          let shops = []
          if( this.data.queryValue !== '' && this.data.tick ) {
            shops = res.data
            this.setData({ tick: false })
          } else {
            shops = this.data.shops.concat(res.data)
          }
          let totalCount = res.header['X-Total-Count']
          //先存总数避免下拉多一次
          this.setData({ totalCount })
          let loadHas = pageIndex * pageCount < this.data.totalCount
          this.setData({ shops, pageIndex, loadHas })
        })
    } else {
      //查询完毕之后清空queryValue 下次继续查询
      this.setData({ queryValue: '', tick: true })
    }
  },
  search(e) {
    //重置这些数据 查询后第一页开始
    this.setData({ pageIndex: 0, queryValue: e.detail.value, loadHas: true })
    this.loadMore()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    fetch(`categories/${options.cat}`).then(res => {
      this.setData({ categories: res.data })
      wx.setNavigationBarTitle({
        title: res.data.name
      })
      //获取商铺信息
      return this.loadMore()
    })
  },

  /**
   * 上拉事件--触发刷新
   */
  onPullDownRefresh() {
    this.setData({ shops: [], pageIndex: 0, loadHas: true, queryValue: '', tick: true, totalCount: 0 })
    this.loadMore().then(() => { wx.stopPullDownRefresh() })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    //如果在页面渲染完成时没有设置导航栏的title
    if (this.data.categories.name) {
      wx.setNavigationBarTitle({
        title: this.data.categories.name
      })
    }
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.loadMore()
  }
})