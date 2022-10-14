import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  title: String,
  author:  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  content: String,
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ]
});

feedbackSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

export default mongoose.model('FeedbackBlog', feedbackSchema);
