import { jest } from '@jest/globals';

jest.unstable_mockModule('cloudinary', () => ({
    v2: {
        config: jest.fn(),
        uploader: {
            upload_stream: jest.fn(),
            destroy: jest.fn()
        }
    }
}));

jest.unstable_mockModule('streamifier', () => ({
    default: {
        createReadStream: jest.fn()
    }
}));

describe('cloudinary utils', () => {
    let uploadOnCloudinary;
    let deleteFromCloudinary;
    let cloudinary;
    let streamifier;

    beforeAll(async () => {
        const cloudinaryModule = await import('cloudinary');
        cloudinary = cloudinaryModule.v2;
        streamifier = (await import('streamifier')).default;
        const utils = await import('../../../src/utils/cloudinary.js');
        uploadOnCloudinary = utils.uploadOnCloudinary;
        deleteFromCloudinary = utils.deleteFromCloudinary;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('uploadOnCloudinary', () => {
        it('should resolve with result on successful upload', async () => {
            const mockBuffer = Buffer.from('test');
            const mockResult = { public_id: '123' };
            
            cloudinary.uploader.upload_stream.mockImplementation((opts, cb) => {
                cb(null, mockResult);
                return { on: jest.fn(), once: jest.fn(), emit: jest.fn() };
            });
            
            streamifier.createReadStream.mockReturnValue({
                pipe: jest.fn()
            });

            const result = await uploadOnCloudinary(mockBuffer, 'folder');
            expect(result).toEqual(mockResult);
        });

        it('should reject on upload error', async () => {
            const mockBuffer = Buffer.from('test');
            const mockError = new Error('Upload failed');
            
            cloudinary.uploader.upload_stream.mockImplementation((opts, cb) => {
                cb(mockError, null);
                return { on: jest.fn(), once: jest.fn(), emit: jest.fn() };
            });
            
            streamifier.createReadStream.mockReturnValue({
                pipe: jest.fn()
            });

            await expect(uploadOnCloudinary(mockBuffer, 'folder')).rejects.toThrow('Upload failed');
        });
    });

    describe('deleteFromCloudinary', () => {
        it('should call destroy and return response', async () => {
            const mockResponse = { result: 'ok' };
            cloudinary.uploader.destroy.mockResolvedValue(mockResponse);

            const result = await deleteFromCloudinary('123');
            expect(result).toEqual(mockResponse);
            expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('123', { resource_type: 'image' });
        });

        it('should return null if publicId is missing', async () => {
            const result = await deleteFromCloudinary(null);
            expect(result).toBeNull();
        });

        it('should catch error and return null', async () => {
            jest.spyOn(console, 'error').mockImplementation(() => {});
            cloudinary.uploader.destroy.mockRejectedValue(new Error('Delete failed'));

            const result = await deleteFromCloudinary('123');
            expect(result).toBeNull();
        });
    });
});
