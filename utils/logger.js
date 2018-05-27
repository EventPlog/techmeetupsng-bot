class Logger {
  static info(message) {
    this.sendInfoToLogs(message)
  }

  static loggerAgent() {
    return newrelic
  }

  static event(message, cb, args = []) {
    const t0 = new Date().getTime()
    cb.apply(null, args)
    const t1 = new Date().getTime()
    this.sendInfoToLogs(`${message}. Elapsed time: ${t1 - t0}ms`)
  }

  static errorException(message, err) {
    this.sendErrorToLogs(message, err)
  }

  static sendInfoToLogs(message) {
    this.loggerAgent().recordCustomEvent('Custom', {message})
    console.log(`${new Date()} ${message}`)
  }

  static sendErrorToLogs(message, error) {
    const errorMsg = `${new Date()} ${error.message}\n\r\t${error.stack}`
    this.loggerAgent().noticeError(error, {errorMsg})
    console.error(errorMsg)
  }
}

module.exports = Logger
