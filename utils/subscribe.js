export const SUBSCRIBE_TMPL = {
  tmpl_cert: '3sG_tbFfMtaCwYmtCMYvKgFXT4X1qwgkRzq_1VCUP7M',
  tmpl_ship: 'tJ7FsECNBuksXBMqkuZAFXJFtsRq9H6jhERA510IprA',
  tmpl_pay: 'I254K3zhquq807zvb-oCS_XiUZH-9EJ_ftDZGo2Ngts'
}

function recordSubscribeDebug(payload) {
  const info = {
    time: new Date().toISOString(),
    ...payload
  }

  console.log('[subscribe]', info.stage, info)

  try {
    uni.setStorageSync('lastSubscribeDebug', info)
  } catch (err) {
    console.warn('[subscribe] debug-storage-fail', err)
  }

  return info
}

function getSubscribeDiagnosis(err = {}) {
  if (err.errCode === 20001 || String(err.errMsg || '').includes('No template data return')) {
    return '模板ID在当前小程序AppID下不可用，请确认微信公众平台订阅消息模板是否已添加，且模板ID属于当前 AppID'
  }

  if (String(err.errMsg || '').includes('TAP gesture')) {
    return '订阅接口没有处在用户点击事件栈中，请确认没有先执行异步请求后再调用订阅'
  }

  return ''
}

function getMissingTmplIds(tmplIds = [], res = {}) {
  return tmplIds.filter(id => !Object.prototype.hasOwnProperty.call(res, id))
}

export function requestSubscribe(tmplIds = [], scene = '') {
  return new Promise(resolve => {
    const ids = Array.isArray(tmplIds) ? tmplIds.filter(Boolean) : [tmplIds].filter(Boolean)

    if (ids.length === 0) {
      recordSubscribeDebug({ stage: 'invalid-tmplIds', scene, tmplIds })
      resolve(true)
      return
    }

    const wxApi = typeof wx !== 'undefined' ? wx.requestSubscribeMessage : null
    if (typeof wxApi !== 'function') {
      recordSubscribeDebug({ stage: 'api-unavailable', scene, tmplIds: ids })
      resolve(true)
      return
    }

    const finalIds = ids.slice(0, 3)
    recordSubscribeDebug({ stage: 'start', scene, tmplIds: finalIds })

    wxApi({
      tmplIds: finalIds,
      success(res) {
        const missingTmplIds = getMissingTmplIds(finalIds, res)
        recordSubscribeDebug({
          stage: 'success',
          scene,
          tmplIds: finalIds,
          result: res,
          missingTmplIds,
          diagnosis: missingTmplIds.length ? '微信成功返回，但部分模板未出现在授权结果里，请单独测试缺失模板或检查该模板在小程序后台的状态/类目/字段配置' : ''
        })
        resolve(true)
      },
      fail(err) {
        recordSubscribeDebug({
          stage: 'fail',
          scene,
          tmplIds: finalIds,
          error: err,
          diagnosis: getSubscribeDiagnosis(err)
        })
        resolve(true)
      }
    })
  })
}
