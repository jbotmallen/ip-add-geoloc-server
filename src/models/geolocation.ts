import mongoose, { Document, Schema } from 'mongoose';

export interface IGeolocation extends Document {
    ip: string;
    country: string;
    region: string;
    city: string;
    latitude: number;
    longitude: number;
    isp: string;
    timezone: string;
    searchedBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const geolocationSchema = new Schema<IGeolocation>(
    {
        ip: {
            type: String,
            required: [true, 'IP address is required'],
            unique: true,
            trim: true
        },
        country: {
            type: String,
            required: [true, 'Country is required'],
            trim: true
        },
        region: {
            type: String,
            required: [true, 'Region is required'],
            trim: true
        },
        city: {
            type: String,
            required: [true, 'City is required'],
            trim: true
        },
        searchedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        latitude: {
            type: Number,
            required: [true, 'Latitude is required']
        },
        longitude: {
            type: Number,
            required: [true, 'Longitude is required']
        },
        isp: {
            type: String,
            required: [true, 'ISP is required'],
            trim: true
        },
        timezone: {
            type: String,
            required: [true, 'Timezone is required'],
            trim: true
        }
    },
    {
        timestamps: true
    }
);

const Geolocation = mongoose.model<IGeolocation>('Geolocation', geolocationSchema);

export default Geolocation;