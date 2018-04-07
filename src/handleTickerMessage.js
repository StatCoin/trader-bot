'use strict'

const logger = require('./logger')
const { periods, granularities } = require('./config')
const smallerPeriod = Math.min(...periods)
const smallerGranularity = Math.min(...granularities)
const BigNumber = require('bignumber.js')

module.exports = (message, priceTracker) => {
  // If this isn't a ticker message or is and doesn't have a trade id
  if (message.type !== 'ticker' || (message.type === 'ticker' && !message.trade_id)) {
    return
  }

  message.price = new BigNumber(message.price)

  logger.verbose(`Trade: ${message.product_id} ${message.side} @ ${message.price.toFixed(2)} (${message.last_size})`)

  const productData = priceTracker[message.product_id]

  // Set the current candle price data for each granularity
  for (const granularity of granularities) {
    const candle = productData[granularity].currentCandle

    candle.close = message.price

    if (message.price.isLessThan(candle.low)) {
      candle.low = message.price
    }

    if (message.price.isGreaterThan(candle.high)) {
      candle.high = message.price
    }
  }

  // Check the current price against the bigger granularity's EMA
  // Depending on the current side (buy/sell), we need to check whether
  // the price is above/below EMA for each granularity and each period group

}
