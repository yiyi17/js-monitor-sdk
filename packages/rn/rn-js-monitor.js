
function errorMonitor() {
  global.ErrorUtils.setGlobalHandler(error => {
    console.log('ErrorUtils发现了语法错误，避免了崩溃，具体报错信息：');
    console.log(error.name, error.message, [{ text: 'OK' }]); 
  }, true);
}
function apiMonitor() {
  const TIME_LIMIT = 3000
  const originFetch = fetch
  Object.defineProperty(global, 'fetch', {
    configurable: true,
    enumerable: true,
    get() {
      const starTime = Date.now()
      return (url, options) => {
        return new Promise((resolve, reject) => {
          originFetch(url, options)
          .then(res => {
            const endTime = Date.now()
            const spendTime = endTime - starTime
            const isOK = (res.status >= 200 && res.status < 300) || res.status === 304;
            const cloneRes = res.clone();
            let reqType
            if (spendTime >= TIME_LIMIT && isOK) {
              reqType = 'reqPerf';
            } else if (!isOK) {
              reqType = 'reqError';
            }

            console.log(`%c接口${url}请求耗时：${spendTime}ms, ${res.status},返回值 ${JSON.stringify(cloneRes)}`, 'color: blue');
            resolve(res)
          }).catch(err => {
            reject(err);
          })
        })
      }
    },
    set() {

    }
  })
}

function calculate(children) {
  let count = 0
  function fn(children) {
    for(let i = 0; i < children.length; i++) {
      // 如果是数字
      if(children[i]._children.length){
        if(typeof children[i]._children[0] === 'number') {
          count++
        }else {
          fn(children[i]._children)
        }
      }
    }
 }
 if(children.length) {
    fn(children)
 }
 console.log(children.length, count);
 return children.length === count
}

function lcpMonitor(refs) {
  if(!refs || !refs[0]) return
  const startTime = Date.now()
  let start
  function fn() {
    const stop = requestAnimationFrame((timestamp) => {
      if (start === undefined) {
        start = timestamp;
      }
      const elapsed = timestamp - start;
      if(elapsed > 10000) {
        cancelAnimationFrame(stop)
      }
      if(calculate(refs[0]._children)) {
        console.log(`%c lcp: ${Date.now()-startTime + elapsed} ms`, 'color: red');
        cancelAnimationFrame(stop)
      }else {
        fn()
      }
    })
  }
  fn()
}

function whiteMonitor(refs){
  let time = 0
  if(!refs || !refs[0]) return
  const timer = setInterval(() => {
    time++
    if(calculate(refs[0]._children)) {
      clearInterval(timer)
      console.log('%c页面渲染完成，未发生白屏', 'color: green');
    }else if(time > 10) {
      clearInterval(timer)
      console.log('%c页面渲染完成，发生白屏', 'color: red');
    }
  },2000)
}

export default function rnjsMonitor(options) {
  const {error, lcp, white, api} = options
  if(error) {
    errorMonitor()
  }
  if(api) {
    apiMonitor()
  }
  if(lcp && lcp.open) {
    lcpMonitor(lcp.refs)
  }
  if(white && white.open){
    whiteMonitor(white.refs)
  }
}

