import mongoose ,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new Schema(
  {
    videoFile: {
      type: String, //Cloudinary URL
      required: [true, "Video file is required"],
    },
    thumbnail: {
      type: String, //Cloudinary URL
      required: [true, "Thumbnail is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required"],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
    },
    duration: {
      type: Number, //Cloudinary file information
      required: [true, "Duration is required"],
    },
    views: {
      type: Number,
      default: 0,
    },
    // likes:[{
    //     type:Schema.Types.ObjectId,
    //     ref:"User"
    // }],
    // comments:[{
    //     type:Schema.Types.ObjectId,
    //     ref:"Comment"
    // }]
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

videoSchema.plugin(mongooseAggregatePaginate);


export  const Video=mongoose.model("Video",videoSchema)