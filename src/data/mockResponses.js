export const mockPatterns = [
  {
    id: 'purchase-60-days',
    keywords: [['purchased', 'bought', 'purchase'], ['60 days', '2 months', 'two months']],
    aiResponse: "Added: Customers without purchases in last 60 days",
    conditions: [
      {
        id: 'cond-purchase-60',
        field: 'Shopify Purchase',
        operator: 'is',
        value: 'None',
        timeRange: 'Last 60 days',
      },
    ],
  },
  {
    id: 'purchase-30-days',
    keywords: [['purchased', 'bought', 'purchase'], ['30 days', 'month', 'last month']],
    aiResponse: "Added: Customers who purchased in last 30 days",
    conditions: [
      {
        id: 'cond-purchase-30',
        field: 'Shopify Purchase',
        operator: 'is',
        value: 'Any',
        timeRange: 'Last 30 days',
      },
    ],
  },
  {
    id: 'purchase-7-days',
    keywords: [['purchased', 'bought', 'purchase'], ['7 days', 'week', 'last week']],
    aiResponse: "Added: Customers who purchased in last 7 days",
    conditions: [
      {
        id: 'cond-purchase-7',
        field: 'Shopify Purchase',
        operator: 'is',
        value: 'Any',
        timeRange: 'Last 7 days',
      },
    ],
  },
  {
    id: 'email-3-days',
    keywords: [['email'], ['3 days', '72 hours', 'three days']],
    aiResponse: "Added: Excluding customers emailed in past 3 days",
    conditions: [
      {
        id: 'cond-email-3',
        field: 'Email Received',
        operator: 'is not',
        value: 'Any',
        timeRange: 'Last 3 days',
      },
    ],
  },
  {
    id: 'email-this-month',
    keywords: [['email'], ['this month', 'month']],
    aiResponse: "Added: Customers without email activity this month",
    conditions: [
      {
        id: 'cond-email-month',
        field: 'Email Received',
        operator: 'is not',
        value: 'Any',
        timeRange: 'This month',
      },
    ],
  },
  {
    id: 'vip-tag',
    keywords: [['vip', 'high value', 'high-value']],
    aiResponse: "Added: VIP customers only",
    conditions: [
      {
        id: 'cond-vip',
        field: 'Customer Tag',
        operator: 'contains',
        value: 'VIP',
        timeRange: null,
      },
    ],
  },
  {
    id: 'cart-abandon-100',
    keywords: [['cart abandon', 'abandoned cart', 'cart abandoner'], ['100', '$100']],
    aiResponse: "Added: Cart abandoners with carts over $100",
    conditions: [
      {
        id: 'cond-cart-100',
        field: 'Cart Value',
        operator: 'greater than',
        value: '$100',
        timeRange: 'Last 7 days',
      },
    ],
  },
  {
    id: 'cart-abandon-general',
    keywords: [['cart abandon', 'abandoned cart', 'cart abandoner']],
    aiResponse: "Added: Customers who abandoned their cart",
    conditions: [
      {
        id: 'cond-cart',
        field: 'Cart Abandoned',
        operator: 'is',
        value: 'True',
        timeRange: 'Last 7 days',
      },
    ],
  },
  {
    id: 'location-us',
    keywords: [['united states', 'usa', 'us', 'america']],
    aiResponse: "Added: Customers in the United States",
    conditions: [
      {
        id: 'cond-location-us',
        field: 'Location',
        operator: 'is',
        value: 'United States',
        timeRange: null,
      },
    ],
  },
  {
    id: 'subscriber',
    keywords: [['subscriber', 'subscribed', 'newsletter']],
    aiResponse: "Added: Newsletter subscribers only",
    conditions: [
      {
        id: 'cond-subscriber',
        field: 'Newsletter Subscriber',
        operator: 'is',
        value: 'True',
        timeRange: null,
      },
    ],
  },
]

export const fallbackResponse = {
  aiResponse: "I didn't understand that. Try something like: 'customers who purchased in the last 30 days' or 'VIP customers'",
  conditions: [],
}

export const confirmationResponses = [
  "Updated!",
  "Done!",
  "Changes saved!",
]

export const removalResponses = [
  "Removed condition",
  "Condition deleted",
  "Done! Removed that condition",
]

// Response variations for AND/OR additions
export const orAdditionResponses = [
  "Added with OR logic:",
  "Also including:",
]

export const andAdditionResponses = [
  "Added:",
  "Narrowing down:",
]
