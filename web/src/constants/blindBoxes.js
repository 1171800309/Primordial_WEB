export const BLIND_BOXES = {
  wanqi: {
    sku: 'wanqi_box',
    key: 'wanqi',
    title: '万炁盲盒',
    productName: '万炁盲盒',
    priceYuan: 300,
    boxClass: 'box-wanqi',
    description:
      '混沌随机发出与青阳之炁、朱明之炁、白藏之炁、玄英之炁、中极之炁其中一炁关联的一件物品，本站不对商品作任何解释，物品只是物品，无任何效果，一旦发出，不退不换，无售后，介意者勿拍。'
  },
  guaiqi: {
    sku: 'guaiqi_box',
    key: 'guaiqi',
    title: '怪炁盲盒',
    productName: '怪炁盲盒',
    priceYuan: 200,
    boxClass: 'box-guaiqi',
    description:
      '混沌随机发出一件装有奇怪物品的盒子，可能引起不适，本站不对商品作任何解释，物品只是物品，无任何效果，一旦发出，不退不换，无售后，介意者勿拍。'
  }
}

export const SHIPPING_NOTE = '最晚30天发货'

export const getBlindBox = (key) => BLIND_BOXES[key] || null
