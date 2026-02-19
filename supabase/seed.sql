-- Seed default categories (system-wide, user_id = NULL)
insert into public.categories (user_id, name, icon, color, is_default) values
  (null, 'Groceries',       'shopping-cart',  '#4CAF50', true),
  (null, 'Rent/Mortgage',   'home',           '#2196F3', true),
  (null, 'Utilities',       'zap',            '#FF9800', true),
  (null, 'Transportation',  'car',            '#9C27B0', true),
  (null, 'Dining Out',      'utensils',       '#E91E63', true),
  (null, 'Entertainment',   'film',           '#00BCD4', true),
  (null, 'Healthcare',      'heart-pulse',    '#F44336', true),
  (null, 'Shopping',        'shopping-bag',   '#795548', true),
  (null, 'Education',       'graduation-cap', '#3F51B5', true),
  (null, 'Subscriptions',   'repeat',         '#607D8B', true),
  (null, 'Insurance',       'shield',         '#FF5722', true),
  (null, 'Personal Care',   'sparkles',       '#8BC34A', true),
  (null, 'Gifts/Donations', 'gift',           '#673AB7', true),
  (null, 'Travel',          'plane',          '#009688', true),
  (null, 'Miscellaneous',   'ellipsis',       '#9E9E9E', true);

-- Seed default payment methods (system-wide, user_id = NULL)
insert into public.payment_methods (user_id, name, value, is_default) values
  (null, 'Cash',          'cash',          true),
  (null, 'Credit Card',   'credit_card',   true),
  (null, 'Debit Card',    'debit_card',    true),
  (null, 'UPI',           'upi',           true),
  (null, 'Bank Transfer', 'bank_transfer', true),
  (null, 'Other',         'other',         true);
