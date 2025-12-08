// 定价和税费计算工具

export interface PricingConfig {
  salesTaxRate: number; // 销售税率 (例如 0.09 = 9%)
  serviceFeeRate: number; // 服务费率 (例如 0.03 = 3%)
  stripeFeeRate: number; // Stripe费率 (0.029)
  stripeFeeFixed: number; // Stripe固定费用 ($0.30)
  includeFeesInPrice: boolean; // 是否将费用包含在价格中
}

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  salesTaxRate: 0.09, // 9% 加州平均税率
  serviceFeeRate: 0.0, // 无服务费
  stripeFeeRate: 0.029, // 2.9%
  stripeFeeFixed: 0.3, // $0.30
  includeFeesInPrice: false, // 默认不包含
};

export interface PriceBreakdown {
  subtotal: number; // 商品小计
  salesTax: number; // 销售税
  serviceFee: number; // 服务费
  stripeFee: number; // Stripe手续费
  total: number; // 总计
}

/**
 * 计算订单价格明细
 */
export function calculatePriceBreakdown(
  subtotal: number,
  config: PricingConfig = DEFAULT_PRICING_CONFIG
): PriceBreakdown {
  // 商品小计
  const itemsSubtotal = subtotal;

  // 销售税
  const salesTax = itemsSubtotal * config.salesTaxRate;

  // 服务费
  const serviceFee = itemsSubtotal * config.serviceFeeRate;

  // 如果要将Stripe费用转嫁给用户
  let stripeFee = 0;
  let total = itemsSubtotal + salesTax + serviceFee;

  if (config.includeFeesInPrice) {
    // 计算需要收取多少才能覆盖Stripe费用
    // 公式: total = (amount + fixed_fee) / (1 - percentage_fee)
    const totalWithStripeFee =
      (total + config.stripeFeeFixed) / (1 - config.stripeFeeRate);
    stripeFee = totalWithStripeFee - total;
    total = totalWithStripeFee;
  }

  return {
    subtotal: Math.round(itemsSubtotal * 100) / 100,
    salesTax: Math.round(salesTax * 100) / 100,
    serviceFee: Math.round(serviceFee * 100) / 100,
    stripeFee: Math.round(stripeFee * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

/**
 * 计算你实际收到的金额（扣除Stripe费用后）
 */
export function calculateNetAmount(totalCharged: number): number {
  const stripeFee = totalCharged * 0.029 + 0.3;
  return Math.round((totalCharged - stripeFee) * 100) / 100;
}

/**
 * 格式化价格明细为可读文本
 */
export function formatPriceBreakdown(breakdown: PriceBreakdown): string {
  return `
Subtotal:    $${breakdown.subtotal.toFixed(2)}
Sales Tax:   $${breakdown.salesTax.toFixed(2)}
Service Fee: $${breakdown.serviceFee.toFixed(2)}
Stripe Fee:  $${breakdown.stripeFee.toFixed(2)}
────────────────────────────
Total:       $${breakdown.total.toFixed(2)}
  `.trim();
}
