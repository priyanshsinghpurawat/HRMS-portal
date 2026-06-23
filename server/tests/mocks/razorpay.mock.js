import { jest } from '@jest/globals';

export const mockRazorpay = {
    orders: {
        create: jest.fn().mockResolvedValue({
            id: 'order_test_12345',
            entity: 'order',
            amount: 50000,
            amount_paid: 0,
            amount_due: 50000,
            currency: 'INR',
            receipt: 'receipt_test_123',
            status: 'created',
            attempts: 0,
        }),
    },
    payments: {
        fetch: jest.fn().mockResolvedValue({
            id: 'pay_test_12345',
            entity: 'payment',
            amount: 50000,
            currency: 'INR',
            status: 'captured',
            order_id: 'order_test_12345',
            method: 'card',
        }),
    },
};
