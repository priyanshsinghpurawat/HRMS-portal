import mongoose, { Schema } from 'mongoose';

const locationSchema = new Schema({
    ownerId: {
        type: Schema.Types.ObjectId,
        refPath: "ownerType",
        index: true
    },
    ownerType: {
        type: String,
        enum: ["User", "Company"],
        required: true,
        index: true
    },
    country: {
        type: String,
        trim: true,
        default: ""
    },

    state: {
        type: String,
        trim: true,
        default: ""
    },

    city: {
        type: String,
        trim: true,
        default: ""
    },

    address: {
        type: String,
        trim: true,
        maxlength: 200,
        default: ""
    },

    pincode: {
        type: String,
        trim: true,
        default: ""
    }
});

const Location = mongoose.model("location", locationSchema);
export { Location };