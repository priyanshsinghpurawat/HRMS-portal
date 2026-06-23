import { jest } from '@jest/globals';

export const mockCloudinary = {
    v2: {
        config: jest.fn(),
        uploader: {
            upload: jest.fn().mockResolvedValue({
                secure_url: 'https://res.cloudinary.com/demo/image/upload/v1593006243/sample.jpg',
                public_id: 'sample_id',
            }),
            destroy: jest.fn().mockResolvedValue({ result: 'ok' }),
        },
    },
};

export const uploadOnCloudinary = jest.fn().mockResolvedValue('https://res.cloudinary.com/demo/image/upload/v1593006243/sample.jpg');
export const deleteFromCloudinary = jest.fn().mockResolvedValue({ result: 'ok' });
